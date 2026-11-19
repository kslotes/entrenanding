---
title: ¿Qué imprime esta suma de decimales?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
concepts: [floating-point-numbers]
language: javascript
code: |
  console.log(0.1 + 0.2);
  console.log(0.1 + 0.2 === 0.3);
expectedOutput: |-
  0.30000000000000004
  false
---

Imprime `0.30000000000000004` y `false`: `0.1` y `0.2` **no se pueden guardar exactos** en binario, y el pequeño error de cada uno aparece al sumarlos.

```js
(0.1).toFixed(20); // "0.10000000000000000555": lo que realmente se guardó
(0.2).toFixed(20); // "0.20000000000000001110"
0.1 + 0.2; // 0.30000000000000004
0.1 + 0.2 === 0.3; // false: el último dígito ya no coincide
```

**Por qué pasa:** los `number` de JavaScript son de **punto flotante binario** (IEEE 754, doble precisión): guardan los números en base 2 con una cantidad fija de dígitos. Igual que `1/3` en base 10 es `0.333...` y nunca termina, `0.1` en base 2 tiene infinitos dígitos, así que se guarda el valor más cercano posible. Pasa lo mismo con `double` en Java o C#.

**La consecuencia práctica:** comparar decimales con `===` falla, y los errores se acumulan al sumar muchos: diez veces `0.1` da `0.9999999999999999`, lo que puede hacer que un carrito no llegue al mínimo de "envío gratis".

- Para comparar, usa una tolerancia: `Math.abs(a - b) < Number.EPSILON` sirve para valores cercanos a 1; para números más grandes, el margen tiene que crecer con ellos.
- Para dinero, trabaja en enteros de la unidad mínima (centavos): `10 + 20 === 30` es exacto, y solo al mostrar divides por 100.

**Las respuestas tentadoras:**

- `0.3` y `true`: es la matemática exacta, pero ni `0.1` ni `0.2` están guardados exactos.
- `0.30000000000000004` y `true`: `===` no tiene tolerancia; compara bit a bit, y basta con que difiera el último dígito.
