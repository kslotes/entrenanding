---
title: Tipos e igualdad en JavaScript
stack: [javascript, typescript]
references:
  - title: "MDN: JavaScript data types and data structures"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
  - title: "MDN: typeof"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
  - title: "MDN: Equality (==)"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality
  - title: "MDN: Strict equality (===)"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
  - title: "MDN: Equality comparisons and sameness"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness
---

## Primitivos y objetos

JavaScript tiene siete tipos primitivos (`undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`) y los objetos. Arrays, funciones y clases son objetos.

## typeof

`typeof` devuelve un string con la categoría del valor. La tabla completa es corta:

| Valor                 | `typeof`      |
| --------------------- | ------------- |
| `undefined`           | `"undefined"` |
| `null`                | `"object"`    |
| booleano              | `"boolean"`   |
| número                | `"number"`    |
| BigInt                | `"bigint"`    |
| string                | `"string"`    |
| símbolo               | `"symbol"`    |
| función o clase       | `"function"`  |
| cualquier otro objeto | `"object"`    |

Dos detalles que suelen aparecer:

- La fila de `null` es una herencia de la primera implementación del lenguaje; se propuso corregirla y la propuesta fue rechazada. Para detectar `null`, compara con `=== null`; si necesitas saber si algo es un objeto, descarta `null` aparte.
- Los arrays dan `"object"`. Para detectarlos, usa `Array.isArray(value)`.

## Igualdad estricta (===)

`===` **no convierte tipos**: si los tipos son distintos, el resultado es `false`. Si son iguales, compara el valor (o la referencia, en objetos):

```js
1 === "1"; // false
({}) === {}; // false: dos objetos distintos
-0 === 0; // true
NaN === NaN; // false: NaN nunca es igual a nada
```

## Igualdad débil (==)

`==` convierte los operandos antes de comparar cuando los tipos difieren. Resumido:

1. Si los tipos son iguales, compara como `===`.
2. `null` y `undefined` solo son `==` entre sí; con cualquier otro valor dan `false`.
3. Un objeto se convierte a primitivo.
4. Un booleano se convierte a número (`true` → `1`, `false` → `0`), y un string comparado con un número se convierte a número.

Esas conversiones producen resultados poco intuitivos:

```js
1 == "1"; // true
0 == ""; // true
false == "0"; // true
"" == "0"; // false: los dos son strings, no hay conversión
0 == null; // false: null no se convierte a número aquí
[1, 2] == "1,2"; // true: el array se convierte a "1,2"
```

La regla práctica es usar `===` siempre, salvo cuando quieras a propósito el caso 2.

## Object.is

`Object.is` es como `===`, salvo por los valores numéricos especiales: `Object.is(NaN, NaN)` es `true` y `Object.is(-0, 0)` es `false`. Para preguntar si algo es `NaN`, usa `Number.isNaN(value)`.

## En la entrevista

- ¿Qué diferencia hay entre `==` y `===`? Da un ejemplo donde den resultados distintos.
- ¿Cómo compruebas que un valor es un objeto "de verdad"? ¿Y un array?
- ¿Por qué `NaN === NaN` es `false` y cómo detectas `NaN`?
