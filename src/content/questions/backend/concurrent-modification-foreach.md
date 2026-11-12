---
title: Con la lista [1, 2, 3, 4], este método lanza ConcurrentModificationException. Encuentra el error
type: spot-the-bug
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
language: java
code: |
  static void removeEven(List<Integer> numbers) {
      for (Integer n : numbers) {
          if (n % 2 == 0) {
              numbers.remove(n);
          }
      }
  }
bugLine: 4
---

El for-each usa un `Iterator` por debajo. `numbers.remove(n)` modifica la lista sin pasar por ese iterador, y en la siguiente vuelta el iterador detecta el cambio y lanza `ConcurrentModificationException`.

Peor aún: la detección no está garantizada. Con `[1, 2, 3]`, quitar el `2` hace que el bucle termine sin revisar el `3` y sin lanzar nada.

Soluciones:

- `numbers.removeIf(n -> n % 2 == 0)`.
- Recorrer con un `Iterator` explícito y llamar a `iterator.remove()`.
