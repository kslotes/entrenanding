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
  - title: "MDN: HTMLInputElement value"
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value
---

## El problema: el campo vacío que vale cero

Un formulario pide una cantidad y quieres avisar si el usuario puso `0`:

```js
const quantity = document.querySelector("#quantity").value; // siempre es un string

if (quantity == 0) {
  showError("La cantidad no puede ser cero");
}
```

Funciona con `"0"`, pero también muestra el error cuando el campo está **vacío**, porque para `==` el string vacío `""` es igual a `0`. El código no falla; simplemente hace algo que no pediste. Pasa porque `==` **convierte los tipos** antes de comparar, con reglas que casi nadie recuerda completas. Entender los tipos de JavaScript y las dos igualdades evita esta clase de bugs.

## Primero, los términos

- **Tipo**: la categoría de un valor: número, string, booleano, objeto...
- **Primitivo**: un valor simple e inmutable, que no es un objeto, como `42` o `"hola"`.
- **Objeto**: un valor con propiedades (`{ name: "ana" }`). Los arrays y las funciones también son objetos.
- **Referencia**: lo que guarda una variable que contiene un objeto: un "puntero" a él. Dos objetos con el mismo contenido son dos referencias distintas.
- **Coerción** (conversión de tipos): cuando JavaScript transforma un valor en otro tipo por su cuenta, por ejemplo `"5"` en `5`.
- **`undefined`**: "no tiene valor asignado". Es lo que vale una variable declarada sin valor o una propiedad que no existe.
- **`null`**: "sin valor, a propósito". Lo asigna el programador o una API para decir "aquí no hay nada".
- **`NaN`** (_Not a Number_): el número que resulta de una operación numérica inválida, como `Number("abc")`.

## Primitivos y objetos

JavaScript tiene siete tipos primitivos (`undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`) y los objetos. Arrays, funciones y clases son objetos.

La diferencia se nota al comparar: los primitivos se comparan por valor y los objetos por referencia.

```js
"ana" === "ana"; // true: mismo valor
({ name: "ana" }) === { name: "ana" }; // false: dos objetos distintos

const a = { name: "ana" };
const b = a;
a === b; // true: las dos variables apuntan al mismo objeto
```

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

- La fila de `null` es una herencia de la primera implementación del lenguaje; se propuso corregirla y la propuesta fue rechazada, porque cambiarla rompería código existente. Para detectar `null`, compara con `=== null`; si necesitas saber si algo es un objeto, descarta `null` aparte.
- Los arrays dan `"object"`. Para detectarlos, usa `Array.isArray(value)`.

Dónde muerde: una API devuelve `null` cuando no encuentra al usuario, y el chequeo con `typeof` lo deja pasar:

```js
const user = await fetchUser(id); // puede ser null

if (typeof user === "object") {
  console.log(user.name); // TypeError: Cannot read properties of null
}

if (user !== null && typeof user === "object") {
  console.log(user.name); // correcto
}
```

## Igualdad estricta (===)

`===` **no convierte tipos**: si los tipos son distintos, el resultado es `false`. Si son iguales, compara el valor (o la referencia, en objetos):

```js
1 === "1"; // false: number y string
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
1 == "1"; // true: "1" se convierte a 1
0 == ""; // true: "" se convierte a 0 (el bug del formulario)
false == "0"; // true: false -> 0, "0" -> 0
"" == "0"; // false: los dos son strings, no hay conversión
0 == null; // false: null no se convierte a número aquí (regla 2)
[1, 2] == "1,2"; // true: el array se convierte a "1,2"
```

Fíjate que `0 == ""` y `0 == "0"` son `true`, pero `"" == "0"` es `false`: `==` ni siquiera es transitivo.

La regla práctica es usar `===` siempre, salvo cuando quieras a propósito el caso 2. `value == null` es un atajo común y legible para "¿es `null` o `undefined`?":

```js
function greet(name) {
  if (name == null) return "Hola, invitado"; // cubre null y undefined, pero no "" ni 0
  return `Hola, ${name}`;
}
```

El arreglo del formulario es convertir el valor a propósito y comparar con `===`:

```js
const raw = document.querySelector("#quantity").value;

if (raw === "") {
  showError("Ingresa una cantidad");
} else if (Number(raw) === 0) {
  showError("La cantidad no puede ser cero");
}
```

## Object.is

`Object.is` es como `===`, salvo por los valores numéricos especiales: `Object.is(NaN, NaN)` es `true` y `Object.is(-0, 0)` es `false`. Para preguntar si algo es `NaN`, usa `Number.isNaN(value)`:

```js
const age = Number("abc"); // NaN

age === NaN; // false siempre: no sirve para detectarlo
Number.isNaN(age); // true
```

## En la entrevista

### ¿Qué diferencia hay entre `==` y `===`? Da un ejemplo donde den resultados distintos.

`===` compara sin convertir tipos: si los tipos difieren, es `false`. `==` convierte los operandos a un tipo común antes de comparar. Por eso `0 == ""` es `true` (el string vacío se convierte a `0`) y `0 === ""` es `false`. Se usa `===` siempre, salvo `value == null` para detectar a la vez `null` y `undefined`.

```js
null == undefined; // true
null === undefined; // false
```

### ¿Cómo compruebas que un valor es un objeto "de verdad"? ¿Y un array?

`typeof value === "object"` no alcanza, porque `typeof null` también es `"object"`, una herencia de la primera implementación del lenguaje. Hay que descartar `null` aparte: `value !== null && typeof value === "object"`. Para arrays, `typeof` también da `"object"`, así que se usa `Array.isArray(value)`.

### ¿Por qué `NaN === NaN` es `false` y cómo detectas `NaN`?

Porque `NaN` representa el resultado de una operación numérica inválida, y la regla de los números en JavaScript dice que `NaN` no es igual a ningún valor, ni siquiera a sí mismo. Para detectarlo se usa `Number.isNaN(value)`, o `Object.is(value, NaN)`, que trata a `NaN` como igual a sí mismo.
