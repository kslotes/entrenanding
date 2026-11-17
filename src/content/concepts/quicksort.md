---
title: Quicksort y la elección del pivote
stack: []
references:
  - title: "MIT 6.046J (Fall 2005), Lecture 4: Quicksort, Randomized Algorithms"
    url: https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-4-quicksort-randomized-algorithms/
  - title: "Arrays.sort (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html
---

## Cómo funciona

Quicksort ordena con la estrategia "divide y vencerás":

1. Elige un elemento, el **pivote**.
2. **Particiona**: reordena el arreglo para que los menores que el pivote queden a su izquierda y los mayores a su derecha. El pivote queda en su posición final.
3. Ordena recursivamente cada lado. No hace falta combinar nada al final.

Todo el trabajo está en la partición, que recorre el tramo una vez: O(n) por nivel. Una versión con el **último** elemento como pivote (partición de Lomuto), que cuenta comparaciones:

```java
static long comparisons;

static void quicksort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int p = partition(a, lo, hi);
  quicksort(a, lo, p - 1);
  quicksort(a, p + 1, hi);
}

static int partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo;
  for (int j = lo; j < hi; j++) {
    comparisons++;
    if (a[j] < pivot) swap(a, i++, j);
  }
  swap(a, i, hi);
  return i;
}

static void swap(int[] a, int i, int j) {
  int t = a[i];
  a[i] = a[j];
  a[j] = t;
}
```

## Por qué el pivote decide el costo

El costo total depende de qué tan parejas salen las particiones:

- **Particiones equilibradas**: cada nivel parte el problema a la mitad, hay unos `log n` niveles y cada uno cuesta O(n). Total: O(n log n).
- **Particiones desequilibradas**: si el pivote es siempre el menor o el mayor del tramo, un lado queda vacío y el otro tiene `n - 1` elementos. Hay `n` niveles y el total es `(n - 1) + (n - 2) + ... + 1`, una serie aritmética.

La clase de MIT 6.046J hace este análisis completo e incluye un caso intermedio: incluso una división fija de 1/10 contra 9/10 sigue siendo O(n log n). Lo que hace daño es que la partición deje sistemáticamente casi todo de un lado.

Contando comparaciones con la versión de arriba y 1000 elementos:

| Entrada                                   | Comparaciones |
| ----------------------------------------- | ------------- |
| Desordenada al azar                       | 10128         |
| Ordenada de mayor a menor                 | 499500        |
| Todos los elementos iguales               | 499500        |
| Ordenada de mayor a menor, pivote al azar | 10501         |

Como referencia, `1000 · log₂ 1000 ≈ 9966` y `1000 · 999 / 2 = 499500`. Con el último elemento como pivote, en la entrada ordenada de mayor a menor cada partición deja uno de los dos lados vacío. Con elementos repetidos, esta partición también se desequilibra; la clase menciona que la partición original de Hoare se comporta mejor en ese caso.

## Pivote aleatorio

Si el pivote se elige al azar (por ejemplo, intercambiando un elemento aleatorio con el último antes de particionar), ninguna entrada concreta es mala de forma sistemática: el peor caso sigue existiendo, pero depende de la suerte del generador de números aleatorios y no de cómo venían los datos. Es el argumento central de la clase de MIT para el quicksort aleatorizado.

## En la biblioteca estándar de Java

- `Arrays.sort(int[])` usa **Dual-Pivot Quicksort**. Según la documentación, ofrece O(n log n) en todos los conjuntos de datos.
- `Arrays.sort(Object[])` usa un mergesort **estable**: los elementos iguales no cambian de orden entre sí.

## En la entrevista

- ¿Por qué la partición es el paso que hace todo el trabajo?
- ¿Qué tipo de entradas desequilibran las particiones con un pivote fijo?
- ¿Qué gana quicksort al elegir el pivote al azar?
