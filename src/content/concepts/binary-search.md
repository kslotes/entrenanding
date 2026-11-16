---
title: Búsqueda binaria
stack: [java]
references:
  - title: "Collections.binarySearch (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html
  - title: "Arrays.binarySearch (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html
  - title: "JLS 15.18.2: Additive Operators for Numeric Types"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.2
  - title: "JLS 4.2.1: Integral Types and Values"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.1
  - title: "Joshua Bloch: Nearly All Binary Searches and Mergesorts are Broken (Google Research, 2006)"
    url: https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/
---

## La idea

La búsqueda binaria encuentra un valor en una secuencia **ordenada**. En cada paso compara el elemento del medio con el buscado y descarta la mitad donde seguro no está.

Como cada paso reduce el intervalo a la mitad, la cantidad de pasos crece con el logaritmo en base 2 de `n`. En el peor caso, con 1000 elementos alcanzan 10 comparaciones y con un millón, 20. La documentación de `Collections.binarySearch` lo dice así: el método corre en tiempo `log(n)` sobre una lista de acceso aleatorio.

El requisito de orden no es opcional. Según la documentación de `Arrays.binarySearch`, si el arreglo no está ordenado, el resultado no está definido.

## El intervalo y sus límites

Toda búsqueda binaria mantiene un intervalo donde todavía puede estar el valor. Hay dos convenciones, y cada una fija los demás detalles:

| Convención    | Inicio de `high` | Condición del bucle | Al descartar la derecha |
| ------------- | ---------------- | ------------------- | ----------------------- |
| `[low, high]` | último índice    | `low <= high`       | `high = mid - 1`        |
| `[low, high)` | `arr.length`     | `low < high`        | `high = mid`            |

Mezclar piezas de las dos convenciones produce errores de "uno de más": el bucle no termina, se salta un elemento o lee fuera del arreglo. Un ejemplo con intervalo semiabierto que devuelve la primera posición con un valor mayor o igual al buscado:

```java
static int lowerBound(int[] arr, int target) {
  int low = 0;
  int high = arr.length; // high nunca se lee: el intervalo es [low, high)
  while (low < high) {
    int mid = low + (high - low) / 2;
    if (arr[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low;
}

int[] sorted = {3, 8, 15, 23, 42};
lowerBound(sorted, 23); // 3
lowerBound(sorted, 16); // 3: posición donde se insertaría
lowerBound(sorted, 99); // 5: después del último
```

Para revisar una implementación, prueba siempre los bordes: el primer elemento, el último, un valor menor que todos y uno mayor que todos.

## El punto medio y el desbordamiento de int

Un `int` va de -2147483648 a 2147483647 (JLS 4.2.1). Según JLS 15.18.2, si una suma de enteros desborda, el resultado son los bits bajos de la suma real y el signo cambia. Java no lanza ninguna excepción:

```java
int big = Integer.MAX_VALUE;
System.out.println(big + 1); // -2147483648

int a = 2_000_000_000;
int b = 2_100_000_000;
System.out.println((a + b) / 2);       // -97483648
System.out.println(a + (b - a) / 2);   // 2050000000
System.out.println((a + b) >>> 1);     // 2050000000
```

`a + (b - a) / 2` nunca suma dos valores grandes. `>>> 1` desplaza sin signo, así que interpreta el resultado desbordado como un número positivo de 32 bits. Joshua Bloch documentó en 2006 que este error estaba en la búsqueda binaria del propio JDK durante años. Si necesitas que el desbordamiento falle en lugar de pasar en silencio, `Math.addExact(a, b)` lanza `ArithmeticException`.

## En la biblioteca estándar

`Arrays.binarySearch` y `Collections.binarySearch` devuelven el índice si encuentran el valor y, si no, `-(punto de inserción) - 1`. Así un resultado negativo indica "no está" y además dice dónde iría:

```java
Arrays.binarySearch(new int[] {3, 8, 15, 23, 42}, 16); // -4: iría en la posición 3
```

## En la entrevista

- ¿Por qué la búsqueda binaria necesita datos ordenados? ¿Cuántos pasos hace con un millón de elementos?
- ¿Qué cambia entre un intervalo cerrado y uno semiabierto?
- ¿Cómo calculas el punto medio sin desbordar un `int`?
