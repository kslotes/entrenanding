---
title: ¿Qué imprimen estas comparaciones?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
language: javascript
code: |
  console.log(null == undefined);
  console.log(null === undefined);
expectedOutput: |-
  true
  false
---

Imprime `true` y `false`.

- `==` (igualdad débil) considera iguales a `null` y `undefined` entre sí, y a ningún otro valor.
- `===` (igualdad estricta) no convierte tipos: `null` y `undefined` son tipos distintos, así que da `false`.

Por eso `value == null` es un atajo común para preguntar "¿es `null` o `undefined`?". Fuera de ese caso, conviene usar `===`.
