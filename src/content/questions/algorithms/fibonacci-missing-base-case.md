---
title: Encuentra el error en este Fibonacci recursivo
type: spot-the-bug
category: algorithms
stack: [java]
seniority: [jr]
fundamentals: true
concepts: [recursion]
language: java
code: |
  static int fib(int n) {
      if (n == 0) return 0;
      return fib(n - 1) + fib(n - 2);
  }
bugLine: 2
---

El error está en `if (n == 0) return 0;`: **falta un caso base**. Un caso base es la entrada que la función resuelve sin volver a llamarse, y es lo que hace que la recursión termine. Aquí solo existe `n == 0`, pero la rama `fib(n - 2)` baja de a dos y puede pasar de largo.

```text
fib(2)
├── fib(1)
│   ├── fib(0)   -> 0, termina
│   └── fib(-1)  -> fib(-2), fib(-3)... nunca llega a 0
└── fib(0)       -> 0, termina
```

`fib(-1)` llama a `fib(-2)` y `fib(-3)`, que siguen bajando para siempre. Cualquier `n >= 1` termina pasando por `fib(1)`, así que solo `fib(0)` funciona.

**Por qué el error es `StackOverflowError` y no un programa colgado:** cada llamada ocupa un espacio (un _frame_) en la pila de llamadas hasta que termina. Como estas llamadas nunca terminan, los frames se acumulan hasta llenar la pila, y la JVM corta con `StackOverflowError`.

**La solución:** cubrir los dos valores donde puede terminar una rama, `0` y `1`:

```java
static int fib(int n) {
  if (n <= 1) return n; // fib(0) = 0 y fib(1) = 1
  return fib(n - 1) + fib(n - 2);
}
```

La regla general: cuando el argumento baja más de uno por vez o hay varias llamadas, revisa **todos** los valores en los que puede terminar cada rama, no solo los de la más corta.

Un detalle extra: esta versión ya es correcta, pero repite cálculos (`fib(40)` hace más de 300 millones de llamadas). Para valores grandes se usa un bucle o se guardan los resultados ya calculados.
