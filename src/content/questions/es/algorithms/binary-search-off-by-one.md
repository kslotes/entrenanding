---
title: Encuentra el error en esta búsqueda binaria
locale: es
type: spot-the-bug
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
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

`high` empieza en `arr.length`, una posición más allá del último índice válido.

Con la condición inclusiva `low <= high`, `mid` puede llegar a `arr.length`, así que buscar un valor mayor que todos los elementos lanza `ArrayIndexOutOfBoundsException`.

Solución: inicializar `high = arr.length - 1`. Los límites (`low <= high`, `high = mid - 1`) deben describir de forma consistente un intervalo cerrado `[low, high]`.
