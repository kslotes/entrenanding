---
title: Tablas hash y HashMap
stack: [java]
references:
  - title: "HashMap (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html
  - title: "OpenJDK 21: HashMap.java"
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/HashMap.java
  - title: "JEP 180: Handle Frequent HashMap Collisions with Balanced Trees"
    url: https://openjdk.org/jeps/180
  - title: "HashMap.newHashMap (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html#newHashMap(int)
---

## El problema: buscar en una lista es lento

Tienes 50 000 pedidos y 10 000 clientes, y para cada pedido necesitas el nombre de su cliente:

```java
for (Order order : orders) {
  for (Customer customer : customers) {      // recorre la lista de clientes...
    if (customer.id().equals(order.customerId())) {
      order.setCustomerName(customer.name());
      break;
    }
  }
}
// ...por cada pedido: hasta 50 000 x 10 000 = 500 millones de comparaciones
```

El problema es que buscar en una lista obliga a mirar los elementos uno por uno. Una **tabla hash** (en Java, `HashMap`) resuelve "dame el cliente con este id" en una cantidad de pasos que, en promedio, **no depende de cuántos clientes haya**:

```java
Map<Long, Customer> byId = new HashMap<>();
for (Customer c : customers) byId.put(c.id(), c); // 10 000 inserciones

for (Order order : orders) {
  Customer customer = byId.get(order.customerId()); // un salto directo, no un recorrido
  order.setCustomerName(customer.name());
}
// unas 60 000 operaciones en total
```

Es el mismo motivo por el que un mapa aparece en cachés, para contar repeticiones (`palabra -> cantidad`), para quitar duplicados (`HashSet` usa un `HashMap` por dentro) y en casi cualquier "buscar por id".

## Primero, los términos

- **Clave y valor**: un mapa guarda pares. La clave es lo que usas para buscar (el id) y el valor es lo que obtienes (el cliente).
- **Hash** o **`hashCode()`**: un número `int` que se calcula a partir de la clave. Dos claves iguales siempre dan el mismo hash.
- **Bucket**: cada casillero del arreglo interno de la tabla. Cada entrada se guarda en el bucket que indica su hash.
- **Colisión**: dos claves distintas que caen en el mismo bucket.
- **Lista enlazada**: una cadena de nodos donde cada uno apunta al siguiente. Para encontrar algo hay que recorrerla desde el principio.
- **Árbol balanceado**: una estructura donde cada nodo tiene hijos menores y mayores, y su altura se mantiene baja. Buscar en ella cuesta `O(log n)` en lugar de `O(n)`.
- **O(1)**: tiempo constante, que no crece con la cantidad de datos. **O(n)**: crece igual que la cantidad de datos.
- **Capacidad**: la cantidad de buckets del arreglo.

## Cómo funciona una tabla hash

Para ubicar una clave, la tabla sigue tres pasos:

1. Calcula un número a partir de la clave (en Java, `hashCode()`).
2. Convierte ese número en un índice del arreglo: ese es el bucket.
3. Dentro de ese bucket, compara con `equals` hasta encontrar la clave.

El paso 2 es lo que la hace rápida: va **directo** al bucket, sin mirar los demás. El paso 3 es necesario porque puede haber varias claves en el mismo bucket. Por eso `equals` y `hashCode` tienen que estar de acuerdo; lo explica [el contrato de equals y hashCode](./equals-hashcode-contract.md).

En el código de OpenJDK, `HashMap` mezcla los bits altos con los bajos (`h ^ (h >>> 16)`) y luego toma el índice con `(n - 1) & hash`, donde `n` es la cantidad de buckets, que siempre es una potencia de 2. Con `n = 16`, `(n - 1) & hash` se queda con los 4 bits más bajos, un número de 0 a 15:

```java
static int bucket(Object key, int capacity) {
  int h = key.hashCode();
  int spread = h ^ (h >>> 16); // la misma mezcla que HashMap.hash
  return (capacity - 1) & spread;
}

bucket("apple", 16);  // 1
bucket("banana", 16); // 0
bucket("cherry", 16); // 1: colisiona con "apple"
```

La mezcla existe para que los bits altos del hash también influyan: sin ella, dos hashes que solo difieren en los bits altos caerían siempre en el mismo bucket de una tabla chica.

Dos claves distintas en el mismo bucket son una **colisión**. No es un error: el bucket guarda varias entradas y `equals` las distingue.

## Costo de las operaciones

La documentación de `HashMap` promete tiempo constante para `get` y `put` **siempre que la función hash distribuya bien los elementos entre los buckets**. Esa condición es la parte importante:

- Si las claves se reparten bien, cada bucket tiene pocas entradas y la búsqueda no depende del tamaño del mapa: `O(1)` en promedio.
- Si muchas claves caen en el mismo bucket, hay que recorrer todas sus entradas. La propia documentación advierte que usar muchas claves con el mismo `hashCode()` es una forma segura de volver lenta cualquier tabla hash.

Un `hashCode` malo no rompe la corrección, solo el rendimiento:

```java
record BadKey(int id) {
  @Override
  public int hashCode() {
    return 7; // todas las claves colisionan
  }
}

Map<BadKey, String> m = new HashMap<>();
for (int i = 0; i < 1000; i++) m.put(new BadKey(i), "v" + i);
m.get(new BadKey(500)); // "v500": correcto, pero todo está en un solo bucket
```

