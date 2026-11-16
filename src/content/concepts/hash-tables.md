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
---

## Cómo funciona una tabla hash

Una tabla hash guarda los pares clave-valor en un arreglo de **buckets**. Para ubicar una clave:

1. Calcula un número a partir de la clave (en Java, `hashCode()`).
2. Convierte ese número en un índice del arreglo.
3. Dentro de ese bucket, compara con `equals` hasta encontrar la clave.

En el código de OpenJDK, `HashMap` mezcla los bits altos con los bajos (`h ^ (h >>> 16)`) y luego toma el índice con `(n - 1) & hash`, donde `n` es la cantidad de buckets, que siempre es una potencia de 2:

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

Dos claves distintas en el mismo bucket son una **colisión**. No es un error: el bucket guarda varias entradas y `equals` las distingue.

## Costo de las operaciones

La documentación de `HashMap` promete tiempo constante para `get` y `put` **siempre que la función hash distribuya bien los elementos entre los buckets**. Esa condición es la parte importante:

- Si las claves se reparten bien, cada bucket tiene pocas entradas y la búsqueda no depende del tamaño del mapa.
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

## Factor de carga y redimensionamiento

El **factor de carga** mide qué tan llena puede estar la tabla antes de que su capacidad aumente automáticamente. Por defecto vale 0.75, que según la documentación es un buen equilibrio entre tiempo y espacio. Cuando la cantidad de entradas supera `capacidad * factor de carga`, la tabla se reconstruye con aproximadamente el doble de buckets y cada entrada se reubica. La capacidad inicial por defecto es 16 (`DEFAULT_INITIAL_CAPACITY` en el código fuente).

Ese reconstruir es caro, pero ocurre cada vez menos seguido a medida que la tabla crece. Si conoces de antemano cuántos elementos vas a guardar, pasar una capacidad inicial adecuada evita los redimensionamientos.

## Buckets con muchas colisiones

Desde Java 8 (JEP 180), un bucket con muchas colisiones puede dejar de ser una lista enlazada y pasar a ser un **árbol balanceado**, lo que según el JEP mejora el peor caso de O(n) a O(log n). En el código de OpenJDK 21 lo controlan tres constantes:

| Constante              | Valor | Para qué sirve                                                                    |
| ---------------------- | ----- | --------------------------------------------------------------------------------- |
| `TREEIFY_THRESHOLD`    | 8     | Al agregar a un bucket que ya tiene esta cantidad de nodos, se usa un árbol.      |
| `UNTREEIFY_THRESHOLD`  | 6     | Al redimensionar, un árbol con esta cantidad de nodos o menos vuelve a ser lista. |
| `MIN_TREEIFY_CAPACITY` | 64    | Con menos buckets, la tabla se agranda en lugar de usar un árbol.                 |

Cuando las claves implementan `Comparable`, `HashMap` puede usar ese orden para desempatar dentro del árbol.

## En la entrevista

- ¿Qué pasos sigue `HashMap` para encontrar una clave?
- ¿Cuándo deja de ser constante el costo de `get`?
- ¿Qué es el factor de carga y qué pasa cuando se supera?
- ¿Qué cambió en Java 8 para los buckets con muchas colisiones?
