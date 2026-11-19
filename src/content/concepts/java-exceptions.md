---
title: Excepciones en Java
stack: [java]
references:
  - title: "JLS 11.1.1: The Kinds of Exceptions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.1.1
  - title: "JLS 11.2: Compile-Time Checking of Exceptions"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2
  - title: "JLS 14.17: The return Statement"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.17
  - title: "JLS 14.20.2: Execution of try-finally and try-catch-finally"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2
  - title: "JLS 14.20.3: try-with-resources"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3
  - title: "RuntimeException (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/RuntimeException.html
  - title: "UncheckedIOException (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/UncheckedIOException.html
---

## El problema: errores que nadie revisa

Antes de las excepciones, la forma habitual de avisar un error era devolver un código especial:

```java
int saveInvoice(Invoice invoice) {
  if (!disk.hasSpace()) {
    return -1; // "algo falló"
  }
  // ...
  return 0;
}

saveInvoice(invoice); // nadie mira el -1: la factura no se guardó y el programa sigue como si nada
```

Nada obliga a quien llama a revisar el `-1`, y el valor de retorno queda ocupado por el error. Las excepciones resuelven las dos cosas: el error **interrumpe** el flujo normal y viaja hacia arriba hasta que alguien lo maneja; si nadie lo hace, el hilo termina con un mensaje que dice qué falló y dónde.

## Primero, los términos

- **Excepción**: un objeto que describe un error (`new IllegalArgumentException("monto negativo")`).
- **Lanzar** (`throw`): cortar la ejecución del método actual y entregar esa excepción.
- **Capturar** (`catch`): manejar la excepción en un bloque `try/catch`.
- **Propagar**: no capturarla. La excepción sale del método y pasa al que lo llamó, y así sucesivamente.
- **Pila de llamadas** (_call stack_): la lista de métodos que se están ejecutando, uno llamando al otro. La excepción la recorre hacia arriba. El _stack trace_ que ves en los logs es esa lista impresa.
- **Recurso**: algo que hay que cerrar al terminar de usarlo: un archivo, una conexión a la base de datos, un socket.

## La jerarquía

Toda excepción es una instancia de `Throwable` o de una subclase. Según la JLS (11.1.1):

| Rama               | Para qué se usa                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `Exception`        | Errores de los que un programa normal podría querer recuperarse (un archivo que no existe).         |
| `RuntimeException` | Subclase de `Exception`: errores al evaluar expresiones, casi siempre bugs (`null`, índices).       |
| `Error`            | Problemas de la JVM de los que no se espera recuperarse (`StackOverflowError`, `OutOfMemoryError`). |

## Checked y unchecked

"Checked" significa **revisada por el compilador**. La regla de la JLS es por herencia, no por el nombre de la clase:

- **Unchecked**: `RuntimeException`, `Error` y todas sus subclases.
- **Checked**: todo el resto de `Throwable`.

Para saber de qué tipo es una excepción, mira su cadena de superclases en el Javadoc. Si aparece `RuntimeException` o `Error`, es unchecked:

```text
IllegalArgumentException -> RuntimeException -> Exception -> Throwable              (unchecked)
ArithmeticException      -> RuntimeException -> Exception -> Throwable              (unchecked)
IOException              -> Exception -> Throwable                                  (checked)
ClassNotFoundException   -> ReflectiveOperationException -> Exception -> Throwable  (checked)
```

### Qué exige el compilador con una checked

El método que la lanza debe **declararla** en `throws`, y quien lo llama debe **capturarla** o declararla también. Si no, el código no compila (JLS 11.2):

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

La versión que compila:

```java
static void withdraw(long balance, long amount) throws InsufficientFundsException { // la declara
  if (amount > balance) {
    throw new InsufficientFundsException("Saldo insuficiente");
  }
}

try {
  withdraw(100, 500);
} catch (InsufficientFundsException e) { // quien llama la captura
  System.out.println("No se pudo retirar: " + e.getMessage());
}
```

### Por qué existen las dos clases

- **Checked** = fallos **esperables** que no dependen de tu código: el archivo no existe, la red se cae, la base de datos no responde. El compilador te obliga a pensar qué hacer. Ejemplos reales: `Files.readString` declara `IOException`; JDBC declara `SQLException`.
- **Unchecked** = casi siempre **bugs**: acceder a un `null`, dividir por cero, pasar un argumento inválido. La JLS lo justifica así: el compilador no puede demostrar que no ocurrirán, y obligar a declararlas en cada método no haría el programa más correcto. Lo que se hace es corregir el código.

### Dónde aparece en una app real

En código moderno es común **envolver** una checked en una unchecked cuando no puedes recuperarte en ese punto, para no llenar todas las capas de `throws`:

