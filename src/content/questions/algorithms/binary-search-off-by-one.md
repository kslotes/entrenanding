---
title: Encuentra el error en esta búsqueda binaria
type: spot-the-bug
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [binary-search]
language: java
code: |
  public static int binarySearch(int[] arr, int target) {
      int low = 0;
      int high = arr.length;
      while (low <= high) {
          int mid = low + (high - low) / 2;
          if (arr[mid] == target) return mid;
          if (arr[mid] < target) low = mid + 1;
          else high = mid - 1;
      }
      return -1;
  }
bugLine: 3
---

El error está en `int high = arr.length;`: `high` empieza **una posición más allá** del último índice válido, pero el resto del código trata a `high` como un índice que se puede leer.

Paso a paso con `arr = {1, 2, 3}` buscando `5`:

| `low` | `high` | `mid` | `arr[mid]`                                 |
| ----- | ------ | ----- | ------------------------------------------ |
| 0     | 3      | 1     | `2 < 5`: `low = 2`                         |
| 2     | 3      | 2     | `3 < 5`: `low = 3`                         |
| 3     | 3      | 3     | `arr[3]`: `ArrayIndexOutOfBoundsException` |

Con `low <= high`, el bucle sigue cuando los dos valen 3, y `arr[3]` no existe en un arreglo de 3 elementos.

**Por qué pasa:** una búsqueda binaria mantiene un **intervalo** de índices donde el valor todavía puede estar, y hay dos convenciones:

- Cerrado `[low, high]`: `high = arr.length - 1`, bucle `low <= high`, `high = mid - 1`.
- Semiabierto `[low, high)`: `high = arr.length`, bucle `low < high`, `high = mid`.

Este código mezcla el inicio de la semiabierta con el resto de la cerrada. Es un error _off-by-one_ ("uno de más") y solo aparece en los bordes: los tests con valores del medio pasan.

**La solución:** usar una sola convención. Con la cerrada:

```java
int high = arr.length - 1; // último índice válido
while (low <= high) { /* ... */ }
```

Para detectar estos errores, prueba siempre el primer elemento, el último, un valor menor que todos y uno mayor que todos.
