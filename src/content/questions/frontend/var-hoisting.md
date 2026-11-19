---
title: ¿Qué imprime este código?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
concepts: [js-hoisting-and-scope]
language: javascript
code: |
  console.log(x);
  var x = 5;
  console.log(x);
expectedOutput: |-
  undefined
  5
---

Imprime `undefined` y `5`: la **declaración** `var x` se eleva al principio del script y la variable empieza valiendo `undefined`, pero la **asignación** `= 5` se queda en su línea.

```js
// Lo que escribes:
console.log(x);
var x = 5;
console.log(x);

// Cómo se comporta:
var x; // la declaración "sube": x existe y vale undefined
console.log(x); // undefined
x = 5; // la asignación ocurre aquí
console.log(x); // 5
```

**Por qué pasa:** antes de ejecutar un script o una función, JavaScript registra todas sus declaraciones. A eso se le llama _hoisting_ ("elevación"). Con `var`, la variable ya existe desde el principio con el valor `undefined`; solo la asignación espera a su línea.

**La consecuencia práctica:** con `var`, usar una variable antes de darle valor no da error: da `undefined`, que se propaga en silencio (por ejemplo, `precio * undefined` es `NaN`). Con `let` o `const`, el primer `console.log` lanza `ReferenceError: Cannot access 'x' before initialization`. La variable existe desde el inicio del bloque, pero no se puede leer antes de su declaración: es la _zona muerta temporal_. Ese error inmediato es justo lo que quieres, y por eso en código moderno se usa `let` y `const`.

**Las respuestas tentadoras:**

- `ReferenceError`: es lo que pasaría con `let` o `const`; con `var` la variable ya existe.
- `5` y `5`: supone que también se eleva la asignación, pero solo se eleva la declaración.