```java
String loadTemplate(Path path) {
  try {
    return Files.readString(path);
  } catch (IOException e) {
    throw new UncheckedIOException("No se pudo leer " + path, e); // e queda como causa en el stack trace
  }
}
```

La diferencia también importa en Spring: por defecto, `@Transactional` hace rollback con excepciones unchecked y hace **commit** con checked. Lo explica [la página de proxies transaccionales](./spring-transactional-proxies.md).

## try, catch y finally

El bloque `finally` se ejecuta siempre que el control sale del `try`: si termina normal, si se lanza una excepción (capturada o no) y también con `return`, `break` o `continue`. Sirve para **limpiar**: liberar un lock, cerrar algo, registrar que la operación terminó.

```java
lock.lock();
try {
  updateBalance();
} finally {
  lock.unlock(); // se libera aunque updateBalance lance una excepción
}
```

### finally y return: el orden exacto

`return` primero **calcula** el valor y después intenta salir del método (JLS 14.17). Como hay un `finally`, ese bloque corre antes de salir:

```java
static int value() {
  int x = 1;
  try {
    return x; // 1) calcula el valor: 1
  } finally {
    x = 99;   // 2) corre finally; no cambia el valor ya calculado
    System.out.println("finally");
  }
}             // 3) el método devuelve 1
```

Paso a paso: se calcula `1`, se imprime `finally`, el método devuelve `1`.

### La regla peligrosa: finally puede pisar el resultado

La JLS (14.20.2) dice que si el `finally` termina de forma abrupta (con su propio `return` o lanzando otra excepción), ese motivo **reemplaza** al del `try` o el `catch`:

```java
static int parse(String s) {
  try {
    return Integer.parseInt(s); // con "abc" lanza NumberFormatException
  } finally {
    return 0; // mal: descarta la excepción sin aviso y devuelve 0
  }
}
```

El que llama recibe `0` y nunca se entera de que hubo un error. Por eso no se escribe `return` ni `throw` dentro de `finally`.

La única forma habitual de que `finally` no corra es que la JVM termine antes, por ejemplo con `System.exit()`.

## try-with-resources

Cerrar recursos a mano en un `finally` es largo y tiene trampas:

```java
BufferedReader reader = null;
try {
  reader = Files.newBufferedReader(path);
  return reader.readLine();
} finally {
  if (reader != null) {
    reader.close(); // si close() lanza, reemplaza a la excepción del try y se pierde el error real
  }
}
```

Con `try-with-resources`, cualquier objeto que implemente `AutoCloseable` (archivos, conexiones JDBC, streams) se cierra solo:

```java
try (BufferedReader reader = Files.newBufferedReader(path)) {
  return reader.readLine();
} // reader.close() se llama siempre, haya error o no
```

Con varios recursos, se abren de izquierda a derecha y se cierran en orden inverso:

```java
// Resource implementa AutoCloseable e imprime al abrir y al cerrar.
try (var db = new Resource("db"); var file = new Resource("file")) {
  System.out.println("trabajando");
}
// abre db, abre file, trabajando, cierra file, cierra db
```

Si el cuerpo lanza una excepción y `close()` también lanza otra, la del cuerpo es la principal y la de `close()` se agrega como **suprimida** (`getSuppressed()`) en lugar de perderse (JLS 14.20.3).

## En la entrevista

### ¿Cómo sabes si una excepción es checked o unchecked?

Por su herencia: si extiende `RuntimeException` o `Error` (directa o indirectamente) es unchecked; cualquier otra subclase de `Throwable` es checked. El nombre no importa. Con una checked, el compilador obliga a capturarla o declararla en `throws`; con una unchecked, no.

```java
void a() { throw new IllegalStateException(); } // compila: unchecked
void b() { throw new IOException(); }           // no compila: falta throws IOException
```

### ¿Cuándo se ejecuta `finally` y qué pasa si tiene su propio `return`?

Se ejecuta siempre que el control sale del `try`: al terminar normal, al lanzarse una excepción y también con `return`, `break` o `continue`. Con `return` en el `try`, el valor se calcula primero y `finally` corre antes de devolverlo. Si `finally` tiene su propio `return` (o lanza), ese resultado reemplaza al del `try` y descarta cualquier excepción en curso, por eso no se hace. Solo no corre si la JVM termina antes, por ejemplo con `System.exit()`.

### ¿Qué ventaja tiene `try-with-resources` frente a cerrar en un `finally`?

Tres: el recurso se cierra siempre sin escribir el `finally` ni el chequeo de `null`; con varios recursos los cierra en orden inverso a la apertura; y si `close()` falla mientras ya había una excepción, no pisa la original, sino que la agrega como suprimida. Con el `finally` manual, una excepción en `close()` reemplaza al error real.
