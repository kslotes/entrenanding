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
  - title: "MDN: Intl.NumberFormat"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
---

## El problema: el carrito que no suma bien

Un carrito tiene diez productos de `0.10` y ofrece envío gratis si el total llega a `1`:

```js
const items = Array(10).fill(0.1);
const total = items.reduce((sum, price) => sum + price, 0);

console.log(total); // 0.9999999999999999
console.log(total >= 1); // false: el usuario no recibe el envío gratis
```

En papel, diez veces `0.10` es exactamente `1`. En JavaScript, no. No es un bug del motor ni de tu código: es cómo funcionan los números de **punto flotante** en casi todos los lenguajes, incluidos Java y C#. Entenderlo evita errores en totales, descuentos y comparaciones.

## Primero, los términos

- **Bit**: un dígito binario, `0` o `1`. La memoria guarda todo como bits.
- **Base 2** (binario): escribir números solo con `0` y `1`. En base 10, cada posición vale diez veces más que la siguiente; en base 2, dos veces más.
- **Punto flotante**: una forma de guardar números con decimales como "dígitos significativos × una potencia". Es como la notación científica (`1.5 × 10³`), pero en base 2.
- **Precisión**: cuántos dígitos significativos se pueden guardar. Lo que no entra, se redondea.
- **Error de redondeo**: la diferencia entre el valor que querías y el que realmente se guardó.
- **Tolerancia**: un margen de error aceptable al comparar dos números.

## Un solo tipo numérico

En JavaScript, `number` es un valor de **punto flotante binario de 64 bits** (IEEE 754 de doble precisión), igual que `double` en Java o C#. No hay un tipo entero separado de uso cotidiano: `42` y `4.2` son ambos `number`. (`BigInt` existe para enteros arbitrariamente grandes, pero no reemplaza a `number`).

Un double guarda un signo, un exponente y 52 bits de mantisa (los dígitos significativos). Eso da unos 15 a 17 dígitos decimales significativos; más allá de eso, los resultados se redondean.

## Por qué algunos decimales no son exactos

Con una cantidad finita de bits no se pueden representar todos los números. En base 10 pasa con `1/3 = 0.333...`: por más dígitos que escribas, nunca es exacto. En base 2 pasa con fracciones como `0.1`, que tiene infinitos dígitos binarios (`0.000110011001100...`). Se guarda el double más cercano, no el valor exacto:

```js
(0.1).toFixed(20); // "0.10000000000000000555": lo que realmente está guardado
1.1 + 2.2; // 3.3000000000000003
```

Las fracciones que son sumas de potencias de 2 (`0.5`, `0.25`, `0.125`) sí son exactas:

```js
0.5 + 0.25 === 0.75; // true
```

Cada operación puede introducir un pequeño error de redondeo, y esos errores se **acumulan**. Por eso sumar diez veces `0.1` da `0.9999999999999999`, y dos cálculos que en papel dan lo mismo pueden diferir en el último dígito.

## Comparar con tolerancia

En lugar de `===`, se compara si la diferencia es menor que un margen. `Number.EPSILON` (unos `2.2e-16`) es la distancia entre `1` y el siguiente double, y sirve como margen para valores cercanos a 1:

```js
function nearlyEqual(a, b, tolerance = Number.EPSILON) {
  return Math.abs(a - b) < tolerance;
}

nearlyEqual(0.1 + 0.2, 0.3); // true
nearlyEqual(1000.1 + 1000.2, 2000.3); // false: el error crece con la magnitud
nearlyEqual(1000.1 + 1000.2, 2000.3, 2000 * Number.EPSILON); // true
```

El margen debe **escalar con el tamaño** de los números que comparas: cerca de 2000, la distancia entre dos doubles consecutivos es unas 2000 veces mayor que cerca de 1. Para medidas físicas o porcentajes, lo habitual es elegir una tolerancia según el dominio (por ejemplo, "da igual por debajo de 0.001").

## Enteros seguros

Los enteros son exactos solo hasta `Number.MAX_SAFE_INTEGER` (`2^53 - 1`, `9007199254740991`). Por encima, dos enteros distintos pueden quedar representados por el mismo double:

```js
2 ** 53 === 2 ** 53 + 1; // true
9007199254740993; // se guarda como 9007199254740992
```

Dónde aparece: ids de 64 bits que vienen de una base de datos o de una API (por ejemplo, ids de tweets). Si los lees como `number`, el último dígito puede cambiar y terminas pidiendo otro recurso. Por eso esas APIs suelen enviarlos como string, o se usan con `BigInt`.

## Dinero y decimales exactos

Para montos, la práctica habitual es trabajar en **enteros de la unidad mínima** (centavos) y formatear solo al mostrar:

```js
const priceCents = 10; // 0.10
const totalCents = Array(10)
  .fill(priceCents)
  .reduce((sum, p) => sum + p, 0); // 100, exacto
totalCents >= 100; // true: ahora sí hay envío gratis

(totalCents / 100).toFixed(2); // "1.00"
```

Los enteros son exactos mientras no pasen de `Number.MAX_SAFE_INTEGER`, que en centavos son más de 90 billones de pesos o dólares: suficiente para cualquier carrito.

`toFixed` devuelve un **string** pensado para mostrar, no un número corregido para seguir calculando. Y redondea el valor binario guardado, no el decimal que escribiste:

```js
(1.005).toFixed(2); // "1.00", no "1.01": 1.005 se guarda como 1.00499999...
```

Para mostrar montos al usuario, `Intl.NumberFormat` además agrega el símbolo de moneda y el separador de miles según el idioma:

```js
new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
  1999.5,
);
// "$ 1.999,50"
```

En el backend se usan tipos decimales exactos, como `BigDecimal` en Java. Lo explica [la página de dinero con BigDecimal](./bigdecimal-money.md).

## En la entrevista

### ¿Por qué `===` no es confiable para comparar resultados con decimales?

Porque muchos decimales, como `0.1` o `0.2`, no tienen representación exacta en binario: se guarda el valor más cercano, y cada operación puede sumar un pequeño error de redondeo. `0.1 + 0.2` da `0.30000000000000004`, así que `0.1 + 0.2 === 0.3` es `false`. Para comparar, se mira si la diferencia es menor que una tolerancia.

### ¿Qué es `Number.EPSILON` y cuándo no alcanza?

Es la distancia entre `1` y el siguiente número representable, unos `2.2e-16`. Sirve como tolerancia para valores cercanos a 1, pero no alcanza para números grandes, porque la distancia entre doubles crece con la magnitud: `1000.1 + 1000.2` y `2000.3` difieren en más que `Number.EPSILON`. En ese caso la tolerancia tiene que escalar con los valores, o definirse según el dominio.

### ¿Cómo representarías precios en un carrito de compras?

Como enteros en la unidad mínima, por ejemplo centavos: `1999` en lugar de `19.99`. Las sumas y multiplicaciones de enteros son exactas, así que los totales y las comparaciones con umbrales no fallan. Solo al mostrar se divide por 100 y se formatea, idealmente con `Intl.NumberFormat`. En el backend, un tipo decimal exacto como `BigDecimal`.
