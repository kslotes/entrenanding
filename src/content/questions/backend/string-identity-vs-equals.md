---
title: ¿Qué imprimen estas comparaciones de String?
type: predict-output
category: backend
stack: [java]
seniority: [jr]
fundamentals: true
concepts: [java-reference-equality]
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

Imprime `false` y `true`: `==` compara **si son el mismo objeto**, y `new String(...)` siempre crea un objeto nuevo; `equals` compara el contenido, que es el mismo.

```java
String s1 = "hola";             // literal: instancia compartida del pool de strings
String s2 = new String("hola"); // objeto nuevo, con el mismo texto

s1 == s2;      // false: dos objetos distintos
s1.equals(s2); // true: mismos caracteres
```

**Por qué pasa:** los strings escritos entre comillas (literales) se guardan una sola vez en el _pool de strings_, y todos los `"hola"` del código apuntan a esa instancia (JLS 3.10.5). Pero `new` siempre crea un objeto nuevo (JLS 15.9.4), así que `s2` es otra referencia aunque el texto sea igual.

**La consecuencia práctica:** en una app casi ningún string viene de un literal: llega de una petición HTTP, de la base de datos o de un archivo, y es un objeto nuevo. Por eso `role == "ADMIN"` da `false` aunque el usuario sea admin. Usa `equals`, y pon el literal primero (`"ADMIN".equals(role)`) o usa `Objects.equals` para no fallar si el valor es `null`.

**Las respuestas tentadoras:**

- `true` y `true`: supone que `==` compara el texto; solo da `true` cuando ambas variables apuntan a la misma instancia del pool.
- `false` y `false`: `equals` en `String` compara caracteres, no referencias.
