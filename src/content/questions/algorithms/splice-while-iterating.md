---
title: Encuentra el error al eliminar elementos mientras se recorre el arreglo
type: spot-the-bug
category: algorithms
stack: [javascript]
seniority: [jr, ssr]
fundamentals: true
concepts: [modifying-collections-while-iterating]
language: javascript
code: |
  function removeEven(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] % 2 === 0) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }
bugLine: 4
---

El error está en `arr.splice(i, 1)` dentro de un bucle que avanza: `splice` quita el elemento y **corre una posición hacia la izquierda** todos los siguientes, pero el bucle hace `i++` igual. El elemento que acaba de llegar a la posición `i` nunca se revisa.

Paso a paso con `[2, 4, 6]`:

| `i` | Arreglo     | `arr[i]` | Acción                                |
| --- | ----------- | -------- | ------------------------------------- |
| 0   | `[2, 4, 6]` | `2`      | se quita; el `4` baja a la posición 0 |
| 1   | `[4, 6]`    | `6`      | se quita; el `4` nunca se revisó      |
| 2   | `[4]`       | —        | `2 < 1` es falso: el bucle termina    |

El resultado es `[4]`, sin ningún error en la consola.

**Por qué pasa:** `splice` **muta** el arreglo, es decir, lo modifica en el lugar en vez de crear uno nuevo. El índice `i` del bucle es la única noción de "por dónde voy", y deja de corresponder a los elementos en cuanto cambian de posición.

**La solución:**

```js
// 1. Crear un arreglo nuevo con los que se quedan (lo más claro).
const odds = arr.filter((n) => n % 2 !== 0);

// 2. Si hay que modificar el original, recorrer de atrás hacia adelante:
//    lo que se corre a la izquierda ya fue revisado.
for (let i = arr.length - 1; i >= 0; i--) {
  if (arr[i] % 2 === 0) arr.splice(i, 1);
}
```

En una app real el patrón aparece al limpiar listas: quitar productos sin stock de un carrito o filas inválidas de una tabla. En React, además, el estado no se muta, así que `filter` es la opción natural.
