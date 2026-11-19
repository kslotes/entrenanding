---
title: Semántica de los métodos HTTP
stack: [http]
references:
  - title: "RFC 9110 9.2.1: Safe Methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1
  - title: "RFC 9110 9.2.2: Idempotent Methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
  - title: "RFC 9110 9.2.3: Methods and Caching"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.3
  - title: "RFC 9110 9.3.4: PUT"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.4
  - title: "RFC 9110 18.2: Method Registration"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-18.2
  - title: "RFC 5789: PATCH Method for HTTP"
    url: https://www.rfc-editor.org/rfc/rfc5789.html
  - title: "IETF draft: The Idempotency-Key HTTP Header Field"
    url: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
---

## El problema: el cobro doble

Un usuario aprieta "Pagar" en tu app. La petición llega al servidor, el servidor cobra la tarjeta, pero la respuesta se pierde por un corte de red. El cliente solo ve un error de tiempo agotado y reintenta:

```http
POST /payments   {"orderId": 42, "amount": 100}   -> cobra 100, la respuesta se pierde
POST /payments   {"orderId": 42, "amount": 100}   -> cobra 100 otra vez
```

El cliente no tiene forma de saber si la primera petición llegó. Reintentar puede cobrar dos veces; no reintentar puede dejar el pedido sin pagar. Para decidir cuándo es seguro repetir una petición, HTTP define propiedades para cada método. La más importante para este caso es la **idempotencia**.

## Primero, los términos

