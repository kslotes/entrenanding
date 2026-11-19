---
title: ¿Qué devuelve typeof null en JavaScript?
type: multiple-choice
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
concepts: [js-equality-and-types]
options:
  - id: a
    text: '"null"'
  - id: b
    text: '"undefined"'
  - id: c
    text: '"object"'
  - id: d
    text: Lanza un TypeError
answer: c
---

La respuesta es **`"object"`**, aunque `null` es un valor **primitivo** (un valor simple, no un objeto). Es una herencia de la primera implementación de JavaScript que nunca se corrigió: se propuso cambiarlo y la propuesta se rechazó, porque rompería código que ya existía.

```js
typeof null; // "object"
typeof {}; // "object"
typeof []; // "object": los arrays también
typeof undefined; // "undefined"
```

**La consecuencia práctica:** `typeof value === "object"` no alcanza para saber si algo es un objeto, porque deja pasar `null`. Es un bug común al validar la respuesta de una API:

```js
const user = await fetchUser(id); // devuelve null si no existe

if (typeof user === "object") {
  console.log(user.name); // TypeError: Cannot read properties of null
}

if (user !== null && typeof user === "object") {
  console.log(user.name); // correcto: descarta null primero
}
```

Para preguntar por `null`, compara directo con `user === null`. Para saber si algo es un array, usa `Array.isArray(value)`, porque `typeof` también da `"object"`.

**Las otras opciones:**

- `"null"`: sería lo lógico, pero `typeof` nunca devuelve ese string.
- `"undefined"`: es lo que devuelve `typeof undefined`; `null` y `undefined` son tipos distintos.
- Lanza un `TypeError`: `typeof` nunca lanza con un valor; el error aparece después, al leer una propiedad de `null`.
