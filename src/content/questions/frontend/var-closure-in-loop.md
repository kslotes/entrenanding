---
title: ¿Qué imprime este bucle?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr, ssr]
fundamentals: true
concepts: [js-closures, js-hoisting-and-scope]
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

Imprime `3` tres veces: con `var` hay **una sola** variable `i` para todo el bucle, los tres callbacks la comparten, y cuando por fin se ejecutan el bucle ya terminó y `i` vale `3`.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // las tres funciones capturan LA MISMA i
}
// línea de tiempo:
// 1) el bucle corre completo: i = 0, 1, 2, 3 (y sale)
// 2) solo entonces corren los callbacks: leen i, que vale 3 -> 3, 3, 3
```

**Por qué pasa:** se combinan dos cosas.

- **Closure:** cada callback recuerda la _variable_ `i`, no el valor que tenía al crearse. Cuando se ejecuta, lee el valor actual.
- **Alcance de `var`:** `var` pertenece a toda la función (o al script), no al bloque del `for`, así que no hay una `i` por vuelta: hay una sola.

Y el orden lo pone el event loop: el callback de `setTimeout` es una tarea que corre después de que termine el código en curso, aunque el retraso sea `0`.

**La solución:** usar `let`, que crea una variable nueva en cada iteración. Cada callback captura la suya:

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

Es el mismo bug que aparece al asignar handlers a botones dentro de un bucle con `var`: todos terminan usando el último índice.

**Las respuestas tentadoras:**

- `0`, `1`, `2`: es lo que imprime con `let`; con `var` los tres callbacks comparten la misma variable.
- `2`, `2`, `2`: el bucle sigue incrementando `i` hasta que la condición `i < 3` falla, así que termina valiendo `3`, no `2`.