- **Método HTTP**: el verbo de la petición (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`...). Le dice al servidor qué tipo de operación pide el cliente.
- **Recurso**: la "cosa" que identifica la URL, por ejemplo `/orders/42` es el pedido 42.
- **Estado del servidor**: los datos que guarda, como los pedidos en la base de datos.
- **Timeout** (tiempo agotado): el cliente se cansa de esperar la respuesta. No sabe si el servidor procesó la petición o no.
- **Reintento**: volver a enviar la misma petición después de un fallo. Lo hacen tu código, las librerías HTTP y algunos intermediarios.
- **Proxy**: un intermediario entre el cliente y el servidor (un balanceador de carga, un gateway).
- **Caché**: una copia guardada de una respuesta para no pedirla de nuevo al servidor.

## Tres propiedades distintas

La RFC 9110 clasifica los métodos HTTP con propiedades que se confunden a menudo:

| Propiedad       | Qué garantiza                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Segura**      | La semántica es de solo lectura: el cliente no pide ni espera cambios de estado en el servidor.   |
| **Idempotente** | El efecto buscado de varias peticiones idénticas es el mismo que el de una sola.                  |
| **Cacheable**   | La definición del método permite guardar la respuesta y reutilizarla para peticiones posteriores. |

Para los métodos más usados:

| Método    | Seguro | Idempotente |
| --------- | ------ | ----------- |
| `GET`     | Sí     | Sí          |
| `HEAD`    | Sí     | Sí          |
| `OPTIONS` | Sí     | Sí          |
| `PUT`     | No     | Sí          |
| `DELETE`  | No     | Sí          |
| `POST`    | No     | No          |
| `PATCH`   | No     | No          |

`PATCH` viene de la RFC 5789. Todo método seguro es idempotente (leer diez veces no cambia nada), pero no al revés: `DELETE` cambia el estado y aun así es idempotente. En cuanto a la caché, `GET` y `HEAD` son cacheables; `POST` solo en casos especiales que casi nadie usa.

## Idempotente no significa "misma respuesta"

La idempotencia habla del **efecto en el servidor**, no del código de estado:

```http
DELETE /orders/42   -> 204 No Content   (el pedido se borra)
DELETE /orders/42   -> 404 Not Found    (ya no existe)
```

Las respuestas difieren, pero el estado final es el mismo: el pedido 42 no existe. La RFC lo dice de forma explícita: repetir la petición tiene el mismo efecto buscado aunque la respuesta pueda ser distinta.

Tampoco prohíbe efectos secundarios: el servidor puede registrar cada petición en un log o guardar un historial. Lo que importa es lo que el cliente pidió.

## Por qué importa: reintentos

La RFC distingue los métodos idempotentes porque una petición se puede **repetir automáticamente** si la conexión falla antes de leer la respuesta. Como repetirla tiene el mismo efecto, no importa si la primera llegó o no.

Para el resto de los métodos, la RFC indica que un cliente no debería reintentar automáticamente salvo que sepa que esa operación concreta es idempotente, y que un proxy no debe hacerlo. Por eso muchas librerías HTTP reintentan solas un `GET` o un `PUT` fallido, pero no un `POST`.

## La semántica depende de cómo diseñas la operación

Que un método sea idempotente es un contrato: **tu implementación tiene que respetarlo**. HTTP no lo verifica; si lo rompes, los reintentos automáticos causan bugs.

`PUT` pide que el estado del recurso **se cree o se reemplace** por lo que envías (RFC 9110 9.3.4). Enviar `{"stock": 10}` dos veces deja el stock en 10:

```java
@PutMapping("/products/{id}/stock")
public void setStock(@PathVariable long id, @RequestBody StockRequest body) {
  products.updateStock(id, body.stock()); // "el stock ES 10": repetirlo da el mismo resultado
}
```

Una operación del estilo "suma 1 al stock" **no** es idempotente: cada repetición cambia el resultado. Si la expones con `PUT`, rompes el contrato, y un reintento automático suma de más:

```java
@PutMapping("/products/{id}/stock/increment") // mal: PUT promete idempotencia
public void increment(@PathVariable long id) {
  products.addStock(id, 1); // cada reintento suma 1 más
}
```

Para esa operación corresponde `POST`, que no promete nada. `PATCH` (RFC 5789) aplica un conjunto de cambios parciales y la RFC lo define como ni seguro ni idempotente, aunque un `PATCH` concreto, como "poner el email en x", puede serlo.

### Hacer idempotente un POST

Para el cobro del principio, un patrón muy usado es que el cliente genere un identificador único por operación y lo mande en cada intento. Hay un borrador de la IETF que propone el header `Idempotency-Key` para esto:

```java
@PostMapping("/payments")
public Payment pay(@RequestHeader("Idempotency-Key") String key, @RequestBody PaymentRequest body) {
  return payments.findByKey(key)                // ¿ya procesé este intento?
      .orElseGet(() -> payments.charge(key, body)); // solo cobra la primera vez
}
```

El reintento llega con la misma clave, el servidor reconoce que ya cobró y devuelve el mismo pago en lugar de cobrar otra vez. En producción también hace falta una restricción única sobre la clave en la base de datos, para que dos intentos simultáneos no pasen los dos el `findByKey`.

## Seguro no es lo mismo que "inofensivo por accidente"

Si un `GET` dispara una acción, la RFC exige que el dueño del recurso la deshabilite para métodos seguros. Los crawlers de los buscadores y el prefetch de los navegadores hacen `GET` sobre cualquier enlace que encuentran:

```html
<!-- mal: un crawler que sigue este enlace borra el pedido -->
<a href="/orders/42/delete">Borrar</a>
```

```java
@DeleteMapping("/orders/{id}") // bien: borrar requiere un método no seguro
public void delete(@PathVariable long id) {
  orders.deleteById(id);
}
```

## En la entrevista

### ¿Qué diferencia hay entre un método seguro y uno idempotente?

**Seguro** significa de solo lectura: el cliente no pide cambiar nada (`GET`, `HEAD`, `OPTIONS`). **Idempotente** significa que repetir la petición deja el servidor igual que enviarla una vez, aunque sí cambie algo (`PUT`, `DELETE` y todos los seguros). Todo seguro es idempotente, pero no al revés: `DELETE /orders/42` borra el pedido (no es seguro) y repetirlo no borra nada más (es idempotente).

### Si un DELETE repetido devuelve 404, ¿deja de ser idempotente?

No. La idempotencia se mide por el efecto en el servidor, no por la respuesta. Después del primer `DELETE` el pedido no existe, y después del segundo sigue sin existir: mismo estado final. El `204` y el `404` son solo respuestas distintas, y la RFC lo permite de forma explícita.

### ¿Por qué la idempotencia importa al reintentar después de un timeout?

Porque después de un timeout el cliente no sabe si el servidor procesó la petición. Si el método es idempotente, reintentar es seguro: en el peor caso el efecto se aplica "otra vez" y el resultado es el mismo. Con `POST` un reintento puede duplicar un pedido o un cobro, por eso la RFC dice que no se reintenta automáticamente, salvo que la operación concreta sea idempotente, por ejemplo usando una clave de idempotencia.
