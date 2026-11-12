---
title: ¿Qué imprime esta suma de decimales?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
language: javascript
code: |
  console.log(0.1 + 0.2);
  console.log(0.1 + 0.2 === 0.3);
expectedOutput: |-
  0.30000000000000004
  false
---

Imprime `0.30000000000000004` y `false`.

Los `number` de JavaScript son de punto flotante binario (IEEE 754, doble precisión). `0.1` y `0.2` no tienen representación binaria exacta, y el error de redondeo aparece en la suma.

- Para comparar decimales, usar una tolerancia: `Math.abs(a - b) < Number.EPSILON` sirve para valores cercanos a 1.
- Para dinero, trabajar en enteros (centavos) en lugar de decimales.
