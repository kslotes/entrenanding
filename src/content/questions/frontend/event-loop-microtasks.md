---
title: ¿En qué orden se imprimen los mensajes?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr, ssr]
fundamentals: false
evidence:
  - type: interview-report
    url: https://leetcode.com/discuss/post/472235/livspace-frontend-sde-i-bangalore-decemb-3er1/
  - type: interview-report
    url: https://leetcode.com/discuss/post/8302947/buyucoin-founding-frontend-developer-apr-oo7u/
language: javascript
code: |
  console.log("a");
  setTimeout(() => console.log("b"), 0);
  Promise.resolve().then(() => console.log("c"));
  console.log("d");
expectedOutput: |-
  a
  d
  c
  b
---

Imprime `a`, `d`, `c`, `b`.

1. El código síncrono corre completo primero: `a` y `d`.
2. Al vaciarse la pila de llamadas, el event loop ejecuta **todas** las microtareas pendientes; el callback de `then` es una microtarea, así que sigue `c`.
3. Recién después toma la siguiente tarea (macrotarea), el callback de `setTimeout`: `b`.

Un `setTimeout` con 0 ms no significa "ya": significa "en una tarea posterior", después de las microtareas pendientes.
