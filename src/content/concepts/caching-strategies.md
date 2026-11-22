---
title: Estrategias de caché (cache-aside, invalidación y TTL)
stack: []
references:
  - title: "Azure Architecture Center: Cache-Aside pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside
  - title: "Amazon ElastiCache: Caching strategies (lazy loading, write-through, TTL)"
    url: https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html
  - title: "AWS whitepaper: Database caching strategies using Redis"
    url: https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html
  - title: "Redis: SET"
    url: https://redis.io/docs/latest/commands/set/
  - title: "Redis: EXPIRE"
    url: https://redis.io/docs/latest/commands/expire/
  - title: "Scaling Memcache at Facebook (NSDI 2013)"
    url: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf
---

## El problema: la misma consulta mil veces por segundo

Una tienda publica una oferta y miles de personas abren la misma página de producto. Cada visita ejecuta la misma consulta:

```java
@GetMapping("/products/{id}")
public Product get(@PathVariable long id) {
  return products.findById(id).orElseThrow(); // 1000 visitas por segundo = 1000 consultas iguales
}
```

El producto casi nunca cambia, pero la base de datos responde mil veces la misma pregunta. Se satura, las respuestas tardan, y escalar la base de datos es caro. La solución habitual es guardar la respuesta en un lugar mucho más rápido y preguntarle a la base solo cuando hace falta: una **caché**.

## Primero, los términos

- **Caché**: un almacén rápido (normalmente en memoria, como Redis o Memcached) que guarda copias de datos que viven en otro lado.
- **Fuente de verdad**: el lugar donde vive el dato "oficial", aquí la base de datos. La caché es solo una copia; si se pierde, se reconstruye.
- **Clave**: el nombre con el que guardas y buscas una copia, por ejemplo `product:42`.
- **Hit** (acierto): el dato está en la caché y se devuelve sin tocar la base.
- **Miss** (fallo): el dato no está en la caché y hay que buscarlo en la base.
- **Dato obsoleto** (_stale_): una copia en la caché que ya no coincide con la base, porque alguien cambió el dato después de guardarla.
- **Invalidar**: borrar (o marcar como inválida) una copia para que la próxima lectura busque el dato actualizado.
- **TTL** (_time to live_, tiempo de vida): cuánto tiempo vive una copia antes de que la caché la borre sola.
- **Expulsión** (_eviction_): la caché borra copias por su cuenta cuando se queda sin memoria.

En los ejemplos se usa esta interfaz simplificada; en Redis equivale a los comandos `GET`, `SET` con `EX` y `DEL`:

```java
interface Cache {
  Optional<Product> get(String key);
  void set(String key, Product value, Duration ttl);
  void delete(String key);
}
```

## Cache-aside: la aplicación llena la caché bajo demanda

En el patrón **cache-aside** (también llamado _lazy loading_) la caché no sabe nada de la base de datos. Es la **aplicación** la que decide: primero pregunta a la caché y, si no está, lee la base y guarda la copia.

```java
public Product get(long id) {
  String key = "product:" + id;
  return cache.get(key).orElseGet(() -> {           // 1) ¿está en la caché? hit -> se devuelve
    Product product = products.findById(id).orElseThrow(); // 2) miss: la aplicación lee la base
    cache.set(key, product, Duration.ofMinutes(10));        // 3) guarda la copia para los próximos
    return product;
  });
}
```

La primera visita paga el miss; las siguientes 999 son hits. Ventajas que señala la documentación de ElastiCache:

- **Solo se cachea lo que alguien pide.** La mayoría de los datos nunca se leen, así que no ocupan memoria.
- **Si la caché se cae o se vacía, la aplicación sigue funcionando**: todo es miss y lee de la base, más lento pero correcto.

La desventaja: cada miss cuesta tres viajes (caché, base, caché), y el dato puede quedar obsoleto si cambia en la base. Eso último se resuelve al escribir.

## Al escribir: actualizar la base y después borrar la clave

Cuando cambias un producto, la copia de la caché queda vieja. El patrón indica escribir primero en la base y después **invalidar** la entrada:

