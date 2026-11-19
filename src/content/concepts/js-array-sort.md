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

## El problema: la tabla de precios desordenada

Una tabla de productos tiene un botón "Ordenar por precio":

```js
const prices = [1500, 99, 250];
prices.sort();
console.log(prices); // [1500, 250, 99]: ¿el más caro primero?
```

El resultado no es ascendente ni descendente: es **orden alfabético**. Y no hay ningún error en la consola. Además, `prices` quedó modificado, así que si otra parte de la app usaba ese array, también ve el cambio. `sort` tiene dos comportamientos por defecto que hay que conocer: cómo compara y que modifica el array original.

## Primero, los términos

- **Ordenar**: reacomodar los elementos según un criterio, como de menor a mayor.
- **Comparador**: una función que recibe dos elementos y dice cuál va primero.
- **Unidad de código UTF-16**: el número con el que JavaScript guarda internamente cada carácter de un string. La `"A"` es 65 y la `"a"` es 97, por eso las mayúsculas van antes.
- **Mutar** (ordenar "en el lugar"): modificar el array original en vez de crear uno nuevo.
- **Estable**: un ordenamiento es estable si los elementos que se consideran iguales mantienen el orden que tenían entre sí.

## El orden por defecto

Si llamas a `sort()` sin argumentos, JavaScript **convierte cada elemento a string** y compara esos strings por sus unidades de código UTF-16. No mira el tipo original de los valores:

```js
["banana", "Cherry", "apple"].sort();
// ["Cherry", "apple", "banana"]: las mayúsculas van antes que las minúsculas

[5, 300, 40].sort();
// [300, 40, 5]: se comparan "5", "300" y "40" como texto
```

La comparación es carácter a carácter, como en un diccionario: decide el primer carácter distinto, no la longitud ni el valor numérico. `"300"` va antes que `"40"` porque `"3"` va antes que `"4"`, igual que "casa" va antes que "dado". Los elementos `undefined` siempre quedan al final, sin pasar por la comparación.

Por qué funciona así: un array de JavaScript puede mezclar tipos (`[3, "a", null]`), y convertir todo a string es la única forma de comparar cualquier cosa con cualquier cosa. Para números, eso casi nunca es lo que quieres.

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

Por qué `a - b` funciona: si `a` es menor, la resta es negativa y `a` va primero; si es mayor, es positiva y va después.

Para objetos, el comparador compara la propiedad que te interesa:

```js
products.sort((a, b) => a.price - b.price); // por precio, de menor a mayor
```

Para ordenar texto que leen personas (nombres, ciudades) conviene `a.localeCompare(b)`, que compara según las reglas del idioma en lugar del código de cada carácter:

```js
["zorro", "Árbol", "casa"].sort();
// ["casa", "zorro", "Árbol"]: la Á tiene un código mayor que todas las letras sin tilde

["zorro", "Árbol", "casa"].sort((a, b) => a.localeCompare(b, "es"));
// ["Árbol", "casa", "zorro"]
```

El comparador debe ser consistente: mismo resultado para el mismo par, y signos opuestos al invertir `a` y `b`. Si no lo es, el orden resultante no está definido. Un error común es devolver un booleano:

```js
nums.sort((a, b) => a > b); // mal: devuelve true/false (1/0), nunca un negativo
```

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

Sirve para ordenar por varios criterios: si la lista ya venía ordenada por nombre, ordenarla por edad mantiene el orden por nombre dentro de cada edad.

## Muta el array

`sort` ordena **en el lugar** y devuelve la referencia al mismo array, no una copia:

```js
const original = [3, 1, 2];
const result = original.sort();
result === original; // true
original; // [1, 2, 3]
```

`toSorted` es la versión que copia: devuelve un array nuevo y deja el original intacto. Es la opción a elegir cuando el array no te pertenece, por ejemplo un prop o un estado de React. Allí mutar tiene una consecuencia concreta: React recibe la misma referencia, cree que nada cambió y no vuelve a renderizar. Lo explica [la página de estado en React](./react-state.md).

```js
const sorted = prices.toSorted((a, b) => a - b); // prices no cambia
```

## En la entrevista

### ¿Qué hace `sort()` sin argumentos con un array de números?

Los convierte a string y los ordena como texto, carácter por carácter. Por eso `[10, 9, 1].sort()` da `[1, 10, 9]`: `"10"` va antes que `"9"` porque `"1"` va antes que `"9"`. Para ordenar números hay que pasar un comparador.

### ¿Qué debe devolver un comparador? ¿Cómo ordenas de mayor a menor?

Un número: negativo si `a` va antes que `b`, positivo si va después y `0` si da igual. Para números, `(a, b) => a - b` ordena de menor a mayor y `(a, b) => b - a`, de mayor a menor. Devolver un booleano (`a > b`) es un error común, porque nunca devuelve un negativo.

### ¿Qué diferencia hay entre `sort` y `toSorted`?

`sort` ordena el array original en el lugar y devuelve esa misma referencia. `toSorted` devuelve un array nuevo ordenado y no toca el original. Se usa `toSorted` cuando el array es compartido o es estado de React, donde mutarlo hace que la pantalla no se actualice.
