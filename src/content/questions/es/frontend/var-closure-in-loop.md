---
title: ¿Qué imprime este bucle?
locale: es
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr, ssr]
fundamentals: true
language: javascript
code: |
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
expectedOutput: |-
  3
  3
  3
---

Imprime `3` tres veces.

- `var` tiene alcance de función, así que los tres callbacks capturan la **misma** variable `i`.
- Los callbacks de `setTimeout` se ejecutan solo cuando el bucle ya terminó, y en ese momento `i` vale `3`.

Usar `let` lo corrige: `let` crea un enlace nuevo en cada iteración, por lo que la salida pasa a ser `0`, `1`, `2`.
