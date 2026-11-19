---
title: Objetos de valor e inmutabilidad
stack: [java]
references:
  - title: "Martin Fowler: Value Object"
    url: https://martinfowler.com/bliki/ValueObject.html
  - title: "The Java Tutorials: A Strategy for Defining Immutable Objects"
    url: https://docs.oracle.com/javase/tutorial/essential/concurrency/imstrat.html
  - title: "JEP 395: Records"
    url: https://openjdk.org/jeps/395
  - title: "List.copyOf (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)
---

## El problema: el objeto que cambió "solo"

Una tienda tiene una clase para el período de una promoción:

```java
class Promotion {
  private final Date start;

  Promotion(Date start) {
    this.start = start; // guarda la referencia que le pasaron
  }

  Date start() {
    return start;
  }
}

Date date = new Date();
Promotion blackFriday = new Promotion(date);
date.setTime(0); // otra parte del código reutiliza su variable...

blackFriday.start().getTime(); // 0, es decir, 1970: la promoción cambió sin que nadie la tocara
```

El campo es `final`, pero eso solo impide cambiar **a qué objeto** apunta, no el contenido del objeto. Quien creó la promoción conserva la misma `Date` y la modificó. Bugs así son muy difíciles de rastrear: el objeto cambia en un lugar del código que no tiene nada que ver con él.

Los **value objects inmutables** eliminan esta clase de problemas: representan un valor (una fecha, un monto, un email) y nunca cambian después de crearse.

## Primero, los términos

- **Value object** (objeto de valor): un objeto que se identifica por su **valor**, como un monto o una fecha. Dos instancias con el mismo valor son intercambiables.
- **Entidad**: un objeto que se identifica por su **identidad** (normalmente un id), aunque cambien sus datos. Un cliente sigue siendo el mismo cliente aunque cambie de nombre.
- **Inmutable**: un objeto cuyo estado no puede cambiar después de construirlo.
- **Referencia**: lo que guarda una variable de tipo objeto: no el objeto, sino "dónde está". Dos variables pueden apuntar al mismo objeto.
- **Copia defensiva**: guardar o devolver una copia de un objeto mutable en lugar de la referencia original, para que nadie de afuera pueda cambiarlo.
- **Seguro entre hilos** (_thread-safe_): que varios hilos lo pueden usar a la vez sin corromper datos.

## Qué es un value object

Un **value object** se identifica por su valor, no por su identidad. Dos instancias de la fecha `2026-11-04` representan la misma fecha, aunque sean dos objetos distintos en memoria.

La contraparte es la **entidad**: un `Customer` con `id` sigue siendo el mismo cliente aunque cambie su nombre, y dos clientes con el mismo nombre siguen siendo dos clientes distintos.

```java
record Email(String value) {}                       // value object: lo define su contenido
class Customer { Long id; String name; Email email; } // entidad: la define su id
```

El JDK está lleno de value objects: `String`, `Integer`, `LocalDate`, `BigDecimal`, `UUID`.

### Para qué sirven en una app real

Además de evitar cambios inesperados, un value object le da un **nombre y reglas** a un dato que si no sería un `String` o un `double` suelto:

```java
// Sin value objects: nada impide pasar los parámetros en otro orden o un email inválido
void register(String name, String email, String phone) { /* ... */ }

// Con value objects: el email se valida una sola vez, al crearlo
record Email(String value) {
  Email {
    if (value == null || !value.contains("@")) {
      throw new IllegalArgumentException("email inválido: " + value);
    }
    value = value.trim().toLowerCase(); // normaliza: " Ana@Mail.com " y "ana@mail.com" son iguales
  }
}

void register(String name, Email email, Phone phone) { /* ... */ }
```

Si un método recibe un `Email`, ya sabes que es válido: no hace falta volver a validarlo en cada capa. Un `Money` con monto y moneda evita sumar pesos con dólares; lo explica [la página de BigDecimal y dinero](./bigdecimal-money.md).

## Por qué conviene que sean inmutables

