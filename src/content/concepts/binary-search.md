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
  - title: "git bisect documentation"
    url: https://git-scm.com/docs/git-bisect
---

## El problema: buscar uno por uno es lento

Tienes un arreglo con un millón de precios ordenados y quieres saber si está el `4999`. La forma directa es mirar uno por uno:

```java
static int linearSearch(int[] prices, int target) {
  for (int i = 0; i < prices.length; i++) {
    if (prices[i] == target) return i;
  }
  return -1; // en el peor caso miró el millón de elementos
}
```

Si el valor no está, revisaste un millón de posiciones. Pero el arreglo está **ordenado**, y eso es información que este código desperdicia: si el elemento del medio es `7000`, el `4999` solo puede estar en la mitad izquierda. La búsqueda binaria aprovecha eso y resuelve el mismo caso en **20 comparaciones**.

Es la misma estrategia que usas para buscar una palabra en un diccionario de papel: abres por la mitad, ves si te pasaste, y descartas medio libro.

## Primero, los términos

- **Ordenado**: cada elemento es menor o igual que el siguiente (`[3, 8, 15, 23, 42]`).
- **Índice**: la posición de un elemento, empezando en `0`.
- **Intervalo**: el rango de índices donde el valor todavía puede estar. Se describe con dos variables, `low` (inicio) y `high` (fin).
- **Complejidad** u **O grande** (_Big O_): cómo crece la cantidad de pasos cuando crece la cantidad de datos `n`. `O(n)` significa que los pasos crecen igual que `n`; `O(log n)`, que crecen muchísimo más despacio.
- **Logaritmo en base 2** (`log₂ n`): cuántas veces puedes dividir `n` por 2 hasta llegar a 1. `log₂ 1024 = 10` porque 1024 → 512 → ... → 1 son 10 divisiones.
- **Error off-by-one** ("uno de más"): un error de límites que hace que el bucle mire una posición de más o de menos.
- **Desbordamiento** (_overflow_): cuando una operación da un número más grande del que cabe en el tipo.

## La idea

En cada paso, la búsqueda binaria compara el elemento del medio del intervalo con el buscado y descarta la mitad donde seguro no está.

Paso a paso, buscando `23` en `[3, 8, 15, 23, 42]`:

| Paso | `low` | `high` | `mid` | `arr[mid]` | Decisión                         |
| ---- | ----- | ------ | ----- | ---------- | -------------------------------- |
| 1    | 0     | 4      | 2     | 15         | `15 < 23`: descarto la izquierda |
| 2    | 3     | 4      | 3     | 23         | encontrado en el índice 3        |

```java
static int binarySearch(int[] arr, int target) {
  int low = 0;
  int high = arr.length - 1; // intervalo cerrado [low, high]: high es el último índice válido
  while (low <= high) {
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) low = mid + 1; // está a la derecha
    else high = mid - 1;                  // está a la izquierda
  }
  return -1; // el intervalo quedó vacío: no está
}
```

Como cada paso reduce el intervalo a la mitad, la cantidad de pasos crece con `log₂ n`: la complejidad es **O(log n)**. En el peor caso, con 1000 elementos alcanzan 10 comparaciones y con un millón, 20. La documentación de `Collections.binarySearch` lo dice así: el método corre en tiempo `log(n)` sobre una lista de acceso aleatorio (una que permite leer cualquier posición directamente, como `ArrayList`).

El requisito de orden no es opcional. Según la documentación de `Arrays.binarySearch`, si el arreglo no está ordenado, el resultado no está definido: puede decir que un valor no está cuando sí está. Y si tienes que ordenar antes, ordenar cuesta `O(n log n)`, más que una búsqueda lineal. La binaria conviene cuando los datos ya están ordenados o cuando vas a buscar muchas veces sobre los mismos datos.

### Dónde aparece en una app real

- **Rangos y tramos**: buscar en qué tramo de impuestos o de precios cae un monto, sobre una lista ordenada de límites.
- **Datos ordenados por tiempo**: encontrar el primer evento de un log a partir de cierta hora.
- **`git bisect`**: para encontrar qué commit introdujo un bug, Git hace una búsqueda binaria sobre el historial. Marcas un commit bueno y uno malo, y en cada paso te pide probar el del medio.

## El intervalo y sus límites

Toda búsqueda binaria mantiene un intervalo donde todavía puede estar el valor. Hay dos convenciones, y cada una fija los demás detalles:

| Convención    | Inicio de `high` | Condición del bucle | Al descartar la derecha |
| ------------- | ---------------- | ------------------- | ----------------------- |
| `[low, high]` | último índice    | `low <= high`       | `high = mid - 1`        |
| `[low, high)` | `arr.length`     | `low < high`        | `high = mid`            |

