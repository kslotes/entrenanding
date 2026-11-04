---
title: Closures y this en JavaScript
stack: [javascript, typescript]
references:
  - title: "MDN: Closures"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  - title: "MDN: this"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
  - title: "MDN: Arrow function expressions"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  - title: "MDN: Function.prototype.apply()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
---

## Qué es un closure

Un **closure** es una función junto con las variables del lugar donde fue creada. La función interna sigue teniendo acceso a esas variables aunque la función externa ya haya terminado:

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const a = makeCounter();
const b = makeCounter();
a(); // 1
a(); // 2
b(); // 1: cada llamada a makeCounter crea su propio count
```

Dos ideas clave:

- **Cada ejecución de la función externa crea variables nuevas.** `a` y `b` no comparten `count`.
- **El closure captura la variable, no su valor.** Si la variable cambia después, la función ve el valor nuevo.

Así se consigue estado privado sin clases ni variables globales: nada fuera de `makeCounter` puede tocar `count`.

## var y let

`var` tiene alcance de **función**: hay una sola variable para toda la función, aunque se declare dentro de un bloque. `let` y `const` tienen alcance de **bloque**: cada bloque tiene la suya, y en un `for` cada iteración tiene su propia copia.

```js
const fns = [];
for (var i = 0; i < 2; i++) {
  fns.push(() => i);
}
fns.map((f) => f()); // [2, 2]: una sola i, que terminó valiendo 2
```

Con `let i`, el resultado sería `[0, 1]`.

## this

`this` no depende de dónde se escribe una función `function`, sino de **cómo se la llama**:

| Llamada                 | Valor de `this`                                   |
| ----------------------- | ------------------------------------------------- |
| `obj.metodo()`          | `obj`                                             |
| `metodo()` (suelta)     | `undefined` en modo estricto (módulos ES, clases) |
| `metodo.apply(x, args)` | `x`                                               |
| `metodo.call(x, a, b)`  | `x`                                               |

```js
const obj = {
  name: "obj",
  regular() {
    return this;
  },
};

obj.regular(); // obj
const detached = obj.regular;
detached(); // undefined (en un módulo ES)
```

Las **arrow functions** no tienen `this` propio: usan el del lugar donde se definieron (alcance léxico), igual que cualquier otra variable del closure. Por eso son útiles dentro de un callback que necesita el `this` de la función que lo rodea, y por eso no sirven como métodos que dependen de quién los llama.

`apply` y `call` permiten invocar una función eligiendo su `this`; `apply` recibe los argumentos como un array.

## En la entrevista

- ¿Qué es un closure? Da un ejemplo de estado privado.
- ¿Qué diferencia hay entre `var`, `let` y `const`?
- ¿Qué vale `this` dentro de una arrow function? ¿Y en un método que se pasa como callback?
