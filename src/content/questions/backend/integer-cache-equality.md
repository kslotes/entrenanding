---
title: Con la configuración por defecto de la JVM, ¿qué imprime este código?
type: predict-output
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [java-reference-equality]
language: java
code: |
  Integer a = 127, b = 127;
  Integer c = 128, d = 128;
  System.out.println(a == b);
  System.out.println(c == d);
expectedOutput: |-
  true
  false
---

Imprime `true` y `false`: `==` entre dos `Integer` compara **si son el mismo objeto**, no si tienen el mismo número, y Java solo garantiza reutilizar los objetos de -128 a 127.

```java
Integer a = 127, b = 127; // autoboxing: Integer.valueOf(127) -> objeto de la caché
Integer c = 128, d = 128; // fuera de la caché: dos objetos nuevos

a == b;      // true: las dos variables apuntan al mismo objeto
c == d;      // false: dos objetos distintos con el mismo valor
c.equals(d); // true: compara el número
```

**Por qué pasa:** escribir `Integer a = 127` hace _autoboxing_: el compilador lo convierte en `Integer.valueOf(127)`, que envuelve el `int` en un objeto. Para no crear miles de objetos con los números más usados, la especificación (JLS 5.1.7) obliga a reutilizar los de -128 a 127. Fuera de ese rango no hay garantía; con la configuración por defecto, cada boxing crea un objeto nuevo.

**La consecuencia práctica:** comparar ids `Long` o `Integer` con `==` pasa los tests (ids `1`, `2`, `3`) y falla en producción cuando los ids superan 127. Compara con `a.equals(b)`, con `Objects.equals(a, b)` si alguno puede ser `null`, o usa primitivos (`int`, `long`).

**Las respuestas tentadoras:**

- `true` y `true`: supone que `==` compara valores, cosa que solo hace con primitivos.
- `false` y `false`: ignora la caché que la JLS garantiza para -128 a 127.
