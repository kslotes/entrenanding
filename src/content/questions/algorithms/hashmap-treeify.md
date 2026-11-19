---
title: Desde Java 8, ¿qué hace HashMap cuando un bucket acumula muchas colisiones?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [ssr, sr]
fundamentals: true
concepts: [hash-tables]
options:
  - id: a
    text: Lanza una excepción
  - id: b
    text: Convierte la lista del bucket en un árbol
  - id: c
    text: Descarta la entrada más antigua
  - id: d
    text: Cambia la función hash de las claves
answer: b
---

La respuesta es **convierte la lista del bucket en un árbol**: un árbol balanceado (nodos `TreeNode`, parecido a un `TreeMap`). Así, buscar dentro de un bucket con muchas colisiones pasa de `O(n)` a `O(log n)`.

- **Bucket**: cada casillero del arreglo interno del `HashMap`; el hash de la clave decide en cuál cae.
- **Colisión**: dos claves distintas en el mismo bucket.
- **Árbol balanceado**: una estructura en la que cada paso de búsqueda descarta una parte grande de los nodos, como una búsqueda binaria.

```java
record BadKey(int id) implements Comparable<BadKey> {
  @Override
  public int hashCode() {
    return 7; // todas las claves caen en el mismo bucket
  }

  @Override
  public int compareTo(BadKey other) {
    return Integer.compare(id, other.id); // el árbol usa este orden para ubicar las claves
  }
}

Map<BadKey, String> m = new HashMap<>();
for (int i = 0; i < 1000; i++) m.put(new BadKey(i), "v" + i);
m.get(new BadKey(500));
// Antes de Java 8: recorre una lista de hasta 1000 nodos.
// Desde Java 8: busca en un árbol, unas 10 comparaciones.
```

El árbol ordena por hash; si los hashes empatan, como aquí, necesita otra forma de ordenar las claves. Si implementan `Comparable` la usa. Si no, no puede decidir hacia qué lado buscar y en el peor caso vuelve a recorrer todos los nodos.

**Cuándo pasa:** en el código de OpenJDK lo controlan dos constantes:

- `TREEIFY_THRESHOLD = 8`: al agregar a un bucket que ya tiene 8 nodos, ese bucket pasa a ser un árbol.
- `MIN_TREEIFY_CAPACITY = 64`: si la tabla tiene menos de 64 buckets, en lugar de crear el árbol se agranda la tabla, porque en una tabla chica las colisiones suelen deberse a que hay pocos buckets.

**Por qué existe:** el cambio viene del JEP 180 y protege el rendimiento cuando las claves colisionan mucho, ya sea por un `hashCode` malo o por claves que casualmente dan el mismo hash. Es una red de seguridad: un buen `hashCode` sigue siendo lo que mantiene `get` en `O(1)`.

**Las otras opciones:**

- Lanza una excepción: las colisiones son normales y nunca son un error.
- Descarta la entrada más antigua: un `HashMap` nunca pierde entradas; eso es lo que hace una caché con límite de tamaño, como un `LinkedHashMap` configurado para eso.
- Cambia la función hash de las claves: el hash lo define cada clase en `hashCode()`; `HashMap` solo mezcla sus bits siempre de la misma forma.