El corchete `[` significa "incluido" y el paréntesis `)` significa "excluido". En `[low, high)`, el índice `high` no forma parte del intervalo, por eso puede valer `arr.length` sin que se lea nunca.

Mezclar piezas de las dos convenciones produce errores off-by-one: el bucle no termina, se salta un elemento o lee fuera del arreglo. Por ejemplo, `high = arr.length` (semiabierto) con `low <= high` (cerrado):

```java
int[] arr = {1, 2, 3};
int low = 0, high = arr.length; // high = 3, que no es un índice válido
// buscando 5: low pasa a 2, luego a 3; con low <= high, mid = 3
// arr[3] -> ArrayIndexOutOfBoundsException
```

Un ejemplo correcto con intervalo semiabierto, que devuelve la primera posición con un valor mayor o igual al buscado (útil para "¿dónde lo insertaría?"):

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

Para revisar una implementación, prueba siempre los bordes: el primer elemento, el último, un valor menor que todos y uno mayor que todos. Ahí es donde aparecen los errores off-by-one.

## El punto medio y el desbordamiento de int

Un `int` va de -2147483648 a 2147483647 (JLS 4.2.1). Según JLS 15.18.2, si una suma de enteros desborda, el resultado son los bits bajos de la suma real y el signo puede cambiar. Java no lanza ninguna excepción: el número "da la vuelta" como un cuentakilómetros.

```java
int big = Integer.MAX_VALUE;
System.out.println(big + 1); // -2147483648

int a = 2_000_000_000;
int b = 2_100_000_000;
System.out.println((a + b) / 2);     // -97483648: a + b desbordó antes de dividir
System.out.println(a + (b - a) / 2); // 2050000000
System.out.println((a + b) >>> 1);   // 2050000000
```

Por qué funcionan las versiones seguras:

- `a + (b - a) / 2` nunca suma dos valores grandes: `b - a` es la distancia entre ellos, que siempre cabe, y la mitad de esa distancia sumada a `a` nunca pasa de `b`.
- `>>> 1` desplaza un bit a la derecha **sin signo** (divide por 2), así que interpreta el resultado desbordado como un número positivo de 32 bits, que es la suma real.

En una búsqueda binaria esto pasa cuando `low` y `high` son grandes, es decir, con arreglos de más de unos mil millones de elementos. Joshua Bloch documentó en 2006 que este error estuvo durante años en la búsqueda binaria del propio JDK. Si necesitas que el desbordamiento falle en lugar de pasar en silencio, `Math.addExact(a, b)` lanza `ArithmeticException`.

## En la biblioteca estándar

En código real casi nunca escribes la búsqueda a mano. `Arrays.binarySearch` y `Collections.binarySearch` devuelven el índice si encuentran el valor y, si no, `-(punto de inserción) - 1`. Así un resultado negativo indica "no está" y además dice dónde iría:

```java
int[] sorted = {3, 8, 15, 23, 42};
Arrays.binarySearch(sorted, 23); // 3
Arrays.binarySearch(sorted, 16); // -4: no está; iría en la posición 3 (-(3) - 1)
```

El `- 1` existe para distinguir "no está, iría en la posición 0" (`-1`) de "está en la posición 0" (`0`).

## En la entrevista

### ¿Por qué la búsqueda binaria necesita datos ordenados? ¿Cuántos pasos hace con un millón de elementos?

Porque la decisión de descartar una mitad depende del orden: si el del medio es menor que el buscado, solo sabes que todo lo de la izquierda también es menor si el arreglo está ordenado. Sin orden, el resultado no está definido. Con un millón de elementos hace como mucho **20** comparaciones, porque 2²⁰ es aproximadamente un millón: la complejidad es `O(log n)`.

### ¿Qué cambia entre un intervalo cerrado y uno semiabierto?

En el cerrado `[low, high]`, `high` es un índice válido: empieza en `arr.length - 1`, el bucle es `low <= high` y al descartar la derecha haces `high = mid - 1`. En el semiabierto `[low, high)`, `high` está excluido: empieza en `arr.length`, el bucle es `low < high` y haces `high = mid`. Las dos funcionan; el error es mezclarlas, por ejemplo `high = arr.length` con `low <= high`, que termina leyendo `arr[arr.length]`.

### ¿Cómo calculas el punto medio sin desbordar un `int`?

Con `low + (high - low) / 2` o con `(low + high) >>> 1`. La forma ingenua `(low + high) / 2` suma dos números grandes y puede pasar de `Integer.MAX_VALUE`; Java no avisa y el resultado sale negativo, lo que termina en un índice inválido.

```java
int low = 1_500_000_000, high = 2_000_000_000;
(low + high) / 2;      // -397483648
low + (high - low) / 2; // 1750000000
```
