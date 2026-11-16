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

## Qué es una función recursiva

Una función es **recursiva** cuando se llama a sí misma para resolver una versión más chica del mismo problema. Siempre tiene dos partes:

- **Caso base**: una entrada que se resuelve directamente, sin volver a llamar a la función.
- **Caso recursivo**: reduce el problema y se llama a sí misma con esa entrada más chica.

```java
static long factorial(int n) {
  if (n <= 1) return 1;        // caso base
  return n * factorial(n - 1); // caso recursivo: n se acerca a 1
}

static int sumDigits(int n) {
  if (n < 10) return n;                // un solo dígito
  return n % 10 + sumDigits(n / 10);   // último dígito + el resto
}

factorial(5);    // 120
sumDigits(4096); // 19
```

## La pila de llamadas

Según la especificación de la JVM, cada hilo tiene su propia pila, y cada invocación de un método crea un **frame** nuevo que se destruye cuando ese método termina. En una recursión, todos los frames de las llamadas pendientes están en la pila al mismo tiempo: `factorial(5)` necesita cinco frames antes de empezar a multiplicar.

La pila tiene un tamaño limitado. Si una computación necesita más pila de la permitida, la JVM lanza `StackOverflowError`. La documentación de esa clase lo explica como el error que ocurre cuando una aplicación entra en una recursión demasiado profunda. El tamaño de la pila de cada hilo se puede ajustar con la opción `-Xss`, pero eso solo posterga el problema si la recursión no termina.

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

El caso base `n == 0` solo lo alcanzan los números pares no negativos. Con un impar, el argumento "salta" por encima del caso base y sigue bajando para siempre. Lo mismo pasa con cualquier negativo, como `isEven(-2)`.

Preguntas útiles para revisar una función recursiva:

1. ¿Cuánto cambia el argumento en cada llamada? Si baja de a 2, o si hay varias llamadas con distintos decrementos, ¿qué valores puede tomar?
2. ¿Qué pasa con las entradas más chicas posibles: 0, 1, negativos, una lista vacía?
3. ¿Hay valores que esquivan todos los casos base?

## Recursión con varias llamadas

Cuando una función se llama a sí misma más de una vez, cada llamada abre su propia rama. Las ramas no avanzan igual: una puede llegar a un caso base mientras otra sigue de largo. Por eso los casos base tienen que cubrir todos los valores donde puede terminar cualquiera de las ramas, no solo los de la más corta.

## En la entrevista

- ¿Qué es un caso base y qué pasa si falta?
- ¿Por qué una recursión sin fin termina en `StackOverflowError` y no en un bucle infinito?
- ¿Cómo verificas que todas las ramas de una recursión terminan?
