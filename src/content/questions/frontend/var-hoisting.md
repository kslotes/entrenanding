---
title: ¿Qué imprime este código?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
language: javascript
code: |
  console.log(x);
  var x = 5;
  console.log(x);
expectedOutput: |-
  undefined
  5
---

Imprime `undefined` y `5`.

La declaración `var x` se eleva (hoisting) al inicio de su función o script, y la variable empieza valiendo `undefined`. La **asignación** `= 5` no se eleva: ocurre en su línea.

Con `let` o `const`, el primer `console.log` lanza `ReferenceError`: la variable existe desde el inicio del bloque, pero no se puede leer antes de su declaración (zona muerta temporal).
