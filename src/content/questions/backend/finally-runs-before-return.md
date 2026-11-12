---
title: ¿Qué imprime este programa?
type: predict-output
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
language: java
code: |
  static int value() {
      try {
          return 1;
      } finally {
          System.out.println("finally");
      }
  }

  public static void main(String[] args) {
      System.out.println(value());
  }
expectedOutput: |-
  finally
  1
---

Imprime `finally` y después `1`.

`return 1` calcula el valor a devolver, pero antes de salir del método se ejecuta el bloque `finally`. Recién entonces `value()` devuelve `1` y `main` lo imprime.

Si `finally` tuviera su propio `return`, reemplazaría al del `try` (y descartaría cualquier excepción en curso). Por eso no se escribe `return` dentro de `finally`.
