---
title: Encuentra el error en este Fibonacci recursivo
type: spot-the-bug
category: algorithms
stack: [java]
seniority: [jr]
fundamentals: true
language: java
code: |
  static int fib(int n) {
      if (n == 0) return 0;
      return fib(n - 1) + fib(n - 2);
  }
bugLine: 2
---

Falta un caso base. Con `n == 1`, la función llama a `fib(0)`, que termina, y a `fib(-1)`, que nunca llega a `0`: sigue bajando hasta lanzar `StackOverflowError`. Cualquier `n >= 1` termina pasando por `fib(1)`, así que solo `fib(0)` funciona.

Solución: cubrir los dos casos base, por ejemplo `if (n <= 1) return n;`.

Toda recursión necesita casos base que alcancen **todas** las ramas posibles, no solo una.
