---
title: ¿Cuál es la complejidad de list.add(0, x) en un ArrayList de n elementos?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: O(1)
  - id: b
    text: O(1) amortizado
  - id: c
    text: O(log n)
  - id: d
    text: O(n)
answer: d
---

**O(n)**. `ArrayList` guarda los elementos en un arreglo, así que insertar en la posición 0 obliga a correr una posición todos los elementos existentes.

La documentación de `ArrayList` lo resume: `add` al final es O(1) amortizado, `get` y `set` son constantes, y el resto de las operaciones es lineal.

Si se inserta y se quita seguido en los extremos, `ArrayDeque` lo hace en tiempo constante amortizado.
