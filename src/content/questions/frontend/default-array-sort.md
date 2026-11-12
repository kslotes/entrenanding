---
title: ¿Qué imprime este ordenamiento?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
language: javascript
code: |
  const nums = [10, 9, 1];
  nums.sort();
  console.log(nums.join(","));
expectedOutput: |-
  1,10,9
---

Imprime `1,10,9`.

Sin una función de comparación, `sort` convierte los elementos a string y los compara como texto: `"10"` va antes que `"9"` porque `"1"` va antes que `"9"`.

Para números hay que pasar un comparador: `nums.sort((a, b) => a - b)` da `1,9,10`. Además, `sort` modifica el arreglo original; `toSorted` devuelve una copia ordenada.
