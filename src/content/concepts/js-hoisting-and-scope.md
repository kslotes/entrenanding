---
title: Hoisting y alcance de var, let y const
stack: [javascript, typescript]
references:
  - title: "MDN Glossary: Hoisting"
    url: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
  - title: "MDN Glossary: Scope"
    url: https://developer.mozilla.org/en-US/docs/Glossary/Scope
  - title: "MDN: var"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
  - title: "MDN: let (temporal dead zone)"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz
  - title: "MDN: const"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
---

## El problema: el NaN que nadie esperaba

Una función aplica un descuento solo si el carrito tiene cupón:

```js
function applyDiscount(cart) {
  if (cart.coupon) {
    var discount = 0.1;
  }
  return cart.total * (1 - discount);
}

applyDiscount({ total: 100, coupon: "PROMO" }); // 90
applyDiscount({ total: 100 }); // NaN
```

Sin cupón, el código **no falla**: devuelve `NaN` en silencio, y ese `NaN` termina mostrado en la pantalla de pago. La variable `discount` existe fuera del `if` aunque se declaró dentro, y vale `undefined` porque esa línea nunca se ejecutó. Dos reglas de `var` explican esto: su **alcance** y el **hoisting**. Con `let` el mismo error se detecta enseguida, como verás abajo.

## Primero, los términos

- **Declarar** una variable: decir que existe (`let total`).
- **Inicializar** o **asignar**: darle un valor (`total = 100`). Se pueden hacer juntas: `let total = 100`.
- **Alcance** (_scope_): la zona del código donde una variable existe y se puede usar.
- **Bloque**: el código entre llaves `{ }`, como el cuerpo de un `if`, un `for` o un bloque suelto.
- **Hoisting** ("elevación"): JavaScript registra las declaraciones de un alcance **antes** de ejecutar su código, como si estuvieran escritas al principio.
- **`ReferenceError`**: el error de usar una variable que no existe o que todavía no se puede leer.
- **`TypeError`**: el error de usar un valor de una forma que su tipo no permite, como llamar a `undefined` como si fuera una función.

## Alcance: función o bloque

- `var` tiene alcance de **función**: una declaración dentro de un `if` o un `for` pertenece a toda la función que la contiene (o al script, si está fuera de toda función).
- `let` y `const` tienen alcance de **bloque**: solo existen entre las llaves `{ }` donde se declaran.

```js
function pick(flag) {
  if (flag) {
    var label = "on";
    let local = "solo en el bloque";
  }
  return label; // label existe aquí; local no
}

pick(true); // "on"
pick(false); // undefined: label existe, pero nunca se asignó
```

Con `let`, el ejemplo del descuento falla en el momento, en lugar de devolver un `NaN` que viaja hasta la pantalla:

```js
function applyDiscount(cart) {
  if (cart.coupon) {
    let discount = 0.1;
  }
  return cart.total * (1 - discount); // ReferenceError: discount is not defined
}
```

Y la versión correcta declara la variable donde se usa, con un valor para cada caso:

```js
function applyDiscount(cart) {
  const discount = cart.coupon ? 0.1 : 0;
  return cart.total * (1 - discount);
}
```

Cómo interactúa el alcance con los callbacks que capturan variables se explica en [Closures y this](./js-closures.md).

## Hoisting

Antes de ejecutar un alcance, JavaScript ya registra las declaraciones que contiene. Cada tipo de declaración se comporta distinto:

| Declaración             | ¿Se puede usar antes de su línea?                        |
| ----------------------- | -------------------------------------------------------- |
| `function nombre() {}`  | Sí, con su valor completo                                |
| `var`                   | Se puede leer, pero vale `undefined` hasta la asignación |
| `let`, `const`, `class` | No: lanza `ReferenceError`                               |

Solo se eleva la **declaración**, nunca la inicialización. Para `var`, es como si el código se reescribiera así:

```js
// Lo que escribes:
console.log(x); // undefined
var x = 5;

// Cómo se comporta:
var x; // la declaración "sube" y x empieza en undefined
console.log(x);
x = 5; // la asignación se queda en su línea
```

Con funciones, la diferencia entre declararla y asignarla a una variable se nota mucho:

```js
greet("Ana"); // "Hola, Ana": la función completa ya existe
function greet(name) {
  return `Hola, ${name}`;
}

sayHi(); // TypeError: sayHi is not a function
var sayHi = function () {
  return "hi";
};
```

`sayHi` existe desde el principio porque es un `var`, pero hasta la línea de la asignación vale `undefined`, y `undefined` no se puede llamar. Por eso el error es `TypeError` y no `ReferenceError`.

## Zona muerta temporal (TDZ)

Una variable `let`, `const` o `class` está en la **zona muerta temporal** (_temporal dead zone_) desde el inicio de su bloque hasta la línea donde se declara. Cualquier acceso en ese tramo lanza `ReferenceError`:

```js
const limit = 10;
{
  console.log(limit); // ReferenceError: Cannot access 'limit' before initialization
  const limit = 20;
}
```

El ejemplo muestra que la TDZ es real: la `limit` interna ya "tapa" a la externa desde el inicio del bloque, aunque todavía no se pueda leer. Por eso algunos dicen que `let` y `const` "no se elevan" y otros que se elevan con TDZ; el comportamiento observable es el mismo.

Para qué sirve: convierte "usé la variable antes de darle valor" en un error inmediato, en lugar del `undefined` silencioso de `var`.

## const

`const` impide **reasignar** la variable, no modificar el objeto al que apunta:

```js
const settings = { theme: "dark" };
settings.theme = "light"; // permitido: el objeto cambia, la variable sigue apuntando al mismo
settings = {}; // TypeError: Assignment to constant variable.
```

En código moderno, la regla habitual es usar `const` por defecto, `let` cuando la variable tiene que cambiar de valor, y no usar `var`.

## En la entrevista

### ¿Qué diferencia hay entre el alcance de `var` y el de `let`?

`var` tiene alcance de función: si la declaras dentro de un `if` o un `for`, existe en toda la función. `let` (y `const`) tiene alcance de bloque: solo existe entre las llaves donde se declara. En la práctica, `var` deja "escapar" variables de los bloques y produce `undefined` silenciosos; `let` hace que usarlas fuera del bloque sea un `ReferenceError`.

```js
if (true) {
  var a = 1;
  let b = 2;
}
a; // 1
b; // ReferenceError
```

### ¿Qué es el hoisting? ¿Se comportan igual una función declarada y una función asignada a una variable?

Es que JavaScript registra las declaraciones de un alcance antes de ejecutarlo, así que existen desde el principio. No se comportan igual: una función declarada (`function greet() {}`) se eleva completa y se puede llamar antes de su línea. Una función asignada a un `var` solo eleva la variable, que vale `undefined` hasta la asignación, así que llamarla antes lanza `TypeError: ... is not a function`. Con `let` o `const`, llamarla antes lanza `ReferenceError`.

### ¿Qué es la zona muerta temporal?

Es el tramo entre el inicio del bloque y la línea donde se declara una variable `let`, `const` o `class`. La variable ya existe en ese tramo (por eso tapa a otra del mismo nombre de afuera), pero leerla o escribirla lanza `ReferenceError`. Sirve para detectar enseguida el uso de una variable antes de inicializarla.
