---
title: Con la lista [1, 2, 3, 4], este método lanza ConcurrentModificationException. Encuentra el error
type: spot-the-bug
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: false
concepts: [modifying-collections-while-iterating]
evidence:
  - type: interview-report
    url: https://leetcode.com/discuss/post/301975/booking-android-developer-amsterdam-by-a-lkd3/
  - type: interview-report
    url: https://leetcode.com/discuss/post/6596203/optum-sde-1-java-full-stack-hyderabad-ma-8bab/
language: java
code: |
  static void removeEven(List<Integer> numbers) {
      for (Integer n : numbers) {
          if (n % 2 == 0) {
              numbers.remove(n);
          }
      }
  }
bugLine: 4
---

El error está en `numbers.remove(n)`: quita un elemento de la lista **mientras el for-each la recorre**, sin pasar por el iterador que usa el bucle. En la siguiente vuelta el iterador detecta el cambio y lanza `ConcurrentModificationException`.

```java
// Lo que el compilador genera a partir del for-each:
for (Iterator<Integer> it = numbers.iterator(); it.hasNext(); ) {
  Integer n = it.next();             // 2) aquí detecta el cambio y lanza la excepción
  if (n % 2 == 0) numbers.remove(n); // 1) cambia la lista por fuera del iterador
}
```

**Por qué pasa:** un **iterador** es el objeto que recorre la lista y recuerda por dónde va. El de `ArrayList` es _fail-fast_: la lista cuenta sus modificaciones, el iterador anota ese número al empezar y lo compara en cada `next()`. Si no coincide, prefiere fallar enseguida antes que seguir con posiciones que ya no corresponden. Con `[1, 2, 3, 4]`: se quita el `2`, quedan elementos por recorrer, el siguiente `next()` compara y lanza.

**Peor aún, la detección no está garantizada.** Con `[1, 2, 3]`, quitar el `2` deja la lista con tamaño 2 justo cuando el iterador va por la posición 2: `hasNext()` responde que no hay más y el bucle termina sin revisar el `3` y sin lanzar nada. La documentación dice que fail-fast solo sirve para detectar bugs, no para depender de él.

**La solución:**

```java
numbers.removeIf(n -> n % 2 == 0); // la lista quita los elementos de forma segura

// o, con un iterador explícito:
for (Iterator<Integer> it = numbers.iterator(); it.hasNext(); ) {
  if (it.next() % 2 == 0) it.remove(); // quita a través del iterador, que ajusta su posición
}
```

Un detalle: `numbers.remove(n)` con `n` de tipo `Integer` llama a `remove(Object)` y quita por valor. Con un `int`, llamaría a `remove(int index)` y quitaría por posición.
