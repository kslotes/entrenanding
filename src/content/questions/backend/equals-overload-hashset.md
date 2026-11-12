---
title: Después de agregar new Point(1, 2) a un HashSet, contains(new Point(1, 2)) devuelve false. Encuentra el error
type: spot-the-bug
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
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

`equals(Point other)` **sobrecarga** el método, no lo **sobrescribe**: el de `Object` es `equals(Object)`. `HashSet` llama a `equals(Object)`, que sigue siendo el heredado y compara referencias, así que dos puntos iguales nunca coinciden.

Solución: declarar `public boolean equals(Object o)`, verificar el tipo con `instanceof` y anotarlo con `@Override`. Con la anotación, el compilador rechaza la versión sobrecargada porque no sobrescribe nada.

Una alternativa es `record Point(int x, int y)`, que genera `equals` y `hashCode` correctos.
