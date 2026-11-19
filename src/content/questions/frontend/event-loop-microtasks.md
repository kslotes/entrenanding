---
title: ¿En qué orden se imprimen los mensajes?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr, ssr]
fundamentals: false
concepts: [js-event-loop]
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

Imprime `a`, `d`, `c`, `b`: primero corre todo el código síncrono; después, **todas** las microtareas (el `then`); y solo entonces la siguiente tarea (el `setTimeout`).

```js
console.log("a"); // 1) síncrono: se imprime ya
setTimeout(() => console.log("b"), 0); //    se agenda como TAREA para una vuelta posterior
Promise.resolve().then(() => console.log("c")); //    se agenda como MICROTAREA
console.log("d"); // 2) síncrono: se imprime ya
// 3) terminó el script: se vacían las microtareas -> "c"
// 4) siguiente vuelta del event loop: la tarea del timer -> "b"
```

**Por qué pasa:** JavaScript ejecuta una cosa a la vez, y el _event loop_ decide qué corre después. Hay dos colas:

- **Tareas** (macrotareas): el callback de `setTimeout`, un click, ejecutar un script. Corre **una** por vuelta del loop.
- **Microtareas**: los callbacks de `then`/`catch`/`finally` y lo que sigue a un `await`. Después de cada tarea se ejecutan **todas** las pendientes.

El script entero es la primera tarea. Cuando termina se vacían las microtareas (`c`), y solo en la vuelta siguiente le toca a la tarea del timer (`b`).

**La consecuencia práctica:** `setTimeout(fn, 0)` no significa "ya": significa "en una tarea posterior", después del código en curso y de las microtareas pendientes. Por eso un timer de `0` ms puede tardar mucho más si la página está ocupada, y por eso el código que sigue a un `await` corre antes que un timer registrado antes.

**Las respuestas tentadoras:**

- `a`, `b`, `c`, `d`: supone que todo corre en el orden en que está escrito; los callbacks nunca interrumpen el código síncrono.
- `a`, `d`, `b`, `c`: supone que el timer va primero porque se registró antes, pero las microtareas se vacían antes de la siguiente tarea.
