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
  - title: "Objects.equals (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html#equals(java.lang.Object,java.lang.Object)
---

## El problema: un bug que solo aparece en producción

Imagina un endpoint que solo deja editar un pedido a su dueño:

```java
public void updateOrder(Long orderId, Long currentUserId) {
  Order order = repository.findById(orderId).orElseThrow();

  if (order.getUserId() != currentUserId) { // compara objetos, no números
    throw new ForbiddenException();
  }
  // ...
}
```

En los tests, con usuarios de id `1`, `2` o `3`, funciona perfecto. En producción, el usuario `5000` intenta editar **su propio** pedido y recibe `403 Forbidden`. El código no cambió; cambiaron los números.

La causa es que `!=` (y `==`) entre dos `Long` no compara los números que contienen, sino si son **el mismo objeto en memoria**. Para valores pequeños Java reutiliza los objetos y el bug queda escondido. Esta página explica por qué pasa y cómo compararlo bien.

## Primero, los términos

- **Primitivo**: un valor simple que no es un objeto: `int`, `long`, `char`, `boolean`, `double`... La variable guarda el valor directamente.
- **Objeto**: una instancia de una clase (`String`, `Integer`, `Order`...). Vive en una zona de memoria llamada _heap_.
- **Referencia**: lo que guarda una variable de tipo objeto. No es el objeto, sino la "dirección" que indica dónde está. Dos variables pueden apuntar al mismo objeto o a dos objetos distintos con el mismo contenido.
- **Wrapper**: la clase que envuelve a cada primitivo para poder usarlo como objeto: `Integer` para `int`, `Long` para `long`, `Character` para `char`, etc. Hacen falta, por ejemplo, porque las colecciones (`List<Integer>`, `Map<String, Long>`) solo guardan objetos.
- **Autoboxing**: el compilador convierte solo un primitivo en su wrapper. `Integer x = 5;` se compila como `Integer x = Integer.valueOf(5);`.
- **Unboxing**: lo contrario, sacar el primitivo del wrapper. `int n = x;` se compila como `int n = x.intValue();`.

## == compara identidad, equals compara valor

Con primitivos, `==` compara los valores, como esperas: `5000 == 5000` es `true`.

Con objetos, `==` compara **referencias**. Según la JLS (15.21.3), el resultado es `true` solo si las dos variables apuntan **al mismo objeto** (o ambas son `null`). No mira el contenido. A eso se le llama comparar **identidad**.

```java
StringBuilder a = new StringBuilder("hola");
StringBuilder b = new StringBuilder("hola");
StringBuilder c = a;

System.out.println(a == b); // false: dos objetos distintos, aunque el contenido sea igual
System.out.println(a == c); // true: c apunta al mismo objeto que a
```

Para comparar contenido se usa `equals`, que cada clase define. `String`, `Integer`, `Long` y el resto de wrappers lo implementan comparando el valor. A eso se le llama comparar **igualdad**.

Si alguno de los dos puede ser `null`, `a.equals(b)` lanza `NullPointerException` cuando `a` es `null`. `Objects.equals(a, b)` lo resuelve: devuelve `true` si ambos son `null`, `false` si solo uno lo es, y si no llama a `a.equals(b)`.

```java
Long fromDb = null;
Long fromRequest = 5000L;

fromDb.equals(fromRequest);         // NullPointerException
Objects.equals(fromDb, fromRequest); // false, sin excepción
```

Para escribir el `equals` de tus propias clases, mira [el contrato de equals y hashCode](./equals-hashcode-contract.md).

Todo objeto creado con `new` es una instancia nueva (JLS 15.9.4), así que nunca es `==` a otro objeto que ya existía.

## Wrappers y autoboxing: por qué 127 funciona y 128 no

Crear un objeto nuevo cada vez que haces boxing de un `5` o un `true` sería un desperdicio: son los valores más usados. Por eso Java guarda una **caché** de objetos ya creados y los reutiliza. La JLS (5.1.7) garantiza que, para estos valores, dos boxings del mismo valor devuelven **el mismo objeto**:

- `true` y `false`.
- `char` de `'\u0000'` a `'\u007f'` (los caracteres ASCII).
- Enteros (`byte`, `short`, `int`, `long`) de **-128 a 127**.

Para cualquier otro valor, la JLS dice explícitamente que no puedes suponer nada sobre la identidad. `Integer.valueOf` documenta lo mismo: siempre cachea ese rango y _puede_ cachear otros valores. En la JVM por defecto, fuera del rango se crea un objeto nuevo en cada boxing.

```java
Integer a = 127, b = 127; // los dos salen de la caché: mismo objeto
Integer c = 128, d = 128; // fuera del rango: dos objetos distintos

System.out.println(a == b);      // true
System.out.println(c == d);      // false con la configuración por defecto
System.out.println(c.equals(d)); // true: compara el valor
```

