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

## El problema

Algunos eventos se disparan muchísimas veces seguidas: `input` en cada tecla, `scroll` y `resize` decenas de veces por segundo. Si cada evento dispara una búsqueda en el servidor o un recálculo de layout, la aplicación se vuelve lenta y el backend recibe pedidos inútiles.

Debounce y throttle limitan **cuántas veces** se ejecuta una función ante una ráfaga de llamadas.

## Debounce

Ejecuta la función **una sola vez, cuando las llamadas se detienen** durante un tiempo de espera. Cada llamada nueva reinicia la espera.

```text
llamadas:   x  x x  x               x
ejecuta:                 ✓ (espera)          ✓
```

Caso típico: un buscador que consulta al servidor cuando el usuario deja de escribir, no en cada tecla. Normalmente se ejecuta con los argumentos de la **última** llamada, que son los que importan ("rea", no "r").

## Throttle

Ejecuta la función **como máximo una vez por intervalo**, aunque las llamadas sigan llegando.

```text
llamadas:   x x x x x x x x x x x x
ejecuta:    ✓       ✓       ✓
```

Caso típico: actualizar una posición durante el `scroll`. Quieres respuestas periódicas mientras dura la ráfaga, no esperar a que termine.

| Pregunta                              | Debounce             | Throttle                  |
| ------------------------------------- | -------------------- | ------------------------- |
| ¿Ejecuta durante una ráfaga continua? | No                   | Sí, cada intervalo        |
| ¿Cuándo ejecuta?                      | Al final             | Al ritmo del intervalo    |
| Ejemplo                               | Búsqueda al escribir | Scroll, resize, arrastrar |

## setTimeout y clearTimeout

`setTimeout(callback, ms)` programa el callback para que corra **después de al menos** `ms` milisegundos, cuando el event loop lo tome; devuelve un identificador. `clearTimeout(id)` cancela un timer que todavía no corrió. Llamar a `clearTimeout` con un identificador que ya corrió o con `undefined` no hace nada.

El callback nunca interrumpe el código que se está ejecutando: JavaScript corre una tarea a la vez, y el callback espera su turno en la cola.

## Cancelar

Es habitual exponer un `cancel()` para descartar la ejecución pendiente, por ejemplo cuando un componente se desmonta y la respuesta ya no le sirve a nadie.

## En la entrevista

- ¿Qué diferencia hay entre debounce y throttle? Da un caso de uso de cada uno.
- Implementa `debounce`. Las preguntas que siguen suelen ser sobre `this`, los argumentos y cómo cancelarlo.
- ¿Por qué `setTimeout(fn, 0)` no ejecuta `fn` inmediatamente?
