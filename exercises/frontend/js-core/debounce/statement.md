---
title: Implementar debounce
category: frontend
stack: [javascript, typescript]
seniority: [jr, ssr]
fundamentals: true
concepts: [js-closures, debounce-throttle]
---

Implementá `debounce`: recibe una función y un tiempo de espera, y devuelve una función nueva que solo ejecuta la original cuando pasan `waitMs` milisegundos sin llamadas. Es una de las implementaciones más pedidas en entrevistas de frontend, porque en pocas líneas aparecen closures, `this` y timers.

## Teoría

Antes de empezar, lee los conceptos en los que se apoya este ejercicio:

- [Closures y this en JavaScript](../../../../src/content/concepts/js-closures.md)
- [Debounce y throttle](../../../../src/content/concepts/debounce-throttle.md)

## Qué implementar

Edita `src/debounce.ts` hasta que pasen todos los tests de `debounce.test.ts`.

- `debounce(fn, waitMs)` devuelve una función que, al llamarla, programa una ejecución de `fn` para dentro de `waitMs` milisegundos.
- Si se la vuelve a llamar antes de que pase la espera, la ejecución anterior se descarta y la espera empieza de nuevo.
- `fn` recibe los argumentos de la **última** llamada.
- `fn` recibe el mismo `this` con el que se llamó a la función debounced.
- La función devuelta tiene un método `cancel()` que descarta la ejecución pendiente. Después de cancelar, se puede seguir usando.
- Cada función que devuelve `debounce` tiene su propia espera, independiente de las demás.

## Ejecutar los tests

Desde la raíz del repositorio:

```sh
pnpm exercise js-core/debounce
```

Para que los tests se vuelvan a ejecutar cada vez que guardas:

```sh
pnpm exercise:watch js-core/debounce
```

Los tests usan timers simulados (`vi.useFakeTimers()`): no esperan tiempo real.

## Pistas

- ¿Dónde guardas el identificador del timer para que sobreviva entre llamadas, pero no sea compartido con otras funciones debounced?
- ¿Qué `this` tiene una arrow function? ¿Y una `function`?
- En JavaScript las funciones son objetos: se les pueden agregar propiedades.

La solución de referencia está en `solution/`, comentada para que aprendas de ella. Inténtalo primero y después compara.
