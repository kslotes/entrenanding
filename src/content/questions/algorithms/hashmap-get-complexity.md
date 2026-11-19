---
title: ¿Cuál es la complejidad promedio de HashMap.get en Java?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [hash-tables]
options:
  - id: a
    text: O(1)
  - id: b
    text: O(log n)
  - id: c
    text: O(n)
  - id: d
    text: O(n log n)
answer: a
---

La respuesta es **O(1) en promedio**: `get` calcula el hash de la clave, salta directo al casillero (_bucket_) que le corresponde y solo compara las pocas entradas que hay ahí. La cantidad de pasos no depende de cuántos elementos tenga el mapa.

```java
Map<Long, Customer> byId = new HashMap<>();
// ... 10 000 clientes cargados

byId.get(4821L);
// 1) hashCode de 4821 -> número del bucket
// 2) va directo a ese bucket
// 3) compara con equals las pocas entradas que hay ahí
// Con 10 o con 10 millones de clientes, son los mismos pasos.
```

**La condición:** la documentación de `HashMap` promete tiempo constante _siempre que la función hash distribuya bien los elementos entre los buckets_. Si muchas claves caen en el mismo bucket (por ejemplo, un `hashCode` que siempre devuelve `7`), `get` tiene que recorrerlas todas y deja de ser constante. Además, el mapa crece solo cuando se llena (al superar el 75 % por defecto) para mantener pocos elementos por bucket.

**La consecuencia práctica:** cambiar una búsqueda en una lista (`O(n)`) por un `HashMap` es una de las mejoras de rendimiento más comunes, por ejemplo al cruzar pedidos con clientes por id. Y un `hashCode` malo no da errores: solo vuelve lento todo el mapa.

**Las otras opciones:**

- `O(log n)`: es buscar en un `TreeMap` (ordenado) o el peor caso de un bucket de `HashMap` convertido en árbol, no el promedio.
- `O(n)`: es el peor caso con todas las claves en el mismo bucket como lista, o buscar en una lista común.
- `O(n log n)`: es el costo de ordenar, no de buscar una clave.
