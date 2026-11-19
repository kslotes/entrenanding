---
title: Contrato de equals y hashCode
stack: [java]
references:
  - title: "Object.equals (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)
  - title: "Object.hashCode (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode()
  - title: "Record (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Record.html
  - title: "JLS 8.10: Record Classes"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10
  - title: "JLS 8.4.8.1: Overriding (by Instance Methods)"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.1
  - title: "JLS 9.6.4.4: @Override"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.4
  - title: "Set (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Set.html
---

## El problema: el Set que no detecta duplicados

Imagina que importas un CSV de productos y quieres quitar los repetidos:

```java
class ProductCode {
  final String sku;

  ProductCode(String sku) {
    this.sku = sku;
  }
}

Set<ProductCode> unique = new HashSet<>();
unique.add(new ProductCode("A-100"));
unique.add(new ProductCode("A-100"));

System.out.println(unique.size()); // 2: el "duplicado" se quedó
```

Para Java, esos dos objetos **no son iguales**: por defecto, `equals` compara si son el mismo objeto en memoria (identidad), no si tienen el mismo contenido. Para que `HashSet`, `HashMap` y compañía entiendan qué significa "igual" en tu clase, tienes que definir **dos** métodos: `equals` y `hashCode`. Y tienen que ponerse de acuerdo entre sí.

## Primero, los términos

- **`equals`**: el método que responde "¿estos dos objetos representan lo mismo?". Por defecto (`Object.equals`) usa `==`, es decir, identidad. Para la diferencia entre `==` y `equals`, mira [identidad e igualdad de referencias](./java-reference-equality.md).
- **Hash** o **`hashCode`**: un número `int` calculado a partir del contenido del objeto. Funciona como una "etiqueta" para encontrarlo rápido.
- **Bucket**: cada casillero del arreglo interno de un `HashMap` o `HashSet`. El hash decide en qué casillero se guarda cada elemento. Lo explica en detalle [la página de tablas hash](./hash-tables.md).
- **Colisión**: dos objetos distintos con el mismo hash. Es normal y está permitido.
- **Sobrescribir** (_override_): redefinir en una subclase un método heredado, con **la misma firma** (mismo nombre y mismos tipos de parámetros). Las llamadas al método heredado pasan a usar tu versión.
- **Sobrecargar** (_overload_): declarar otro método con el mismo nombre pero **distintos parámetros**. Es un método nuevo; el heredado sigue existiendo igual que antes.
- **Inmutable**: un objeto cuyos campos no cambian después de crearlo.

## Cómo usa HashSet esos dos métodos

Para responder `contains(x)` (o `get(key)` en un `HashMap`), la colección hace dos pasos:

1. Calcula `x.hashCode()` y va **directo** al bucket que le corresponde. No mira los demás; por eso es rápido.
2. Dentro de ese bucket, compara con `equals` contra los elementos que hay ahí.

Si dos objetos "iguales" dan hashes distintos, el paso 1 los manda a buckets distintos y el paso 2 nunca llega a compararlos.

## El contrato de equals

La documentación de `Object.equals` exige que, para referencias no nulas, la relación sea:

| Propiedad   | Qué significa                                                                |
| ----------- | ---------------------------------------------------------------------------- |
| Reflexiva   | `x.equals(x)` es `true`.                                                     |
| Simétrica   | `x.equals(y)` es `true` si y solo si `y.equals(x)` es `true`.                |
| Transitiva  | Si `x.equals(y)` y `y.equals(z)`, entonces `x.equals(z)`.                    |
| Consistente | Llamarlo varias veces da el mismo resultado mientras los objetos no cambien. |
| Con `null`  | `x.equals(null)` es `false`.                                                 |

Las colecciones dan por hecho estas reglas. Si `equals` no es simétrico, por ejemplo, `a.equals(b)` y `b.equals(a)` dan respuestas distintas, y `contains` depende de qué objeto esté dentro del set y cuál le pases.

## El contrato de hashCode

- Llamado varias veces sobre el mismo objeto (sin cambios en los campos que usa `equals`), devuelve el mismo número.
- **Si `x.equals(y)`, entonces `x.hashCode() == y.hashCode()`.** Esta es la regla que importa, porque es la que hace funcionar el paso 1.
- Dos objetos distintos _pueden_ tener el mismo `hashCode`. No es un error; solo hace que haya más elementos que comparar en ese bucket.

## El error clásico: equals sin hashCode

```java
class Point {
  final int x;
  final int y;

  Point(int x, int y) {
    this.x = x;
    this.y = y;
  }

  @Override
  public boolean equals(Object o) {
    return o instanceof Point p && p.x == x && p.y == y;
  }
  // Falta hashCode: se usa el de Object, que depende de la identidad.
}

Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.contains(new Point(1, 2)); // false (casi siempre): cada objeto cae en otro bucket
```

