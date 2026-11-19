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
  - title: "MDN: Function.prototype.bind()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
---

## El problema: funciones que "se acuerdan" de cosas

En el frontend casi todo es una función que corre **más tarde**: el handler de un click, el callback de un `setTimeout`, lo que hace una petición al volver. Esa función necesita datos del momento en que se creó:

```js
function setupDeleteButton(button, productId) {
  button.addEventListener("click", () => {
    deleteProduct(productId); // ¿cómo sigue existiendo productId cuando el usuario hace click?
  });
}
```

`setupDeleteButton` terminó hace rato cuando el usuario hace click, pero el handler todavía puede leer `productId`. Ese mecanismo se llama **closure**, y entenderlo explica dos bugs clásicos: el bucle con `var` que imprime siempre el mismo número y el método que pierde su `this` al pasarse como callback.

## Primero, los términos

- **Función interna**: una función creada dentro de otra.
- **Alcance léxico**: una función puede ver las variables del lugar donde está **escrita** en el código, no del lugar donde se la llama.
- **Closure**: una función junto con las variables del lugar donde fue creada, que sigue pudiendo usar aunque ese lugar ya haya terminado de ejecutarse.
- **Callback**: una función que le pasas a otra para que la llame después (`setTimeout(callback)`, `addEventListener("click", callback)`).
- **`this`**: una referencia especial que, dentro de una función, apunta a "el objeto sobre el que se llamó".
- **Arrow function**: una función escrita con `=>`. Además de ser más corta, no tiene su propio `this`.

## Qué es un closure

La función interna sigue teniendo acceso a las variables de la función externa aunque la externa ya haya terminado:

```js
function makeCounter() {
  let count = 0;
  return () => ++count; // esta función "se lleva" la variable count
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

```js
let message = "hola";
const show = () => message;
message = "chau";
show(); // "chau": lee la variable en el momento de llamarse, no cuando se creó
```

Así se consigue **estado privado** sin clases ni variables globales: nada fuera de `makeCounter` puede tocar `count`. Un uso real es limitar cuántas veces se puede hacer algo:

```js
function once(fn) {
  let done = false; // privado: nadie más lo puede cambiar
  return (...args) => {
    if (done) return;
    done = true;
    return fn(...args);
  };
}

const submitOrder = once(() => api.post("/orders")); // el doble click no crea dos pedidos
```

Los hooks de React dependen de este mismo mecanismo: cada render crea funciones nuevas que capturan las variables de ese render. Lo explica [la página de estado en React](./react-state.md).

## var y let en bucles

`var` tiene alcance de **función**: hay una sola variable para toda la función, aunque se declare dentro de un bloque. `let` y `const` tienen alcance de **bloque**: cada bloque tiene la suya, y en un `for` cada iteración tiene su propia copia. El detalle de los alcances está en [hoisting y alcance](./js-hoisting-and-scope.md).

Combinado con "el closure captura la variable, no su valor":

```js
const fns = [];
for (var i = 0; i < 2; i++) {
  fns.push(() => i); // las dos funciones capturan LA MISMA i
}
fns.map((f) => f()); // [2, 2]: una sola i, que terminó valiendo 2
```

Con `let i`, cada iteración crea una `i` nueva, cada función captura la suya y el resultado es `[0, 1]`.

Dónde muerde: armar handlers en un bucle.

```js
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = () => openTab(i); // mal: todos abren la pestaña buttons.length
}

for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = () => openTab(i); // bien: cada botón tiene su i
}
```

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

obj.regular(); // obj: se llamó "sobre" obj
const detached = obj.regular;
detached(); // undefined (en un módulo ES): se llamó suelta
```

Dónde muerde: pasar un método como callback lo "despega" de su objeto, porque quien lo llame más tarde lo hará como función suelta.

```js
class Timer {
  seconds = 0;

  tick() {
    this.seconds++; // solo funciona si this es el Timer
  }

  start() {
    setInterval(this.tick, 1000); // mal: setInterval llama a tick sin el Timer; this.seconds nunca cambia
    setInterval(() => this.tick(), 1000); // bien: la arrow usa el this de start
    setInterval(this.tick.bind(this), 1000); // también bien: bind fija this
  }
}
```

Ojo con un detalle: `setTimeout` y `setInterval` no llaman al callback con `this` en `undefined`. En el navegador usan `window` (y en Node, el objeto del timer), así que el código mal escrito no siempre lanza un error: incrementa una propiedad de otro objeto y el `Timer` queda en 0 sin ningún aviso.

Las **arrow functions** no tienen `this` propio: usan el del lugar donde se definieron (alcance léxico), igual que cualquier otra variable del closure. Por eso son útiles dentro de un callback que necesita el `this` de la función que lo rodea, y por eso no sirven como métodos que dependen de quién los llama.

`apply` y `call` permiten invocar una función eligiendo su `this`; `apply` recibe los argumentos como un array. `bind` no la llama: devuelve una función nueva con el `this` fijado para siempre.

## En la entrevista

### ¿Qué es un closure? Da un ejemplo de estado privado.

Es una función junto con las variables del lugar donde fue creada: puede seguir usándolas aunque la función externa ya haya terminado. Sirve para guardar estado que nadie de afuera puede tocar:

```js
function makeCounter() {
  let count = 0; // privado
  return { increment: () => ++count, value: () => count };
}

const counter = makeCounter();
counter.increment();
counter.value(); // 1; no hay forma de cambiar count sin pasar por increment
```

### ¿Qué diferencia hay entre `var`, `let` y `const`?

`var` tiene alcance de función y se puede leer antes de su línea (vale `undefined`). `let` y `const` tienen alcance de bloque y leerlas antes de su línea lanza `ReferenceError`. `const` además impide reasignar la variable. En un `for`, `let` crea una variable nueva por iteración, por eso los closures creados en el bucle capturan cada uno su valor; con `var` todos comparten la misma.

### ¿Qué vale `this` dentro de una arrow function? ¿Y en un método que se pasa como callback?

Una arrow function no tiene `this` propio: usa el `this` del lugar donde se escribió. Un método común que se pasa como callback (`setTimeout(obj.method)`) se llama después sin su objeto, así que su `this` deja de ser `obj`: es `undefined` si se llama como función suelta en modo estricto, o lo que decida quien lo llama (`setTimeout` en el navegador usa `window`). Se arregla envolviéndolo en una arrow (`() => obj.method()`) o con `obj.method.bind(obj)`.
