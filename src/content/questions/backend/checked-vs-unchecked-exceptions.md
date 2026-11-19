---
title: ¿Cuál de estas excepciones es unchecked (no obliga a declararla ni a capturarla)?
type: multiple-choice
category: backend
stack: [java]
seniority: [jr]
fundamentals: true
concepts: [java-exceptions]
options:
  - id: a
    text: IOException
  - id: b
    text: SQLException
  - id: c
    text: IllegalArgumentException
  - id: d
    text: InterruptedException
answer: c
---

La respuesta es **`IllegalArgumentException`**: extiende `RuntimeException`, y todo lo que hereda de `RuntimeException` (o de `Error`) es **unchecked**, es decir, el compilador no exige `throws` ni `try/catch`.

```java
void setAge(int age) {
  if (age < 0) {
    throw new IllegalArgumentException("age < 0"); // compila sin throws ni try/catch
  }
}

String read(Path path) {
  return Files.readString(path); // no compila: IOException es checked
}                                // hay que capturarla o agregar "throws IOException"
```

**Por qué hay dos tipos:** una checked describe un fallo **esperable** que no depende de tu código (el archivo no existe, la base de datos no responde), y el compilador te obliga a decidir qué hacer. Una unchecked suele ser un **bug** (un argumento inválido, un `null`), que se corrige en el código en vez de capturarlo en cada llamada. La regla es solo por herencia: si en la cadena de superclases aparece `RuntimeException` o `Error`, es unchecked.

**La consecuencia práctica:** con una checked, cada método que la deja pasar debe declararla en `throws`. Por eso es común envolverla en una unchecked (`UncheckedIOException`) cuando no puedes recuperarte en ese punto.

**Las otras opciones (todas checked, extienden `Exception` sin pasar por `RuntimeException`):**

- `IOException`: errores de entrada/salida, como leer un archivo o un socket.
- `SQLException`: errores de la base de datos al usar JDBC.
- `InterruptedException`: otro hilo pidió interrumpir al actual mientras esperaba (`Thread.sleep`, `wait`, `join`).
