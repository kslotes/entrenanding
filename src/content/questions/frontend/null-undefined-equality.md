---
title: ¿Qué imprimen estas comparaciones?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
concepts: [js-equality-and-types]
language: javascript
code: |
  console.log(null == undefined);
  console.log(null === undefined);
expectedOutput: |-
  true
  false
---

Imprime `true` y `false`: la igualdad débil (`==`) tiene una regla especial que considera iguales a `null` y `undefined` entre sí, y la estricta (`===`) no convierte tipos, así que dos tipos distintos nunca son iguales.

```js
null == undefined; // true: regla especial de ==
null === undefined; // false: son tipos distintos

null == 0; // false: con cualquier otro valor, null solo es == a undefined
undefined == ""; // false
```

**Qué es cada uno:** `undefined` significa "no tiene valor asignado" (una variable sin inicializar, una propiedad que no existe). `null` significa "sin valor, a propósito" (lo pone el programador o una API). Son dos tipos distintos, por eso `===` da `false`.

**Por qué importa:** muchas veces no te interesa cuál de los dos es, sino si "falta" el valor. `value == null` cubre los dos casos, y nada más: a diferencia de `!value`, no confunde un `0` o un `""` con "no hay valor".

```js
function label(count) {
  if (count == null) return "sin datos"; // null o undefined
  return `${count} elementos`; // 0 sigue siendo un dato válido
}

label(undefined); // "sin datos"
label(0); // "0 elementos"; con !count habría dicho "sin datos"
```

Fuera de ese atajo, conviene usar `===`: las conversiones de `==` producen sorpresas como `0 == ""`, que es `true`.

**Las respuestas tentadoras:**

- `false` y `false`: supone que `==` compara como `===`; en realidad tiene esta regla especial para `null` y `undefined`.
- `true` y `true`: supone que `===` los trata como el mismo valor, pero son tipos distintos.
