---
title: ¿Cuál es la complejidad temporal de la búsqueda binaria sobre un arreglo ordenado?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr]
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
answer: b
---

**O(log n)**. Cada comparación descarta la mitad del intervalo que queda, así que con `n` elementos alcanzan unas `log₂ n` iteraciones: un millón de elementos se resuelve en unas 20 comparaciones.

Requisito: el arreglo debe estar ordenado. Si hay que ordenarlo antes, ese paso (O(n log n)) domina el costo de una sola búsqueda.