- **Se pueden compartir sin miedo.** Nadie te cambia el valor por debajo, así que no hacen falta copias defensivas cada vez que lo pasas.
- **Son seguros entre hilos** sin sincronización: no hay estado que cambie.
- **Funcionan como clave de `HashMap` o elemento de `HashSet`.** Si el valor (y por lo tanto el `hashCode`) cambiara después de insertarlo, el elemento quedaría en un bucket incorrecto y no se volvería a encontrar. Lo explica [el contrato de equals y hashCode](./equals-hashcode-contract.md).
- **Las operaciones devuelven instancias nuevas**, como `LocalDate.plusDays` o `String.concat`. El original no cambia.

```java
LocalDate start = LocalDate.of(2026, 11, 27);
LocalDate end = start.plusDays(3); // un objeto nuevo

start; // 2026-11-27: no cambió
end;   // 2026-11-30
```

Por eso el problema del principio no existe con `LocalDate`: no tiene ningún `setTime`.

## Cómo se escribe una clase inmutable en Java

La estrategia del tutorial oficial de Java:

1. No exponer setters ni métodos que modifiquen campos.
2. Declarar todos los campos `private final`.
3. Impedir la herencia: clase `final`, o constructor privado con un método de fábrica. Una subclase podría agregar estado mutable.
4. Si un campo apunta a un objeto mutable (`List`, array, `Date`), copiarlo al recibirlo y al devolverlo. Nunca guardar ni exponer la referencia original.

El paso 4 es el que se olvida, y es justo el bug del principio. La versión corregida:

```java
final class Promotion {                 // 3. nadie puede heredar
  private final Date start;             // 2. private final

  Promotion(Date start) {
    this.start = new Date(start.getTime()); // 4. copia al recibir
  }

  Date start() {
    return new Date(start.getTime());   // 4. copia al devolver
  }
}
```

Aunque, en código nuevo, la mejor solución es no usar `Date`: `Instant` o `LocalDate` ya son inmutables y no necesitan copias.

## Records

Desde Java 16 ([JEP 395](https://openjdk.org/jeps/395)), un `record` declara en una línea una clase `final` con campos `private final`, un constructor canónico, accesores y `equals`, `hashCode` y `toString` basados en sus componentes. Es la forma natural de escribir un value object.

```java
record Point(int x, int y) {}

new Point(1, 2).equals(new Point(1, 2)); // true: se comparan por valor
```

Dos detalles importantes:

- **Un record es inmutable de forma superficial.** Si un componente es una `List` mutable, la lista se puede seguir modificando. Para evitarlo hay que copiarla, por ejemplo con `List.copyOf`, que devuelve una lista que no se puede modificar.
- **El constructor compacto** permite validar o normalizar los parámetros antes de asignarlos a los campos:

```java
record Range(int from, int to) {
  Range {
    if (from > to) {
      throw new IllegalArgumentException("from > to");
    }
  }
}
```

Las dos cosas juntas:

```java
record Order(String id, List<String> items) {
  Order {
    items = List.copyOf(items); // copia que no se puede modificar
  }
}

List<String> items = new ArrayList<>(List.of("book"));
Order order = new Order("A-1", items);
items.add("pen");            // no afecta a order
order.items().add("cup");    // UnsupportedOperationException
```

## En la entrevista

### ¿Qué diferencia hay entre una entidad y un value object?

Una entidad se identifica por su identidad, normalmente un id: un cliente sigue siendo el mismo aunque cambie de nombre, y dos clientes con el mismo nombre son distintos. Un value object se identifica por su valor: dos `Money(10, USD)` son el mismo monto e intercambiables. Las entidades suelen cambiar con el tiempo; los value objects conviene que sean inmutables y se reemplazan por otros nuevos.

### ¿Cómo harías inmutable esta clase?

Cuatro pasos: sin setters; campos `private final`; clase `final` para que ninguna subclase agregue estado mutable; y **copias defensivas** de los campos mutables (`List`, arrays, `Date`), tanto al recibirlos en el constructor como al devolverlos en los getters. Las copias defensivas son lo que más se olvida: con `final` solo, quien te pasó la lista la puede seguir modificando.

```java
this.items = List.copyOf(items); // al recibir: copia que nadie puede modificar
```

### ¿Un record es inmutable?

Sí, pero solo de forma **superficial**: sus campos son `final` y no tiene setters, pero si un componente es mutable, como un `ArrayList` o un array, su contenido se puede modificar. Para que sea inmutable de verdad, se copia ese componente en el constructor compacto con `List.copyOf` (o se clona el array).
