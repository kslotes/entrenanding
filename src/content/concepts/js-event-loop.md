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

## El problema: la página que se congela

Un botón exporta un reporte, y mientras tanto quieres mostrar "Procesando...":

```js
button.addEventListener("click", () => {
  status.textContent = "Procesando...";
  const report = buildHugeReport(); // un cálculo síncrono de 3 segundos
  status.textContent = "Listo";
});
```

El usuario nunca ve "Procesando...". Durante esos 3 segundos la página no responde: no se puede hacer scroll, los otros botones no reaccionan y el texto salta directo a "Listo". Y en otro lado del código, un `setTimeout(fn, 0)` que debería correr "ya" se ejecuta después de un `then` escrito más abajo.

Las dos cosas tienen la misma explicación: JavaScript ejecuta **una cosa a la vez**, y el **event loop** decide qué corre después y cuándo se actualiza la pantalla.

## Primero, los términos

- **Hilo**: una secuencia de ejecución. El código JavaScript de una página corre en un solo hilo: no puede ejecutar dos funciones en paralelo.
- **Síncrono**: código que se ejecuta de principio a fin sin pausas. **Asíncrono**: código que se programa para correr más tarde (un timer, una respuesta de red).
- **Pila de llamadas** (_call stack_): las funciones que se están ejecutando ahora, una llamando a la otra.
- **Callback**: una función que se entrega para que se llame más tarde.
- **Promesa**: un objeto que representa un resultado que llegará en el futuro; `then` registra qué hacer cuando llegue.
- **Tarea** (o macrotarea): una unidad de trabajo pendiente, como el callback de un `setTimeout` o de un click.
- **Microtarea**: una unidad de trabajo pendiente con más prioridad, como el callback de un `then`.
- **Render**: cuando el navegador vuelve a dibujar la pantalla con los cambios del DOM.

## Una cosa a la vez

JavaScript ejecuta tu código en un solo hilo, con una **pila de llamadas**. Un trabajo que empieza corre hasta terminar: ningún callback lo interrumpe a la mitad. Lo que queda pendiente (un timer, una respuesta de red, un evento de click) espera en una cola hasta que la pila se vacía.

El **event loop** es el ciclo que decide qué trabajo pendiente corre a continuación. Como el render también tiene que esperar su turno, un handler que tarda 3 segundos bloquea la pantalla esos 3 segundos: el "Procesando..." se escribió en el DOM, pero el navegador no tuvo oportunidad de dibujarlo.

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

```text
┌─> 1 tarea ──> todas las microtareas ──> render (si toca) ─┐
└───────────────────────────────────────────────────────────┘
```

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

Paso a paso: el script (tarea 1) registra el timer como tarea futura, encola `micro 1` e imprime `sync`. Al terminar el script se vacían las microtareas: `micro 1`, que encola `micro 2`, que también corre en esta vuelta. Solo en la vuelta siguiente le toca a la tarea del timer.

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

Por qué existe la diferencia: las microtareas son para "terminar lo que estaba haciendo" antes de que pase cualquier otra cosa. Así el código que sigue a una promesa resuelta corre lo antes posible, sin que un click o un timer se metan en el medio.

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

Esto importa al leer código: todo lo que está después de un `await` corre **más tarde**, aunque esté escrito en la línea siguiente. Mientras una función espera un `fetch`, el resto de la página sigue funcionando, porque la pila queda libre.

## Los timers esperan su turno

El retraso de `setTimeout` no es exacto: puede tardar **más** de lo pedido. El callback se encola como tarea cuando vence el tiempo y corre cuando el loop llega a él, después del código en curso y de las microtareas pendientes. Por eso un trabajo síncrono largo, o una cadena de microtareas que nunca se vacía, retrasa los timers y bloquea la pantalla.

```js
setTimeout(() => console.log("timer"), 0);
const start = Date.now();
while (Date.now() - start < 2000) {} // 2 segundos ocupando la pila
// "timer" aparece después de 2 segundos, no de 0 ms
```

### Cómo arreglar la página congelada

La idea es no ocupar la pila durante mucho tiempo seguido. Dos formas habituales:

```js
// 1. Partir el trabajo en pedazos y ceder el turno entre ellos.
async function buildReportInChunks(rows) {
  const result = [];
  for (let i = 0; i < rows.length; i += 1000) {
    result.push(...rows.slice(i, i + 1000).map(toReportLine));
    await new Promise((resolve) => setTimeout(resolve, 0)); // nueva tarea: el navegador puede dibujar
  }
  return result;
}

// 2. Mover el cálculo a un Web Worker, que corre en otro hilo.
```

Fíjate que ceder con `await Promise.resolve()` **no** sirve: la continuación es una microtarea, y las microtareas se vacían antes del render. Hace falta una tarea nueva, como la de `setTimeout`.

## En la entrevista

### ¿Qué diferencia hay entre una tarea y una microtarea? Da ejemplos de cada una.

Una **tarea** es trabajo como ejecutar un script, atender un click o el callback de `setTimeout`; el event loop ejecuta una por vuelta. Una **microtarea** es el callback de `then`/`catch`/`finally`, de `queueMicrotask` o la continuación de un `await`; después de cada tarea se ejecutan **todas** las microtareas pendientes, antes de la siguiente tarea y del render. Por eso un `then` corre antes que un `setTimeout(fn, 0)` registrado antes.

```js
setTimeout(() => console.log("tarea"), 0);
Promise.resolve().then(() => console.log("microtarea"));
// microtarea
// tarea
```

### ¿Cuándo se ejecuta el código que sigue a un `await`?

En una microtarea, después de que la función devolvió el control a quien la llamó y el código síncrono en curso terminó. Pasa aunque lo esperado no sea una promesa o ya esté resuelto: `await null` también pausa. Por eso, en `load(); console.log("after")`, lo que hay después del `await` dentro de `load` se imprime después de `"after"`.

### ¿Por qué un bucle síncrono largo congela la página?

Porque JavaScript tiene un solo hilo y una tarea corre hasta terminar. Mientras el bucle ocupa la pila, el event loop no puede atender clicks, ejecutar timers ni dejar que el navegador redibuje la pantalla. Se arregla partiendo el trabajo en pedazos que ceden el turno con una tarea nueva (`setTimeout`) o moviéndolo a un Web Worker.
