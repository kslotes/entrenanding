---
title: Debounce y throttle
stack: [javascript, typescript]
references:
  - title: "MDN Glossary: Debounce"
    url: https://developer.mozilla.org/en-US/docs/Glossary/Debounce
  - title: "MDN Glossary: Throttle"
    url: https://developer.mozilla.org/en-US/docs/Glossary/Throttle
  - title: "MDN: setTimeout()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
  - title: "MDN: JavaScript execution model"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
---

## El problema: una petición por cada tecla

Un buscador consulta al servidor cada vez que el usuario escribe:

```js
searchInput.addEventListener("input", (event) => {
  fetch(`/api/search?q=${event.target.value}`); // una petición por tecla
});
// escribir "react" dispara 5 peticiones: "r", "re", "rea", "reac", "react"
```

Cinco peticiones para una sola búsqueda. Con miles de usuarios, el backend recibe muchísimo tráfico inútil. Y peor: las respuestas pueden llegar desordenadas, y la de `"rea"` puede pisar en pantalla a la de `"react"`.

Algunos eventos se disparan muchísimas veces seguidas: `input` en cada tecla, `scroll` y `resize` decenas de veces por segundo, `mousemove` al arrastrar. Si cada uno dispara una petición o un recálculo de layout, la aplicación se vuelve lenta. **Debounce** y **throttle** limitan **cuántas veces** se ejecuta una función ante una ráfaga de llamadas.

## Primero, los términos

- **Evento**: algo que pasa en la página y a lo que el código puede responder: una tecla, un click, un scroll.
- **Handler**: la función que responde a un evento.
- **Ráfaga**: muchas llamadas seguidas en poco tiempo, como las teclas al escribir una palabra.
- **Timer**: una función programada para correr más tarde con `setTimeout`.
- **Debounce** ("antirrebote"): esperar a que las llamadas **se detengan** y ejecutar una sola vez al final.
- **Throttle** ("estrangular"): ejecutar **como máximo una vez cada cierto tiempo**, aunque las llamadas sigan llegando.
- **Closure**: una función que recuerda variables del lugar donde se creó. Las dos técnicas lo usan para guardar el timer entre llamadas; lo explica [la página de closures](./js-closures.md).

## Debounce

Ejecuta la función **una sola vez, cuando las llamadas se detienen** durante un tiempo de espera. Cada llamada nueva reinicia la espera.

```text
llamadas:   x  x x  x               x
ejecuta:                 ✓ (espera)          ✓
```

Caso típico: un buscador que consulta al servidor cuando el usuario deja de escribir, no en cada tecla. Normalmente se ejecuta con los argumentos de la **última** llamada, que son los que importan (`"react"`, no `"r"`).

Una implementación:

```js
function debounce(fn, waitMs) {
  let timerId; // el closure recuerda el timer pendiente entre llamadas

  function debounced(...args) {
    clearTimeout(timerId); // cada llamada cancela la espera anterior...
    timerId = setTimeout(() => {
      fn.apply(this, args); // ...y programa una nueva con los últimos argumentos
    }, waitMs);
  }

  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}

const search = debounce((query) => fetch(`/api/search?q=${query}`), 300);
searchInput.addEventListener("input", (event) => search(event.target.value));
// escribir "react" rápido: una sola petición, con "react", 300 ms después de la última tecla
```

Detalles que se suelen preguntar:

- **`...args`**: guarda los argumentos de la última llamada para pasárselos a `fn`.
- **`fn.apply(this, args)`**: llama a `fn` con el mismo `this` con el que se llamó a `debounced`. Por eso el callback del `setTimeout` es una arrow function: usa el `this` de `debounced`, no el del timer.
- **`clearTimeout`** con un timer que ya corrió o con `undefined` no hace nada, así que la primera llamada no necesita un caso especial.

## Throttle

Ejecuta la función **como máximo una vez por intervalo**, aunque las llamadas sigan llegando.

```text
llamadas:   x x x x x x x x x x x x
ejecuta:    ✓       ✓       ✓
```

