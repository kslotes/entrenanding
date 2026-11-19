---
title: ¿Cuál es la complejidad de quicksort en el peor caso?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr, ssr]
fundamentals: true
concepts: [quicksort]
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

La respuesta es **O(n²)**: ocurre cuando el **pivote** (el elemento que separa a los menores de los mayores en cada paso) es siempre el menor o el mayor del tramo. Cada partición separa un solo elemento y la recursión tiene `n` niveles en lugar de `log n`.

```text
[1, 2, 3, 4, 5] con el último elemento como pivote:
  pivote 5 -> [1, 2, 3, 4] 5     4 comparaciones, el lado derecho queda vacío
  pivote 4 -> [1, 2, 3] 4        3 comparaciones
  pivote 3 -> [1, 2] 3           2 comparaciones
  pivote 2 -> [1] 2              1 comparación
total: 4 + 3 + 2 + 1 = n(n - 1) / 2  ->  O(n²)
```

Con 1000 elementos son 499 500 comparaciones, contra unas 10 000 si las particiones salen parejas.

**Por qué pasa:** quicksort es rápido cuando cada partición divide el tramo en dos partes parecidas, porque entonces alcanzan unos `log n` niveles. Con un pivote fijo (siempre el primero o siempre el último), un arreglo ya ordenado o un arreglo ordenado al revés hacen que cada partición deje un lado vacío.

**La consecuencia práctica:** los datos ordenados o casi ordenados son comunes (registros ordenados por fecha, por ejemplo), así que un pivote fijo es un riesgo real. Elegir el pivote **al azar** hace que el peor caso dependa de la mala suerte y no de los datos, y el tiempo esperado es `O(n log n)` para cualquier entrada. En Java no hace falta: `Arrays.sort` para primitivos usa Dual-Pivot Quicksort, que según su documentación ofrece `O(n log n)` en todos los conjuntos de datos.

**Las otras opciones:**

- `O(n)`: un ordenamiento que compara elementos necesita, en el peor caso, del orden de `n log n` comparaciones, así que su peor caso nunca puede ser lineal.
- `O(n log n)`: es el caso promedio y el mejor caso, no el peor.
- `O(2ⁿ)`: es crecimiento exponencial, típico de probar todas las combinaciones; quicksort hace como mucho `n` niveles de trabajo lineal.
