---
title: Excepciones en Java
stack: [java]
references:
  - title: "JLS 11.1.1: The Kinds of Exceptions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.1.1
  - title: "JLS 11.2: Compile-Time Checking of Exceptions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2
  - title: "JLS 14.20.2: Execution of try-finally and try-catch-finally"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2
  - title: "JLS 14.20.3: try-with-resources"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3
  - title: "RuntimeException (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html
---

## La jerarquía

Toda excepción es una instancia de `Throwable` o de una subclase. Según la JLS (11.1.1):

| Rama               | Para qué se usa                                                                   |
| ------------------ | --------------------------------------------------------------------------------- |
| `Exception`        | Errores de los que un programa normal podría querer recuperarse.                  |
| `RuntimeException` | Subclase de `Exception`: errores durante la evaluación de expresiones.            |
| `Error`            | Problemas de los que normalmente no se espera recuperarse (`StackOverflowError`). |

## Checked y unchecked

La regla de la JLS es por herencia, no por el nombre de la clase:

- **Unchecked**: `RuntimeException`, `Error` y todas sus subclases.
- **Checked**: todo el resto de `Throwable`.

Para saber de qué tipo es una excepción, mira su cadena de superclases en el Javadoc:

```text
ArithmeticException    -> RuntimeException -> Exception -> Throwable              (unchecked)
TimeoutException       -> Exception -> Throwable                                  (checked)
ClassNotFoundException -> ReflectiveOperationException -> Exception -> Throwable  (checked)
```

Con una checked exception, el compilador exige que el método la capture o la declare en `throws`. Si no, el código no compila:

```java
class InsufficientFundsException extends Exception {
  InsufficientFundsException(String message) {
    super(message);
  }
}

static void withdraw(long balance, long amount) {
  if (amount > balance) {
    throw new InsufficientFundsException("Saldo insuficiente");
  }
}
// error: unreported exception InsufficientFundsException;
//        must be caught or declared to be thrown
```

Las unchecked quedan fuera de ese control. La JLS lo justifica así: el compilador no tiene información suficiente para demostrar que no ocurrirán, y obligar a declararlas no ayudaría a que el programa sea más correcto.

## try, catch y finally

El bloque `finally` se ejecuta siempre que el control sale del `try`: si termina normal, si se lanza una excepción (capturada o no) y también con `return`, `break` o `continue`.

```java
try {
  throw new UnsupportedOperationException("sin catch");
} finally {
  System.out.println("finally también corre");
}
// Imprime el mensaje y después la excepción sigue subiendo.
```

La JLS (14.20.2) define una regla clave: si el `finally` termina de forma abrupta (con su propio `return` o lanzando otra excepción), ese motivo **reemplaza** al del `try` o el `catch`. Una excepción en curso se descarta sin aviso, por eso no se escribe `return` ni `throw` dentro de `finally`.

## try-with-resources

Para recursos que implementan `AutoCloseable`, `try-with-resources` cierra cada uno automáticamente. Se abren de izquierda a derecha y se cierran en orden inverso:

```java
// Resource implementa AutoCloseable e imprime al abrir y al cerrar.
try (var db = new Resource("db"); var file = new Resource("file")) {
  System.out.println("trabajando");
}
// abre db, abre file, trabajando, cierra file, cierra db
```

Si el cuerpo lanza una excepción y `close()` también lanza otra, la del cuerpo es la principal y la de `close()` se agrega como _suppressed_ (`getSuppressed()`), en lugar de perderse.

## En la entrevista

- ¿Cómo sabes si una excepción es checked o unchecked?
- ¿Cuándo se ejecuta `finally` y qué pasa si tiene su propio `return`?
- ¿Qué ventaja tiene `try-with-resources` frente a cerrar en un `finally`?
