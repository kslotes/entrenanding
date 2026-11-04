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
---

## El contrato de equals

La documentación de `Object.equals` exige que, para referencias no nulas, la relación sea:

| Propiedad   | Qué significa                                                                |
| ----------- | ---------------------------------------------------------------------------- |
| Reflexiva   | `x.equals(x)` es `true`.                                                     |
| Simétrica   | `x.equals(y)` es `true` si y solo si `y.equals(x)` es `true`.                |
| Transitiva  | Si `x.equals(y)` y `y.equals(z)`, entonces `x.equals(z)`.                    |
| Consistente | Llamarlo varias veces da el mismo resultado mientras los objetos no cambien. |
| Con `null`  | `x.equals(null)` es `false`.                                                 |

Por defecto, `Object.equals` compara identidad (`==`): dos instancias distintas nunca son iguales.

## El contrato de hashCode

- Llamado varias veces sobre el mismo objeto (sin cambios en los campos que usa `equals`), devuelve el mismo número.
- **Si `x.equals(y)`, entonces `x.hashCode() == y.hashCode()`.** Esta es la regla que importa.
- Dos objetos distintos _pueden_ tener el mismo `hashCode` (una colisión). No es un error, solo empeora el rendimiento.

## Por qué importa: las colecciones hash

`HashMap` y `HashSet` usan `hashCode` para elegir el bucket y después `equals` para comparar dentro de ese bucket. Si sobrescribes `equals` pero no `hashCode`, dos objetos iguales caen (casi siempre) en buckets distintos:

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
  // Falta hashCode: se usa el de Object, basado en la identidad.
}

Set<Point> points = new HashSet<>();
points.add(new Point(1, 2));
points.contains(new Point(1, 2)); // false
```

Consecuencias típicas: duplicados en un `HashSet` y `map.get(clave)` que devuelve `null` para una clave que está en el mapa.

Dos reglas prácticas:

- `equals` y `hashCode` deben usar **los mismos campos**.
- Si un campo que participa en `hashCode` cambia mientras el objeto está dentro de un `HashSet`, el objeto queda en el bucket equivocado. Por eso las claves deberían ser inmutables.

## Records

Un `record` genera `equals` y `hashCode` a partir de sus componentes. Según la documentación de `Record`, dos instancias son iguales si son del mismo tipo de record y cada componente es igual al correspondiente. Los componentes de tipo referencia se comparan como con `Objects.equals`, es decir, con el `equals` de cada componente.

Eso tiene una consecuencia: **el record hereda la semántica del `equals` de sus componentes**, incluidas sus sorpresas.

## En la entrevista

- ¿Qué pasa si sobrescribes `equals` y no `hashCode`?
- Si dos objetos tienen el mismo `hashCode`, ¿son iguales? No necesariamente.
- ¿Por qué las claves de un `HashMap` deberían ser inmutables?
