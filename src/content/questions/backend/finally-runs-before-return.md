---
title: ¿Qué imprime este programa?
type: predict-output
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [java-exceptions]
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

Imprime `finally` y después `1`: `return 1` calcula el valor, pero antes de salir del método se ejecuta el `finally`; recién entonces `value()` devuelve `1` y `main` lo imprime.

```java
static int value() {
  try {
    return 1; // 1) calcula el valor a devolver: 1
  } finally {
    System.out.println("finally"); // 2) corre antes de salir del método
  }
}             // 3) value() devuelve 1 y main imprime "1"
```

**Por qué funciona así:** la JLS (14.20.2) garantiza que `finally` corre siempre que el control sale del `try`, también con `return`. Esa garantía es lo que lo hace útil para limpiar: liberar un lock o cerrar un recurso aunque el método termine antes de tiempo o lance una excepción.

**La trampa:** si `finally` tuviera su propio `return`, reemplazaría al del `try` y descartaría cualquier excepción en curso sin aviso:

```java
try {
  return Integer.parseInt("abc"); // lanza NumberFormatException
} finally {
  return 0; // mal: la excepción desaparece y se devuelve 0
}
```

Por eso no se escribe `return` ni `throw` dentro de `finally`.

**Las respuestas tentadoras:**

- `1` y después `finally`: supone que `return` sale del método al instante; en realidad `finally` corre antes de que `main` reciba el valor.
- Solo `1`: supone que `return` se salta el `finally`, pero `finally` corre siempre que se sale del `try`.