Por eso el bug del principio solo aparece con ids grandes: los ids `1`, `2` y `3` vienen de la caché y `==` "funciona" por casualidad.

La forma correcta del ejemplo inicial:

```java
if (!Objects.equals(order.getUserId(), currentUserId)) { // compara los números
  throw new ForbiddenException();
}
```

Otra opción es trabajar con primitivos (`long`) cuando el valor nunca puede ser `null`; entonces `==` compara números.

### Mezclar wrapper y primitivo

Si **un solo lado** de `==` es primitivo, Java hace unboxing del otro y compara números (JLS 15.21.1):

```java
Integer boxed = 5000;
System.out.println(boxed == 5000); // true: se compara int con int
```

El riesgo es el unboxing de `null`, que lanza `NullPointerException`. Pasa mucho al leer de un `Map`:

```java
Map<String, Integer> stock = Map.of("apple", 10);

int bananas = stock.get("banana"); // get devuelve null -> unboxing de null -> NullPointerException
int safe = stock.getOrDefault("banana", 0); // 0
```

Los constructores de `Integer` (`new Integer(5)`) están marcados con `@Deprecated(since="9", forRemoval=true)`; el Javadoc recomienda `valueOf`, que es lo que usa el autoboxing.

## Strings: literales, constantes y el pool

Los strings tienen un mecanismo parecido a la caché de enteros, llamado **pool de strings**: un conjunto de instancias únicas de `String` que la JVM comparte.

- Un **literal** es un string escrito entre comillas en el código: `"Hello"`.
- Una **expresión constante** es una que el compilador puede calcular sin ejecutar el programa, como `"Hel" + "lo"`.

La JLS (3.10.5) garantiza que los literales y los strings que son expresiones constantes se **internan**: todos los que tienen el mismo contenido apuntan a una única instancia del pool, como si se llamara a `String.intern()`. Cualquier string que se arma **al ejecutar** (concatenando variables, leyendo un archivo, recibiendo un parámetro HTTP, con `new String(...)`) es un objeto nuevo.

```java
String suffix = "lo";
String a = "Hello";
String b = "Hel" + "lo";   // constante: se calcula al compilar -> mismo objeto del pool
String c = "Hel" + suffix; // usa una variable: se calcula al ejecutar -> objeto nuevo

System.out.println(a == b);          // true
System.out.println(a == c);          // false
System.out.println(a == c.intern()); // true: intern devuelve la instancia del pool
System.out.println(a.equals(c));     // true
```

Dónde muerde en una app real: casi ningún string que compares viene de un literal. Viene de una petición, de la base de datos o de un archivo, y por lo tanto es un objeto nuevo.

```java
@GetMapping("/admin")
public String admin(@RequestParam String role) {
  if (role == "ADMIN") { // siempre false: role se creó al leer la petición
    return "ok";
  }
  if ("ADMIN".equals(role)) { // correcto, y no falla si role es null
    return "ok";
  }
  return "forbidden";
}
```

Que `==` "funcione" con algunos strings es un efecto del pool, no una forma válida de compararlos.

## En la entrevista

### ¿Qué compara `==` entre dos objetos y qué compara `equals`?

`==` compara **identidad**: es `true` solo si las dos referencias apuntan al mismo objeto en memoria. `equals` compara **igualdad de valor** según la define cada clase; `String` y los wrappers comparan el contenido. Para objetos, casi siempre quieres `equals`, o `Objects.equals(a, b)` si alguno puede ser `null`.

```java
String a = new String("x");
String b = new String("x");
a == b;      // false: dos objetos
a.equals(b); // true: mismo contenido
```

### ¿Qué valores garantiza la JLS que se reutilizan al hacer autoboxing?

`true` y `false`, los `char` de `'\u0000'` a `'\u007f'`, y los enteros (`byte`, `short`, `int`, `long`) de **-128 a 127**. Para esos valores, dos boxings dan el mismo objeto y `==` devuelve `true`. Fuera del rango no hay garantía, así que `Integer c = 128, d = 128; c == d` suele ser `false`. El punto que buscan: no compares wrappers con `==`, porque el código pasa los tests con números pequeños y falla con números grandes.

### ¿Por qué dos strings con el mismo contenido pueden no ser `==`?

Porque `==` compara referencias, y solo los literales y las expresiones constantes comparten una instancia del pool de strings. Un string creado al ejecutar (con `new String`, concatenando variables o leído de una petición) es un objeto nuevo:

```java
String literal = "hola";
String fromInput = new String("hola");
literal == fromInput;      // false
literal.equals(fromInput); // true
```

Para comparar strings se usa `equals`; si uno es un literal conocido, ponerlo primero (`"ADMIN".equals(role)`) evita el `NullPointerException`.
