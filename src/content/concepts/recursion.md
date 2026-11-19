---
title: Recursión y casos base
stack: [java]
references:
  - title: "JVMS 2.5.2: Java Virtual Machine Stacks"
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.5.2
  - title: "JVMS 2.6: Frames"
    url: https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-2.html#jvms-2.6
  - title: "StackOverflowError (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StackOverflowError.html
---

## El problema: datos sin una profundidad fija

Una tienda tiene categorías que contienen subcategorías, que a su vez contienen otras, sin un límite fijo:

```text
Electrónica
├── Computadoras
│   ├── Notebooks
│   └── Accesorios
│       └── Teclados
└── Celulares
```

Quieres contar cuántas categorías hay en total. Con bucles anidados tendrías que escribir un `for` por cada nivel, y no sabes cuántos niveles hay:

```java
for (Category c1 : root.children()) {
  for (Category c2 : c1.children()) {
    for (Category c3 : c2.children()) {
      // ¿y si hay un cuarto nivel? ¿y un décimo?
    }
  }
}
```

La observación clave es que **cada subcategoría es, a su vez, un árbol de categorías**: el mismo problema, pero más chico. La recursión aprovecha eso:

```java
record Category(String name, List<Category> children) {}

static int count(Category category) {
  int total = 1; // esta categoría
  for (Category child : category.children()) {
    total += count(child); // el mismo problema, sobre un árbol más chico
  }
  return total; // una categoría sin hijos devuelve 1: ahí termina
}
```

Funciona con cualquier profundidad. El mismo patrón aparece al calcular el tamaño de una carpeta con subcarpetas, al mostrar comentarios con respuestas anidadas o al recorrer un JSON.

## Primero, los términos

- **Función recursiva**: una función que se llama a sí misma para resolver una versión más chica del mismo problema.
- **Caso base**: una entrada que se resuelve directamente, sin volver a llamar a la función. Es lo que hace que la recursión termine.
- **Caso recursivo**: la parte que reduce el problema y se llama a sí misma con esa entrada más chica.
- **Pila de llamadas** (_call stack_): la lista de llamadas que empezaron y todavía no terminaron. La que está arriba es la que se está ejecutando.
- **Frame**: el espacio que ocupa cada llamada en la pila, con sus parámetros y variables locales.
- **`StackOverflowError`**: el error que lanza la JVM cuando la pila se llena.

## Las dos partes de una función recursiva

```java
static long factorial(int n) {
  if (n <= 1) return 1;        // caso base
  return n * factorial(n - 1); // caso recursivo: n se acerca a 1
}

static int sumDigits(int n) {
  if (n < 10) return n;              // un solo dígito
  return n % 10 + sumDigits(n / 10); // último dígito + el resto
}

factorial(5);    // 120
sumDigits(4096); // 19
```

En `sumDigits(4096)`: `6 + sumDigits(409)` → `9 + sumDigits(40)` → `0 + sumDigits(4)` → `4` (caso base). Al volver se suma `4 + 0 + 9 + 6 = 19`.

## La pila de llamadas

Según la especificación de la JVM, cada hilo tiene su propia pila, y cada invocación de un método crea un **frame** nuevo que se destruye cuando ese método termina. En una recursión, todos los frames de las llamadas pendientes están en la pila al mismo tiempo: `factorial(5)` necesita cinco frames antes de empezar a multiplicar.

```text
Bajando (cada llamada espera a la siguiente):
  factorial(5) -> espera 5 * factorial(4)
  factorial(4) -> espera 4 * factorial(3)
  factorial(3) -> espera 3 * factorial(2)
  factorial(2) -> espera 2 * factorial(1)
  factorial(1) -> caso base: devuelve 1

Subiendo (cada frame se destruye al devolver):
  factorial(2) = 2 * 1   = 2
  factorial(3) = 3 * 2   = 6
  factorial(4) = 4 * 6   = 24
  factorial(5) = 5 * 24  = 120
```

La pila tiene un tamaño limitado. Si una computación necesita más pila de la permitida, la JVM lanza `StackOverflowError`. La documentación de esa clase lo explica como el error que ocurre cuando una aplicación entra en una recursión demasiado profunda.

Por eso una recursión infinita no se queda colgada como un `while (true)`: cada llamada agrega un frame, y en algún momento la pila se llena y el programa falla. El tamaño de la pila de cada hilo se puede ajustar con la opción `-Xss`, pero eso solo posterga el problema si la recursión no termina.

En una app real esto también puede pasar con una recursión **correcta** pero muy profunda, por ejemplo al recorrer una lista enlazada de cientos de miles de nodos. En esos casos se reemplaza la recursión por un bucle con una pila explícita (`ArrayDeque`), como en [el recorrido en profundidad de grafos](./graph-traversal.md).

