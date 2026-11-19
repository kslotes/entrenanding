---
title: Quicksort y la elección del pivote
stack: []
references:
  - title: "MIT 6.046J (Fall 2005), Lecture 4: Quicksort, Randomized Algorithms"
    url: https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-4-quicksort-randomized-algorithms/
  - title: "Arrays.sort (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html
  - title: "List.sort (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)
---

## El problema: el mismo algoritmo, rápido o lentísimo

Quicksort es uno de los algoritmos de ordenamiento más usados porque en la práctica es muy rápido. Pero una implementación ingenua tiene una trampa: con 1000 elementos desordenados hace unas 10 000 comparaciones, y con los **mismos** 1000 elementos ya ordenados al revés hace casi 500 000. Cincuenta veces más, solo por el orden en que llegaron los datos.

Y los datos ordenados o casi ordenados son muy comunes en una app real: registros que vienen de la base de datos ordenados por fecha, una lista que se vuelve a ordenar después de agregar un elemento. Entender por qué pasa esto es entender cómo funciona quicksort.

## Primero, los términos

- **Ordenar**: reacomodar los elementos de menor a mayor (o según otro criterio).
- **Divide y vencerás**: resolver un problema partiéndolo en problemas más chicos del mismo tipo, resolverlos y juntar los resultados.
- **Pivote**: el elemento que se elige en cada paso para separar los demás en "menores" y "mayores".
- **Partición**: el paso que reordena el tramo alrededor del pivote.
- **O(n log n)** y **O(n²)**: cómo crece la cantidad de pasos con `n` elementos. Con `n = 1000`, `n log n` es unos 10 000 y `n²` es un millón.
- **Recursión**: una función que se llama a sí misma con un problema más chico. La explica [la página de recursión](./recursion.md).
- **Estable**: un ordenamiento es estable si los elementos que se consideran iguales mantienen el orden que tenían entre sí.

## Cómo funciona

Quicksort ordena con la estrategia "divide y vencerás":

1. Elige un elemento, el **pivote**.
2. **Particiona**: reordena el arreglo para que los menores que el pivote queden a su izquierda y los mayores a su derecha. El pivote queda en su posición final.
3. Ordena recursivamente cada lado. No hace falta combinar nada al final: si cada lado está ordenado y el pivote está en el medio, todo está ordenado.

Paso a paso con `[7, 2, 9, 4, 5]` y el último elemento como pivote:

```text
pivote 5:  [7, 2, 9, 4, 5]  ->  [2, 4] 5 [7, 9]   el 5 ya está en su lugar
izquierda: [2, 4], pivote 4 ->  [2] 4             el 4 ya está en su lugar
derecha:   [7, 9], pivote 9 ->  [7] 9             el 9 ya está en su lugar
resultado: [2, 4, 5, 7, 9]
```

Todo el trabajo está en la partición, que recorre el tramo una vez: `O(n)` por nivel. Una versión con el **último** elemento como pivote (partición de Lomuto), que cuenta comparaciones:

```java
static long comparisons;

static void quicksort(int[] a, int lo, int hi) {
  if (lo >= hi) return; // caso base: 0 o 1 elementos ya están ordenados
  int p = partition(a, lo, hi);
  quicksort(a, lo, p - 1); // menores que el pivote
  quicksort(a, p + 1, hi); // mayores que el pivote
}

static int partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo; // todo lo que está antes de i es menor que el pivote
  for (int j = lo; j < hi; j++) {
    comparisons++;
    if (a[j] < pivot) swap(a, i++, j); // lo manda a la zona de los menores
  }
  swap(a, i, hi); // el pivote va justo después de los menores: su posición final
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

- **Particiones equilibradas**: cada nivel parte el problema a la mitad, hay unos `log n` niveles y cada uno cuesta `O(n)`. Total: `O(n log n)`.
- **Particiones desequilibradas**: si el pivote es siempre el menor o el mayor del tramo, un lado queda vacío y el otro tiene `n - 1` elementos. Hay `n` niveles y el total es `(n - 1) + (n - 2) + ... + 1`, que da `n(n - 1) / 2`: `O(n²)`.

```text
Equilibrado (n = 8):        Desequilibrado (n = 8, ya ordenado, pivote el último):
        8                   8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1
      4   4                 cada nivel solo separa el pivote
     2 2 2 2
