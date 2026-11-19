---
title: ¿Qué imprime este cálculo del punto medio?
type: predict-output
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [binary-search]
language: java
code: |
  int low = 1_500_000_000;
  int high = 2_000_000_000;
  int mid = (low + high) / 2;
  System.out.println(mid);
expectedOutput: |-
  -397483648
---

Imprime `-397483648`: `low + high` vale 3 500 000 000, que no cabe en un `int`, y Java **desborda sin avisar** a un número negativo antes de dividir.

```java
int low = 1_500_000_000;
int high = 2_000_000_000;

low + high;             // -794967296: 3 500 000 000 - 2^32
(low + high) / 2;       // -397483648
low + (high - low) / 2; // 1750000000: la forma segura
```

**Por qué pasa:** un `int` ocupa 32 bits y su máximo es `Integer.MAX_VALUE` (2 147 483 647). Según la especificación (JLS 15.18.2), cuando una suma lo supera se quedan solo los 32 bits bajos del resultado real; en la práctica, el número "da la vuelta" como un cuentakilómetros: 3 500 000 000 − 4 294 967 296 = −794 967 296. No hay excepción. Dividir por 2 después no arregla nada.

**La consecuencia práctica:** es un error clásico al calcular el punto medio de una búsqueda binaria sobre arreglos muy grandes: `mid` sale negativo y el acceso `arr[mid]` lanza `ArrayIndexOutOfBoundsException`. Estuvo años en la búsqueda binaria del propio JDK. Las formas seguras son:

- `low + (high - low) / 2`: `high - low` es la distancia entre los dos y siempre cabe.
- `(low + high) >>> 1`: desplaza sin signo y lee la suma desbordada como el número positivo correcto.

**Las respuestas tentadoras:**

- `1750000000`: es lo que daría con matemática exacta, pero un `int` no puede guardar la suma intermedia.
- Una excepción: Java no lanza nada al desbordar sumas de `int`. Si quieres que falle, usa `Math.addExact(low, high)`.