`equals` dice que son iguales, pero el hash heredado de `Object` es distinto para cada instancia, así que el set busca en otro bucket. Las consecuencias en una app real: duplicados en un `HashSet` y `map.get(clave)` que devuelve `null` para una clave que está en el mapa (por ejemplo, una caché que nunca acierta).

La versión correcta usa **los mismos campos** en los dos métodos:

```java
@Override
public boolean equals(Object o) {
  return o instanceof Point p && p.x == x && p.y == y;
}

@Override
public int hashCode() {
  return Objects.hash(x, y); // mismos campos que equals
}
```

## El otro error clásico: sobrecargar en lugar de sobrescribir

```java
final class Point {
  // ...
  public boolean equals(Point other) { // parámetro Point, no Object: es un método NUEVO
    return other != null && x == other.x && y == other.y;
  }
}
```

`Object` declara `equals(Object)`. Un método con parámetro `Point` tiene otra firma, así que **sobrecarga**: no reemplaza al heredado (JLS 8.4.8.1). `HashSet` llama a `equals(Object)`, que sigue siendo el de `Object` y compara identidad.

```java
Point a = new Point(1, 2);
Point b = new Point(1, 2);
Object asObject = b;

a.equals(b);        // true: el compilador elige equals(Point) porque b es Point
a.equals(asObject); // false: con un Object se usa equals(Object), el heredado
```

La protección es la anotación `@Override`: si el método no sobrescribe nada, el código no compila (JLS 9.6.4.4). Con `@Override` sobre `equals(Point)`, el error aparece al compilar y no en producción.

## Claves mutables: el objeto que se pierde dentro del set

El hash se calcula **al guardar** el elemento. Si después cambias un campo que participa en `hashCode`, el objeto queda en el bucket viejo:

```java
class Tag {
  String name;
  Tag(String name) { this.name = name; }
  @Override public boolean equals(Object o) { return o instanceof Tag t && t.name.equals(name); }
  @Override public int hashCode() { return name.hashCode(); }
}

Set<Tag> tags = new HashSet<>();
Tag tag = new Tag("java");
tags.add(tag);      // se guarda en el bucket del hash de "java"

tag.name = "kotlin"; // ahora su hash es otro, pero sigue en el bucket viejo

tags.contains(tag); // false: busca en el bucket de "kotlin" y no está
tags.size();        // 1: sigue ahí, pero ya no lo puedes encontrar
```

La documentación de `Set` advierte que el comportamiento no está definido si un elemento cambia de forma que afecta a `equals` mientras está en el set. Por eso las claves de un `HashMap` y los elementos de un `HashSet` deberían ser **inmutables** (campos `final`).

## Records: equals y hashCode gratis

Un `record` genera `equals` y `hashCode` a partir de sus componentes, y además es inmutable:

```java
record Point(int x, int y) {}

Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.contains(new Point(1, 2)); // true
```

Según la documentación de `Record`, dos instancias son iguales si son del mismo tipo de record y cada componente es igual al correspondiente. Los componentes de tipo referencia se comparan como con `Objects.equals`, es decir, con el `equals` de cada componente.

Eso tiene una consecuencia: **el record hereda la semántica del `equals` de sus componentes**, incluidas sus sorpresas. Los arreglos, por ejemplo, no redefinen `equals` y comparan identidad:

```java
record Batch(int[] ids) {}

new Batch(new int[] {1, 2}).equals(new Batch(new int[] {1, 2})); // false: dos arreglos distintos
```

Si necesitas comparar el contenido, usa una `List<Integer>` como componente, que sí compara elemento por elemento.

## En la entrevista

### ¿Qué pasa si sobrescribes `equals` y no `hashCode`?

Rompes la regla "si `x.equals(y)`, sus hashes deben ser iguales". El `hashCode` heredado de `Object` depende de la identidad, así que dos objetos iguales caen en buckets distintos de un `HashSet` o `HashMap`. Resultado: `contains` da `false`, `get` devuelve `null` y aparecen duplicados en el set. Solución: implementar `hashCode` con los mismos campos que `equals` (`Objects.hash(x, y)`) o usar un `record`.

### Si dos objetos tienen el mismo `hashCode`, ¿son iguales?

No necesariamente. Eso es una colisión y el contrato la permite: la regla solo va en una dirección (iguales implica mismo hash). Por eso la colección, después de encontrar el bucket con el hash, confirma con `equals`.

```java
"Aa".hashCode() == "BB".hashCode(); // true: los dos dan 2112
"Aa".equals("BB");                  // false
```

### ¿Por qué las claves de un `HashMap` deberían ser inmutables?

Porque el bucket se elige con el hash calculado al insertar. Si la clave cambia un campo que usa `hashCode`, el mapa la sigue teniendo en el bucket viejo y `get` busca en el nuevo: la entrada queda "perdida", ocupando memoria y sin poder encontrarse. Con campos `final` (o un `record`) eso no puede pasar.
