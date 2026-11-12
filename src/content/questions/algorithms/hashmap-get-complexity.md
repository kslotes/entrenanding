---
title: ¿Cuál es la complejidad promedio de HashMap.get en Java?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
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

**O(1)** en promedio. La documentación de `HashMap` indica tiempo constante para `get` y `put`, siempre que la función hash distribuya bien los elementos entre los buckets.

Ese "siempre que" importa: si muchas claves caen en el mismo bucket, la búsqueda deja de ser constante. Por eso un `hashCode` de mala calidad degrada el rendimiento de todo el mapa.