Caso típico: actualizar algo durante el `scroll`, como una barra de progreso de lectura o cargar más resultados al acercarse al final. Quieres respuestas periódicas mientras dura la ráfaga, no esperar a que termine.

Una implementación simple, que ejecuta la primera llamada y descarta las que llegan durante el intervalo:

```js
function throttle(fn, intervalMs) {
  let lastRun = 0;

  return function throttled(...args) {
    const now = Date.now();
    if (now - lastRun >= intervalMs) {
      lastRun = now;
      fn.apply(this, args);
    }
    // si no pasó el intervalo, la llamada se descarta
  };
}

window.addEventListener(
  "scroll",
  throttle(() => updateReadingProgress(), 100), // como mucho 10 veces por segundo
);
```

Esta versión tiene un detalle: si la ráfaga termina justo dentro de un intervalo, la última llamada se pierde. Por ejemplo, la barra de progreso puede quedar en 95 % aunque llegaste al final. Las librerías suelen agregar una ejecución final con los últimos argumentos para cubrir ese caso.

| Pregunta                              | Debounce             | Throttle                  |
| ------------------------------------- | -------------------- | ------------------------- |
| ¿Ejecuta durante una ráfaga continua? | No                   | Sí, cada intervalo        |
| ¿Cuándo ejecuta?                      | Al final             | Al ritmo del intervalo    |
| Ejemplo                               | Búsqueda al escribir | Scroll, resize, arrastrar |

Una forma de recordarlo: el ascensor que espera a que deje de entrar gente antes de cerrar la puerta hace _debounce_; un semáforo que deja pasar autos cada cierto tiempo, aunque sigan llegando, hace _throttle_.

## setTimeout y clearTimeout

`setTimeout(callback, ms)` programa el callback para que corra **después de al menos** `ms` milisegundos, cuando el event loop lo tome; devuelve un identificador. `clearTimeout(id)` cancela un timer que todavía no corrió. Llamar a `clearTimeout` con un identificador que ya corrió o con `undefined` no hace nada.

El callback nunca interrumpe el código que se está ejecutando: JavaScript corre una tarea a la vez, y el callback espera su turno en la cola. Lo explica [la página del event loop](./js-event-loop.md).

## Cancelar

Es habitual exponer un `cancel()` para descartar la ejecución pendiente, por ejemplo cuando un componente se desmonta y la respuesta ya no le sirve a nadie. En React, eso va en la función de limpieza de un efecto:

```jsx
useEffect(() => {
  const onResize = debounce(() => setWidth(window.innerWidth), 200);
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    onResize.cancel(); // si quedaba una ejecución pendiente, no corre después de desmontar
  };
}, []);
```

## En la entrevista

### ¿Qué diferencia hay entre debounce y throttle? Da un caso de uso de cada uno.

Debounce espera a que las llamadas se detengan durante un tiempo y ejecuta una sola vez al final; cada llamada nueva reinicia la espera. Throttle ejecuta como máximo una vez por intervalo, aunque las llamadas sigan llegando. Debounce sirve para un buscador que consulta cuando el usuario deja de escribir; throttle, para actualizar algo durante el scroll o al arrastrar, donde quieres respuestas periódicas mientras dura la ráfaga.

### Implementa `debounce`.

```js
function debounce(fn, waitMs) {
  let timerId;
  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), waitMs);
  }
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}
```

Las preguntas que siguen suelen ser tres. Los **argumentos**: se guardan con `...args` y se usan los de la última llamada. El **`this`**: se conserva con `fn.apply(this, args)` dentro de una arrow function. **Cancelar**: se expone `cancel()`, que limpia el timer pendiente.

### ¿Por qué `setTimeout(fn, 0)` no ejecuta `fn` inmediatamente?

Porque `setTimeout` no llama a `fn`: la programa como una tarea para una vuelta posterior del event loop. Primero termina el código que se está ejecutando, después se vacían las microtareas (como los `then` de las promesas) y solo entonces le toca al timer. El `0` significa "lo antes posible", no "ahora".
