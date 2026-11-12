---
title: Con la configuración por defecto de la JVM, ¿qué imprime este código?
type: predict-output
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
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

Imprime `true` y `false`.

`==` entre dos `Integer` compara **referencias**, no valores. El autoboxing usa `Integer.valueOf`, que siempre reutiliza las instancias de -128 a 127: la especificación del lenguaje (JLS 5.1.7) garantiza que esos valores dan el mismo objeto. Fuera de ese rango no hay garantía; con la configuración por defecto se crean objetos distintos.

Que `128 == 128` dé `false` depende de la configuración de la JVM, que puede cachear más valores. La única comparación correcta de valores es `a.equals(b)`, o comparar los `int` sin boxing.