3 niveles (log₂ 8)          8 niveles (n)
```

La clase de MIT 6.046J hace este análisis completo e incluye un caso intermedio: incluso una división fija de 1/10 contra 9/10 sigue siendo `O(n log n)`. Lo que hace daño es que la partición deje sistemáticamente casi todo de un lado.

Contando comparaciones con la versión de arriba y 1000 elementos:

| Entrada                                   | Comparaciones |
| ----------------------------------------- | ------------- |
| Desordenada al azar                       | 10128         |
| Ordenada de mayor a menor                 | 499500        |
| Todos los elementos iguales               | 499500        |
| Ordenada de mayor a menor, pivote al azar | 10501         |

Como referencia, `1000 · log₂ 1000 ≈ 9966` y `1000 · 999 / 2 = 499500`. Con el último elemento como pivote, en la entrada ordenada de mayor a menor cada partición deja uno de los dos lados vacío. Con elementos repetidos, esta partición también se desequilibra: ningún elemento es "menor" que el pivote, así que todos quedan del mismo lado. La clase menciona que la partición original de Hoare se comporta mejor en ese caso.

## Pivote aleatorio

Si el pivote se elige al azar, ninguna entrada concreta es mala de forma sistemática: el peor caso sigue existiendo, pero depende de la suerte del generador de números aleatorios y no de cómo venían los datos. Es el argumento central de la clase de MIT para el quicksort aleatorizado. El cambio es una línea antes de particionar:

```java
static int randomizedPartition(int[] a, int lo, int hi) {
  int r = ThreadLocalRandom.current().nextInt(lo, hi + 1);
  swap(a, r, hi); // un elemento al azar pasa a ser el pivote
  return partition(a, lo, hi);
}
```

Con esto, la entrada ordenada de mayor a menor pasa de 499 500 a unas 10 500 comparaciones, como muestra la última fila de la tabla.

## En la biblioteca estándar de Java

En código real no escribes quicksort: usas la biblioteca, que ya resuelve estos problemas.

- `Arrays.sort(int[])` (y los demás primitivos) usa **Dual-Pivot Quicksort**, una variante con dos pivotes. Según la documentación, ofrece `O(n log n)` en todos los conjuntos de datos.
- `Arrays.sort(Object[])` y `List.sort` usan un mergesort **estable**: los elementos iguales no cambian de orden entre sí.

La estabilidad importa al ordenar por varios criterios. Si una lista de pedidos ya está ordenada por fecha y la ordenas por estado, un orden estable mantiene la fecha dentro de cada estado:

```java
orders.sort(Comparator.comparing(Order::status)); // estable: dentro de cada estado, sigue el orden por fecha
```

Para primitivos la estabilidad no importa: dos `int` iguales son indistinguibles.

## En la entrevista

### ¿Por qué la partición es el paso que hace todo el trabajo?

Porque deja el pivote en su posición final y separa el resto en dos grupos que ya no necesitan mezclarse: todo lo de la izquierda es menor y todo lo de la derecha es mayor. Después de ordenar cada lado, el arreglo completo queda ordenado sin ningún paso de combinación. A diferencia de mergesort, que divide sin trabajo y combina con trabajo, quicksort trabaja al dividir y combina gratis.

### ¿Qué tipo de entradas desequilibran las particiones con un pivote fijo?

Las que hacen que el pivote sea siempre el menor o el mayor del tramo. Con el último elemento como pivote: un arreglo ya ordenado, uno ordenado al revés o uno con todos los elementos iguales (con la partición de Lomuto). Cada partición separa un solo elemento, hay `n` niveles y el costo pasa a `O(n²)`: con 1000 elementos, 499 500 comparaciones en lugar de unas 10 000.

### ¿Qué gana quicksort al elegir el pivote al azar?

Que el costo deja de depender de cómo vienen los datos. Con un pivote fijo, cualquier entrada ordenada provoca el peor caso siempre; con un pivote aleatorio, el peor caso solo ocurre por mala suerte del generador, y su probabilidad es bajísima. El tiempo esperado es `O(n log n)` para cualquier entrada.