## Todas las ramas deben llegar a un caso base

Tener un caso base no alcanza: **cada camino posible** de la recursión tiene que terminar en uno. Para comprobarlo, sigue el valor del argumento en cada llamada y pregúntate si siempre cae exactamente sobre un caso base.

```java
static boolean isEven(int n) {
  if (n == 0) return true;
  return isEven(n - 2);
}

isEven(4); // true: 4 -> 2 -> 0
isEven(3); // StackOverflowError: 3 -> 1 -> -1 -> -3 -> ... nunca llega a 0
```

El caso base `n == 0` solo lo alcanzan los números pares no negativos. Con un impar, el argumento "salta" por encima del caso base y sigue bajando para siempre. Lo mismo pasa con cualquier negativo, como `isEven(-2)`. La corrección es cubrir todos los valores donde puede terminar:

```java
static boolean isEven(int n) {
  if (n < 0) throw new IllegalArgumentException("n < 0"); // entrada fuera del dominio
  if (n == 0) return true;   // par
  if (n == 1) return false;  // impar: ahora los impares también tienen dónde terminar
  return isEven(n - 2);
}
```

Preguntas útiles para revisar una función recursiva:

1. ¿Cuánto cambia el argumento en cada llamada? Si baja de a 2, o si hay varias llamadas con distintos decrementos, ¿qué valores puede tomar?
2. ¿Qué pasa con las entradas más chicas posibles: 0, 1, negativos, una lista vacía?
3. ¿Hay valores que esquivan todos los casos base?

## Recursión con varias llamadas

Cuando una función se llama a sí misma más de una vez, cada llamada abre su propia rama. Las ramas no avanzan igual: una puede llegar a un caso base mientras otra sigue de largo. Por eso los casos base tienen que cubrir todos los valores donde puede terminar cualquiera de las ramas, no solo los de la más corta.

Fibonacci es el ejemplo clásico: `fib(n) = fib(n - 1) + fib(n - 2)`.

```text
fib(3)
├── fib(2)
│   ├── fib(1)   <- caso base
│   └── fib(0)   <- caso base
└── fib(1)       <- caso base
```

La rama `n - 2` baja de a dos, así que puede terminar en `0` o en `1`. Si solo existe el caso base `n == 0`, la llamada `fib(1)` genera `fib(-1)`, que nunca vuelve a `0`. Hacen falta los dos:

```java
static long fib(int n) {
  if (n <= 1) return n; // cubre fib(0) = 0 y fib(1) = 1
  return fib(n - 1) + fib(n - 2);
}
```

### El otro problema: repetir trabajo

Esta versión es correcta, pero lenta: en el árbol de arriba ya se ve `fib(1)` calculado dos veces. Con `n` grande la repetición explota: `fib(40)` hace más de 300 millones de llamadas. La solución es guardar cada resultado la primera vez que se calcula (**memoización**) o calcularlo con un bucle:

```java
static long fib(int n) {
  long previous = 0, current = 1;
  for (int i = 0; i < n; i++) {
    long next = previous + current;
    previous = current;
    current = next;
  }
  return previous; // fib(40) en 40 pasos
}
```

## En la entrevista

### ¿Qué es un caso base y qué pasa si falta?

Es la entrada que la función resuelve directamente, sin volver a llamarse, y es lo que hace que la recursión termine. Si falta, o si alguna rama nunca lo alcanza, la función se llama a sí misma sin fin hasta que la pila se llena y la JVM lanza `StackOverflowError`.

```java
static long factorial(int n) {
  return n * factorial(n - 1); // sin caso base: StackOverflowError
}
```

### ¿Por qué una recursión sin fin termina en `StackOverflowError` y no en un bucle infinito?

Porque cada llamada crea un frame nuevo en la pila de llamadas, con sus parámetros y variables, y ese frame no se libera hasta que la llamada termina. Una recursión sin fin nunca termina ninguna llamada, así que los frames se acumulan hasta superar el tamaño de la pila. Un bucle `while (true)`, en cambio, reutiliza el mismo frame y puede correr para siempre.

### ¿Cómo verificas que todas las ramas de una recursión terminan?

Siguiendo cómo cambia el argumento en cada llamada y comprobando que **todos** los valores posibles caen en un caso base. Hay que probar las entradas más chicas (0, 1, negativos, una lista vacía) y prestar atención cuando el argumento baja más de uno por vez o hay varias llamadas: `n - 2` puede terminar en `0` o en `1`, así que necesitas un caso base para cada uno.
