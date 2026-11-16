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

## Alcance: función o bloque

El **alcance** (scope) es la zona del código donde una variable existe.

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

Cómo interactúa esto con los callbacks que capturan variables se explica en [Closures y this](./js-closures.md).

## Hoisting

Antes de ejecutar un alcance, JavaScript ya registra las declaraciones que contiene. A eso se le llama **hoisting** ("elevación"), y cada tipo de declaración se comporta distinto:

| Declaración             | ¿Se puede usar antes de su línea?                        |
| ----------------------- | -------------------------------------------------------- |
| `function nombre() {}`  | Sí, con su valor completo                                |
| `var`                   | Se puede leer, pero vale `undefined` hasta la asignación |
| `let`, `const`, `class` | No: lanza `ReferenceError`                               |

Solo se eleva la **declaración**, nunca la inicialización:

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

`sayHi` existe desde el principio porque es un `var`, pero hasta la línea de la asignación vale `undefined`, y `undefined` no se puede llamar.

## Zona muerta temporal (TDZ)

Una variable `let`, `const` o `class` está en la **zona muerta temporal** desde el inicio de su bloque hasta la línea donde se declara. Cualquier acceso en ese tramo lanza `ReferenceError`:

```js
const limit = 10;
{
  console.log(limit); // ReferenceError: Cannot access 'limit' before initialization
  const limit = 20;
}
```

El ejemplo muestra que la TDZ es real: la `limit` interna ya "tapa" a la externa desde el inicio del bloque, aunque todavía no se pueda leer. Por eso algunos dicen que `let` y `const` "no se elevan" y otros que se elevan con TDZ; el comportamiento observable es el mismo.

## const

`const` impide **reasignar** la variable, no modificar el objeto al que apunta:

```js
const settings = { theme: "dark" };
settings.theme = "light"; // permitido
settings = {}; // TypeError: Assignment to constant variable.
```

## En la entrevista

- ¿Qué diferencia hay entre el alcance de `var` y el de `let`?
- ¿Qué es el hoisting? ¿Se comportan igual una función declarada y una función asignada a una variable?
- ¿Qué es la zona muerta temporal?