```java
public void changePrice(long id, BigDecimal price) {
  products.updatePrice(id, price); // 1) la fuente de verdad primero
  cache.delete("product:" + id);   // 2) se borra la copia; la próxima lectura la recarga
}
```

### ¿Por qué borrar y no escribir el valor nuevo?

Parece más eficiente hacer `cache.set(key, productoNuevo)`. El problema aparece con dos escrituras al mismo tiempo:

```text
t1  A: UPDATE price = 10 en la base
t2  B: UPDATE price = 12 en la base     -> la base queda en 12
t3  B: cache.set(price = 12)
t4  A: cache.set(price = 10)            -> la caché queda en 10, la base en 12
```

A llegó tarde a la caché y pisó el valor correcto. Nadie vuelve a tocar esa clave, así que el precio incorrecto se sirve hasta que venza el TTL. Con `delete` las dos escrituras hacen lo mismo, borrar, y el orden deja de importar: la próxima lectura trae 12 de la base. El paper de Facebook sobre Memcache lo resume así: eligen borrar en lugar de actualizar porque **los borrados son idempotentes** (repetirlos da el mismo resultado).

Otra ventaja: no calculas ni serializas un valor que quizá nadie vuelva a leer.

### ¿Por qué el orden importa?

Si borras la clave **antes** de actualizar la base, se abre una ventana:

```text
t1  escritor: cache.delete
t2  lector:   miss -> lee la base (todavía el precio viejo) -> cache.set(viejo)
t3  escritor: UPDATE en la base
```

La caché queda con el valor viejo justo después de la actualización. La documentación de Azure lo advierte de forma explícita: actualiza la base antes de borrar la copia.

## El TTL como red de seguridad

Aun haciendo todo bien, hay casos raros en los que la caché queda obsoleta: un proceso que cambia la base sin pasar por tu código, un `delete` que falla por un corte de red, o un lector lento que guarda un valor leído antes de la escritura. Por eso cada copia lleva un **TTL**: aunque nadie la invalide, la caché la borra sola y el error dura como mucho ese tiempo.

```text
SET product:42 "{...}" EX 600   # en Redis: la clave vence a los 600 segundos
```

Elegir el TTL es un compromiso. Muy corto: muchos misses y vuelves a cargar la base. Muy largo: un dato obsoleto dura más. Un precio puede tolerar segundos; un catálogo de países, días.

## Cache-aside frente a write-through

| Estrategia        | Al leer                             | Al escribir                                      | Riesgo principal                                    |
| ----------------- | ----------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| **Cache-aside**   | La app carga la caché en cada miss  | La app escribe la base y borra la clave          | Un miss tras cada escritura; datos obsoletos breves |
| **Write-through** | Hit para todo lo que ya se escribió | La app escribe la base y la caché en cada cambio | La caché se llena de datos que quizá nadie lea      |

Las dos se combinan a menudo con TTL. Write-through deja la caché al día en cada escritura; cache-aside es más simple y no desperdicia memoria.

## En la entrevista

### ¿Cómo funciona el patrón cache-aside?

La aplicación consulta primero la caché. Si el dato está (hit), lo devuelve. Si no está (miss), lo lee de la base, lo guarda en la caché con un TTL y lo devuelve. La caché no habla con la base: toda la lógica está en tu código. Al escribir, la aplicación actualiza la base y borra la clave para que la próxima lectura traiga el dato nuevo.

### ¿Por qué invalidar la clave en lugar de escribir el valor nuevo en la caché?

Porque con escrituras concurrentes el orden en que llegan a la caché puede ser distinto del orden en la base, y un valor viejo puede pisar al nuevo y quedarse hasta que venza el TTL. Borrar es idempotente: dos borrados dejan la caché igual, y la próxima lectura carga el valor real desde la base. Además no calculas un valor que quizá nadie lea.

### Si invalidas en cada escritura, ¿para qué sirve el TTL?

Es la red de seguridad. Un `delete` puede fallar, otro sistema puede cambiar la base sin pasar por tu código, o un lector lento puede guardar un valor viejo. El TTL garantiza que cualquier copia incorrecta desaparece sola en un tiempo acotado. También libera memoria de claves que nadie vuelve a pedir.
