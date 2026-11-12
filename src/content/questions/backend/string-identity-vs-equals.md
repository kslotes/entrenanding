---
title: ¿Qué imprimen estas comparaciones de String?
type: predict-output
category: backend
stack: [java]
seniority: [jr]
fundamentals: true
language: java
code: |
  String s1 = "hola";
  String s2 = new String("hola");
  System.out.println(s1 == s2);
  System.out.println(s1.equals(s2));
expectedOutput: |-
  false
  true
---

Imprime `false` y `true`.

- `==` compara referencias. `s1` apunta al literal del pool de strings; `new String(...)` crea siempre un objeto nuevo.
- `equals` compara el contenido, que es el mismo.

Para comparar strings se usa `equals` (o `Objects.equals` si alguno puede ser `null`).
