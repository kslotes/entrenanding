---
title: Encuentra el error al eliminar elementos mientras se recorre el arreglo
type: spot-the-bug
category: algorithms
stack: [javascript]
seniority: [jr, ssr]
fundamentals: true
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

`splice` corre una posición hacia la izquierda todos los elementos siguientes, pero el bucle avanza `i` igual. El elemento que ocupa la posición `i` nunca se revisa.

Con `[2, 4, 6]`: se elimina el `2`, el `4` pasa a la posición 0 y el bucle sigue en la posición 1 (el `6`). El resultado es `[4]`.

Soluciones:

- Crear un arreglo nuevo: `arr.filter((n) => n % 2 !== 0)`.
- Si hay que modificar el original, recorrerlo de atrás hacia adelante.
