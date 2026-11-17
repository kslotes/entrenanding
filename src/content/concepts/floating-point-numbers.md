---
title: Números de punto flotante
stack: [javascript, typescript]
references:
  - title: "MDN: Number"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
  - title: "MDN: Number.EPSILON"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
  - title: "MDN: Number.MAX_SAFE_INTEGER"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  - title: "MDN: Number.prototype.toFixed()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
---

## Un solo tipo numérico

En JavaScript, `number` es un valor de **punto flotante binario de 64 bits** (IEEE 754 de doble precisión), igual que `double` en Java o C#. No hay un tipo entero separado de uso cotidiano: `42` y `4.2` son ambos `number`. (`BigInt` existe para enteros arbitrariamente grandes, pero no reemplaza a `number`).

Un double guarda un signo, un exponente y 52 bits de mantisa. Eso da unos 15 a 17 dígitos decimales significativos; más allá de eso, los resultados se redondean.

## Por qué algunos decimales no son exactos

Con una cantidad finita de bits no se pueden representar todos los números. En base 10 pasa con `1/3 = 0.333...`; en base 2 pasa con fracciones como `0.1`, que tiene infinitos dígitos binarios. Se guarda el double más cercano, no el valor exacto:

```js
(0.1).toFixed(20); // "0.10000000000000000555"
1.1 + 2.2; // 3.3000000000000003
```

Las fracciones que son sumas de potencias de 2 (`0.5`, `0.25`, `0.125`) sí son exactas:

```js
0.5 + 0.25 === 0.75; // true
```

Cada operación puede introducir un pequeño error de redondeo, y esos errores se acumulan. Por eso dos cálculos que en papel dan lo mismo pueden diferir en el último dígito.

## Comparar con tolerancia

En lugar de `===`, se compara si la diferencia es menor que un margen. `Number.EPSILON` (unos `2.2e-16`) es la distancia entre `1` y el siguiente double, y sirve como margen para valores cercanos a 1:

```js
function nearlyEqual(a, b, tolerance = Number.EPSILON) {
  return Math.abs(a - b) < tolerance;
}

nearlyEqual(1000.1 + 1000.2, 2000.3); // false: el error crece con la magnitud
nearlyEqual(1000.1 + 1000.2, 2000.3, 2000 * Number.EPSILON); // true
```

El margen debe escalar con el tamaño de los números que comparas.

## Enteros seguros

Los enteros son exactos solo hasta `Number.MAX_SAFE_INTEGER` (`2^53 - 1`, `9007199254740991`). Por encima, dos enteros distintos pueden quedar representados por el mismo double:

```js
2 ** 53 === 2 ** 53 + 1; // true
```

## Dinero y decimales exactos

Para montos, la práctica habitual es trabajar en **enteros de la unidad mínima** (centavos) y formatear solo al mostrar:

```js
const priceCents = 1999;
const totalCents = priceCents * 3; // 5997, exacto
(totalCents / 100).toFixed(2); // "59.97"
```

`toFixed` devuelve un **string** pensado para mostrar, no un número corregido para seguir calculando.

## En la entrevista

- ¿Por qué `===` no es confiable para comparar resultados con decimales?
- ¿Qué es `Number.EPSILON` y cuándo no alcanza?
- ¿Cómo representarías precios en un carrito de compras?
