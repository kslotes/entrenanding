---
title: Identidad e igualdad de referencias en Java
stack: [java]
references:
  - title: "JLS 15.21: Equality Operators"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.21
  - title: "JLS 5.1.7: Boxing Conversion"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.7
  - title: "JLS 3.10.5: String Literals"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5
  - title: "JLS 15.9.4: Run-Time Evaluation of Class Instance Creation Expressions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9.4
  - title: "Integer.valueOf (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html#valueOf(int)
  - title: "String.intern (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#intern()
---

## == compara identidad, equals compara valor

Según la JLS (15.21.3), cuando los dos operandos de `==` son referencias, el resultado es `true` solo si apuntan **al mismo objeto** (o ambos son `null`). No mira el contenido.

Para comparar contenido se usa `equals`, que cada clase define (`String` e `Integer` lo hacen por valor). Si alguno puede ser `null`, `Objects.equals(a, b)` evita el `NullPointerException`. Para las reglas de cómo escribir tu propio `equals`, mira [el contrato de equals y hashCode](./equals-hashcode-contract.md).

Todo objeto creado con `new` es una instancia nueva (JLS 15.9.4), así que nunca es `==` a otro objeto que ya existía.

## Wrappers y autoboxing

Al asignar un primitivo a un wrapper (`Integer`, `Long`, `Character`...), el compilador hace boxing. La JLS (5.1.7) garantiza que, para ciertos valores, dos boxings del mismo valor devuelven el **mismo objeto**:

- `true` y `false`.
- `char` de `'\u0000'` a `'\u007f'`.
- Enteros (`byte`, `short`, `int`, `long`) de **-128 a 127**.

Para cualquier otro valor, la JLS dice explícitamente que no puedes suponer nada sobre la identidad. `Integer.valueOf` documenta lo mismo: siempre cachea ese rango y _puede_ cachear otros valores.

```java
Long small1 = 42L, small2 = 42L;
System.out.println(small1 == small2); // true: garantizado por la JLS

Integer x = Integer.valueOf(5000), y = Integer.valueOf(5000);
System.out.println(x.equals(y)); // true: compara el valor
```

Dos detalles más:

- Si un lado de `==` es primitivo, se hace **unboxing** y se comparan números (JLS 15.21.1): `Integer boxed = 5000; boxed == 5000` es `true`.
- Hacer unboxing de un wrapper `null` lanza `NullPointerException`.

Los constructores de `Integer` están marcados con `@Deprecated(since="9", forRemoval=true)`; el Javadoc recomienda `valueOf`.

## Strings: literales, constantes y el pool

La JLS (3.10.5) garantiza que un literal de string siempre se refiere a la misma instancia de `String`. Los literales y, en general, los strings que son **expresiones constantes** se internan: comparten una única instancia, como si se llamara a `String.intern()`.

```java
String suffix = "lo";
String a = "Hello";
String b = "Hel" + "lo";   // constante: se calcula al compilar
String c = "Hel" + suffix; // se calcula en tiempo de ejecución

System.out.println(a == b);          // true
System.out.println(a == c);          // false
System.out.println(a == c.intern()); // true
System.out.println(a.equals(c));     // true
```

Los strings concatenados en tiempo de ejecución son objetos nuevos y, por lo tanto, distintos. `intern()` devuelve la instancia canónica del pool con el mismo contenido.

Que `==` "funcione" con algunos strings es un efecto del pool, no una forma válida de compararlos.

## En la entrevista

- ¿Qué compara `==` entre dos objetos y qué compara `equals`?
- ¿Qué valores garantiza la JLS que se reutilizan al hacer autoboxing?
- ¿Por qué dos strings con el mismo contenido pueden no ser `==`?
