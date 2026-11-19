---
title: ¿Qué imprime este ordenamiento?
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
concepts: [js-array-sort]
language: javascript
code: |
  const nums = [10, 9, 1];
  nums.sort();
  console.log(nums.join(","));
expectedOutput: |-
  1,10,9
---

Imprime `1,10,9`: sin una función de comparación, `sort` **convierte los números a string** y los ordena como texto, carácter por carácter.

```js
[10, 9, 1].sort();
// compara "10", "9" y "1" como palabras de un diccionario:
// "1" < "10"  (es un prefijo)
// "10" < "9"  (el primer carácter decide: "1" va antes que "9")
// resultado: [1, 10, 9]

[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]: compara como números
```

**Por qué pasa:** un array de JavaScript puede mezclar tipos, y el orden por defecto convierte todo a string para poder comparar cualquier cosa. En un string, `"10"` va antes que `"9"` por la misma razón que "casa" va antes que "dado": decide el primer carácter distinto, no la longitud.

**La consecuencia práctica:** ordenar precios, edades o ids con `sort()` sin argumentos da resultados que parecen al azar, y sin ningún error. Para números siempre se pasa un comparador: `(a, b) => a - b` (ascendente) o `(a, b) => b - a` (descendente). Además, `sort` **modifica el array original**; si el array es compartido o es estado de React, usa `toSorted`, que devuelve una copia ordenada.

**Las respuestas tentadoras:**

- `1,9,10`: es el orden numérico, el que da con un comparador `(a, b) => a - b`.
- `10,9,1`: supone que sin comparador `sort` no cambia nada, pero siempre reordena (como texto).
