---
title: ¿Cuál es la complejidad temporal de la búsqueda binaria sobre un arreglo ordenado?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr]
fundamentals: true
concepts: [binary-search]
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

La respuesta es **O(log n)**: cada comparación descarta la mitad de los elementos que quedan, así que con `n` elementos alcanzan unas `log₂ n` comparaciones. Un millón de elementos se resuelve en unas 20.

```java
int[] prices = {3, 8, 15, 23, 42, 57, 61, 70}; // 8 elementos, ordenados
Arrays.binarySearch(prices, 61);
// mira 23 -> descarta la izquierda (quedan 4)
// mira 57 -> descarta la izquierda (quedan 2)
// mira 61 -> encontrado: 3 comparaciones, y log₂ 8 = 3
```

**Qué significa O(log n):** la notación _O grande_ describe cómo crece la cantidad de pasos cuando crecen los datos. `log₂ n` es cuántas veces puedes dividir `n` por 2 hasta llegar a 1. Duplicar los datos agrega **un solo paso**: de un millón a dos millones pasas de 20 a 21 comparaciones.

**La condición:** el arreglo tiene que estar ordenado; si no, el resultado no está definido. Si tienes que ordenarlo antes, ese paso cuesta `O(n log n)` y es más caro que una búsqueda lineal. La binaria conviene cuando los datos ya están ordenados o vas a buscar muchas veces.

**Las otras opciones:**

- `O(1)`: tiempo constante, sin importar `n`. Es acceder a una posición por índice, o en promedio el `get` de un `HashMap`; la búsqueda binaria hace más pasos cuanto más datos hay.
- `O(n)`: es la búsqueda lineal, que mira los elementos uno por uno.
- `O(n log n)`: es lo que cuesta ordenar con un buen algoritmo, no buscar.
