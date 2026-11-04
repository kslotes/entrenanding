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
---

## Qué es un value object

Un **value object** se identifica por su valor, no por su identidad. Dos instancias de la fecha `2026-11-04` representan la misma fecha, aunque sean dos objetos distintos en memoria.

La contraparte es la **entidad**: un `Customer` con `id` sigue siendo el mismo cliente aunque cambie su nombre, y dos clientes con el mismo nombre siguen siendo dos clientes distintos.

El JDK está lleno de value objects: `String`, `Integer`, `LocalDate`, `BigDecimal`, `UUID`.

## Por qué conviene que sean inmutables

- **Se pueden compartir sin miedo.** Nadie te cambia el valor por debajo, así que no hacen falta copias defensivas cada vez que lo pasás.
- **Son seguros entre hilos** sin sincronización: no hay estado que cambie.
- **Funcionan como clave de `HashMap` o elemento de `HashSet`.** Si el valor (y por lo tanto el `hashCode`) cambiara después de insertarlo, el elemento quedaría en un bucket incorrecto y no se volvería a encontrar.
- **Las operaciones devuelven instancias nuevas**, como `LocalDate.plusDays` o `String.concat`. El original no cambia.

## Cómo se escribe una clase inmutable en Java

La estrategia del tutorial oficial de Java:

1. No exponer setters ni métodos que modifiquen campos.
2. Declarar todos los campos `private final`.
3. Impedir la herencia: clase `final`, o constructor privado con un método de fábrica. Una subclase podría agregar estado mutable.
4. Si un campo apunta a un objeto mutable (`List`, array, `Date`), copiarlo al recibirlo y al devolverlo. Nunca guardar ni exponer la referencia original.

## Records

Desde Java 16 ([JEP 395](https://openjdk.org/jeps/395)), un `record` declara en una línea una clase `final` con campos `private final`, un constructor canónico, accesores y `equals`, `hashCode` y `toString` basados en sus componentes. Es la forma natural de escribir un value object.

Dos detalles importantes:

- **Un record es inmutable de forma superficial.** Si un componente es una `List` mutable, la lista se puede seguir modificando. Para evitarlo hay que copiarla (por ejemplo con `List.copyOf`).
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

## En la entrevista

- ¿Qué diferencia hay entre una entidad y un value object?
- ¿Cómo harías inmutable esta clase? Mencioná las copias defensivas: es lo que más se olvida.
- ¿Un record es inmutable? Sí, pero solo de forma superficial.
