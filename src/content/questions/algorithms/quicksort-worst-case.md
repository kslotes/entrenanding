---
title: ¿Cuál es la complejidad de quicksort en el peor caso?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: O(n)
  - id: b
    text: O(n log n)
  - id: c
    text: O(n²)
  - id: d
    text: O(2ⁿ)
answer: c
---

**O(n²)**. Ocurre cuando el pivote elegido es siempre el menor o el mayor elemento: cada partición separa un solo elemento y la recursión tiene `n` niveles en lugar de `log n`.

Con un pivote fijo (por ejemplo, siempre el primer elemento), un arreglo que ya está ordenado provoca justo ese caso. En promedio quicksort es O(n log n); elegir el pivote al azar vuelve muy improbable el peor caso para cualquier entrada.
