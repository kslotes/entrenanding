---
title: Después de agregar new Point(1, 2) a un HashSet, contains(new Point(1, 2)) devuelve false. Encuentra el error
type: spot-the-bug
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: false
evidence:
  - type: interview-report
    url: https://leetcode.com/discuss/post/5345682/cars24-interview-experience-round-1-java-1g0a/
  - type: interview-report
    url: https://leetcode.com/discuss/post/7349349/my-nike-interview-experience-by-pravinya-zsvl/
concepts: [equals-hashcode-contract]
language: java
code: |
  final class Point {
      private final int x;
      private final int y;

      Point(int x, int y) {
          this.x = x;
          this.y = y;
      }

      public boolean equals(Point other) {
          return other != null && x == other.x && y == other.y;
      }

      @Override
      public int hashCode() {
          return Objects.hash(x, y);
      }
  }
bugLine: 10
---

El error está en `equals(Point other)`: **sobrecarga** el método en lugar de **sobrescribirlo**. `Object` declara `equals(Object)`, y `HashSet` llama a ese, que sigue siendo el heredado y compara si son el mismo objeto. Dos puntos con las mismas coordenadas nunca coinciden.

- **Sobrescribir** (_override_): redefinir un método heredado con la misma firma, mismo nombre y mismos tipos de parámetros. Las llamadas al heredado usan tu versión.
- **Sobrecargar** (_overload_): otro método con el mismo nombre pero distintos parámetros. Es un método nuevo y el heredado no cambia.

```java
Point a = new Point(1, 2);
Object b = new Point(1, 2); // así lo ve HashSet: como Object

a.equals(b); // false: se usa equals(Object) de Object, que compara identidad
```

**Por qué el `hashCode` correcto no alcanza:** `HashSet` usa `hashCode` para encontrar el casillero (bucket) y después `equals(Object)` para confirmar. Como `Objects.hash(x, y)` es correcto, los dos puntos caen en el mismo bucket, pero la confirmación falla.

**La solución:** recibir `Object`, verificar el tipo y anotar con `@Override`:

```java
@Override
public boolean equals(Object o) { // misma firma que Object.equals
  return o instanceof Point p && x == p.x && y == p.y;
}
```

Con `@Override`, la versión equivocada ni siquiera compila, porque no sobrescribe nada. Así el error aparece al compilar y no como un set con duplicados en producción. Otra alternativa es `record Point(int x, int y) {}`, que genera `equals` y `hashCode` correctos.
