---
title: Event loop, tareas y microtareas
stack: [javascript, typescript]
references:
  - title: "MDN: JavaScript execution model"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
  - title: "MDN: Using microtasks in JavaScript with queueMicrotask()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
  - title: "MDN: await"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  - title: "MDN: setTimeout()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
  - title: "HTML Standard: Event loops"
    url: https://html.spec.whatwg.org/multipage/webappapis.html#event-loops
---

## Una cosa a la vez

JavaScript ejecuta tu código en un solo hilo, con una **pila de llamadas**. Un trabajo que empieza corre hasta terminar: ningún callback lo interrumpe a la mitad. Lo que queda pendiente (un timer, una respuesta de red, un evento de click) espera en una cola hasta que la pila se vacía.

El **event loop** es el ciclo que decide qué trabajo pendiente corre a continuación.

## Dos colas con distinta prioridad

El navegador separa el trabajo pendiente en dos tipos:

| Tipo               | Ejemplos                                                   |
| ------------------ | ---------------------------------------------------------- |
| Tarea (macrotarea) | ejecutar un `<script>`, un click del usuario, `setTimeout` |
| Microtarea         | callbacks de `then`/`catch`/`finally`, `queueMicrotask`    |

En cada vuelta del loop:

1. Se ejecuta **una** tarea, la más antigua que esté lista.
2. Se ejecutan **todas** las microtareas pendientes, hasta que la cola quede vacía. Si una microtarea agrega otra, esa también corre en esta misma vuelta.
3. El navegador puede actualizar la pantalla y pasa a la siguiente vuelta.

El script inicial cuenta como una tarea, así que al terminar también se vacían las microtareas.

```js
setTimeout(() => console.log("timer"), 0);
queueMicrotask(() => {
  console.log("micro 1");
  queueMicrotask(() => console.log("micro 2"));
});
console.log("sync");
// sync
// micro 1
// micro 2
// timer
```

Las microtareas de cada tarea se vacían antes de pasar a la siguiente tarea:

```js
setTimeout(() => {
  console.log("timer 1");
  Promise.resolve().then(() => console.log("micro of timer 1"));
}, 0);
setTimeout(() => console.log("timer 2"), 0);
// timer 1
// micro of timer 1
// timer 2
```

## async y await

Un `await` pausa la función y devuelve el control a quien la llamó. El resto de la función continúa en una **microtarea**, incluso si lo esperado no es una promesa o ya está resuelto:

```js
async function load() {
  console.log("load: start");
  await null;
  console.log("load: after await");
}
load();
console.log("after load()");
// load: start
// after load()
// load: after await
```

## Los timers esperan su turno

El retraso de `setTimeout` no es exacto: puede tardar **más** de lo pedido. El callback se encola como tarea cuando vence el tiempo y corre cuando el loop llega a él, después del código en curso y de las microtareas pendientes. Por eso un trabajo síncrono largo, o una cadena de microtareas que nunca se vacía, retrasa los timers y bloquea la pantalla.

## En la entrevista

- ¿Qué diferencia hay entre una tarea y una microtarea? Da ejemplos de cada una.
- ¿Cuándo se ejecuta el código que sigue a un `await`?
- ¿Por qué un bucle síncrono largo congela la página?