El mapa funciona, pero cada `get` tiene que buscar entre las 1000 entradas de ese único bucket. En una app real esto se nota como un endpoint que se vuelve lento a medida que crecen los datos, sin ningún error en los logs.

## Factor de carga y redimensionamiento

Si una tabla de 16 buckets recibe un millón de entradas, cada bucket termina con miles y la búsqueda deja de ser rápida. Por eso la tabla **crece** sola.

El **factor de carga** mide qué tan llena puede estar la tabla antes de que su capacidad aumente automáticamente. Por defecto vale 0.75, que según la documentación es un buen equilibrio entre tiempo y espacio. Cuando la cantidad de entradas supera `capacidad * factor de carga`, la tabla se reconstruye con aproximadamente el doble de buckets y cada entrada se reubica. La capacidad inicial por defecto es 16 (`DEFAULT_INITIAL_CAPACITY` en el código fuente).

| Capacidad | Umbral (`capacidad * 0.75`) | Al superarlo, pasa a |
| --------- | --------------------------- | -------------------- |
| 16        | 12                          | 32                   |
| 32        | 24                          | 64                   |
| 64        | 48                          | 128                  |

Ese reconstruir es caro, pero ocurre cada vez menos seguido a medida que la tabla crece, así que repartido entre todas las inserciones el costo sigue siendo bajo. Si conoces de antemano cuántos elementos vas a guardar, crear el mapa con el tamaño adecuado evita los redimensionamientos. Desde Java 19, `HashMap.newHashMap(n)` calcula la capacidad necesaria para `n` elementos sin que tengas que hacer la cuenta con el factor de carga:

```java
Map<Long, Customer> byId = HashMap.newHashMap(customers.size()); // no se redimensiona al llenarlo
```

## Buckets con muchas colisiones

Desde Java 8 (JEP 180), un bucket con muchas colisiones puede dejar de ser una lista enlazada y pasar a ser un **árbol balanceado**, lo que según el JEP mejora el peor caso de `O(n)` a `O(log n)`. Con 1000 claves en el mismo bucket, eso es pasar de hasta 1000 comparaciones a unas 10, siempre que el árbol pueda ordenar las claves (ver abajo).

En el código de OpenJDK 21 lo controlan tres constantes:

| Constante              | Valor | Para qué sirve                                                                    |
| ---------------------- | ----- | --------------------------------------------------------------------------------- |
| `TREEIFY_THRESHOLD`    | 8     | Al agregar a un bucket que ya tiene esta cantidad de nodos, se usa un árbol.      |
| `UNTREEIFY_THRESHOLD`  | 6     | Al redimensionar, un árbol con esta cantidad de nodos o menos vuelve a ser lista. |
| `MIN_TREEIFY_CAPACITY` | 64    | Con menos buckets, la tabla se agranda en lugar de usar un árbol.                 |

Por qué existe `MIN_TREEIFY_CAPACITY`: en una tabla chica, muchas colisiones suelen deberse a que hay pocos buckets, no a un hash malo. Agrandar la tabla las reparte, que es más barato que construir un árbol.

El árbol ordena primero por hash. Si dos claves tienen el mismo hash y además implementan `Comparable`, `HashMap` usa ese orden para desempatar. Si no lo implementan, no sabe hacia qué lado buscar y en el peor caso vuelve a recorrer todos los nodos del bucket: el árbol no ayuda con claves que tienen exactamente el mismo hash y no son comparables. Aun así, el árbol es una red de seguridad: un buen `hashCode` sigue siendo lo que da el rendimiento normal.

## En la entrevista

### ¿Qué pasos sigue `HashMap` para encontrar una clave?

Calcula `hashCode()` de la clave, mezcla sus bits (`h ^ (h >>> 16)`) y lo convierte en un índice con `(n - 1) & hash`. Va directo a ese bucket y, dentro, compara con `equals` las entradas que haya hasta encontrar la clave. Si ninguna coincide, `get` devuelve `null`.

### ¿Cuándo deja de ser constante el costo de `get`?

Cuando muchas claves caen en el mismo bucket, normalmente por un `hashCode` que devuelve pocos valores distintos. Entonces hay que recorrer todas las entradas del bucket: `O(n)` si es una lista, o `O(log n)` desde Java 8 si se convirtió en árbol. Con un buen hash y el redimensionamiento automático, el promedio es `O(1)`.

```java
@Override
public int hashCode() {
  return 7; // todas las claves al mismo bucket: get deja de ser O(1)
}
```

### ¿Qué es el factor de carga y qué pasa cuando se supera?

Es la proporción de entradas por bucket que la tabla tolera antes de crecer; por defecto 0.75. Con la capacidad inicial de 16, al pasar de 12 entradas la tabla se reconstruye con 32 buckets y reubica cada entrada. Es una operación cara, pero poco frecuente; si sabes el tamaño de antemano, `HashMap.newHashMap(n)` la evita.

### ¿Qué cambió en Java 8 para los buckets con muchas colisiones?

Antes, cada bucket era siempre una lista enlazada, y el peor caso de una búsqueda era `O(n)`. Desde Java 8 (JEP 180), al agregar a un bucket que ya tiene 8 nodos, ese bucket se convierte en un árbol balanceado y el peor caso pasa a `O(log n)`. Si la tabla tiene menos de 64 buckets, en lugar de eso se agranda. Al redimensionar, un árbol que queda con 6 nodos o menos vuelve a ser lista.
