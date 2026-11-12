---
title: ¿Qué imprime este cálculo del punto medio?
type: predict-output
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
language: java
code: |
  int low = 1_500_000_000;
  int high = 2_000_000_000;
  int mid = (low + high) / 2;
  System.out.println(mid);
expectedOutput: |-
  -397483648
---

Imprime `-397483648`.

`low + high` vale 3 500 000 000, más que `Integer.MAX_VALUE` (2 147 483 647). La suma de `int` desborda sin avisar y da la vuelta a un número negativo; dividirlo por 2 sigue dando un negativo.

Es un error clásico en la búsqueda binaria sobre arreglos grandes. La forma segura es `low + (high - low) / 2`, que acá da `1750000000`.
