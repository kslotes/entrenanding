---
title: Ordenar arrays en JavaScript
stack: [javascript, typescript]
references:
  - title: "MDN: Array.prototype.sort()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  - title: "MDN: Array.prototype.toSorted()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
  - title: "MDN: String.prototype.localeCompare()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
---

## El orden por defecto

Si llamas a `sort()` sin argumentos, JavaScript **convierte cada elemento a string** y compara esos strings por sus unidades de código UTF-16. No mira el tipo original de los valores:

```js
["banana", "Cherry", "apple"].sort();
// ["Cherry", "apple", "banana"]: las mayúsculas van antes que las minúsculas

[5, 300, 40].sort();
// [300, 40, 5]: se comparan "5", "300" y "40" como texto
```

La comparación es carácter a carácter, como en un diccionario: decide el primer carácter distinto, no la longitud ni el valor numérico. Los elementos `undefined` siempre quedan al final, sin pasar por la comparación.

## La función de comparación

Para cualquier otro orden se pasa un comparador `(a, b) => número`:

| Resultado | Significado                   |
| --------- | ----------------------------- |
| `< 0`     | `a` va antes que `b`          |
| `> 0`     | `a` va después que `b`        |
| `0`       | se mantiene el orden original |

```js
[5, 300, 40].sort((a, b) => a - b); // [5, 40, 300], ascendente
[5, 300, 40].sort((a, b) => b - a); // [300, 40, 5], descendente
```

Para ordenar texto que leen personas (nombres, ciudades) conviene `a.localeCompare(b)`, que compara según las reglas del idioma en lugar del código de cada carácter.

El comparador debe ser consistente: mismo resultado para el mismo par, y signos opuestos al invertir `a` y `b`. Si no lo es, el orden resultante no está definido.

## Estabilidad

Desde ES2019 `sort` es **estable**: los elementos que el comparador considera iguales conservan su orden original.

```js
const people = [
  { name: "Ana", age: 30 },
  { name: "Luis", age: 25 },
  { name: "Eva", age: 30 },
];
people.toSorted((a, b) => a.age - b.age).map((p) => p.name);
// ["Luis", "Ana", "Eva"]: Ana sigue antes que Eva
```

## Muta el array

`sort` ordena **en el lugar** y devuelve la referencia al mismo array, no una copia:

```js
const original = [3, 1, 2];
const result = original.sort();
result === original; // true
original; // [1, 2, 3]
```

`toSorted` es la versión que copia: devuelve un array nuevo y deja el original intacto. Es la opción a elegir cuando el array no te pertenece, por ejemplo un prop o un estado de React.

## En la entrevista

- ¿Qué hace `sort()` sin argumentos con un array de números?
- ¿Qué debe devolver un comparador? ¿Cómo ordenas de mayor a menor?
- ¿Qué diferencia hay entre `sort` y `toSorted`?
