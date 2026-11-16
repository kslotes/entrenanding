---
title: Arreglos dinámicos y ArrayList
stack: [java]
references:
  - title: "ArrayList (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html
  - title: "OpenJDK 21: ArrayList.java"
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/ArrayList.java
  - title: "ArrayDeque (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html
  - title: "OpenJDK 21: ArrayDeque.java"
    url: https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/ArrayDeque.java
---

## Qué es un arreglo dinámico

Un arreglo de Java tiene tamaño fijo. Un **arreglo dinámico** como `ArrayList` lo envuelve y agrega dos números:

- **size**: cuántos elementos hay.
- **capacidad**: el largo del arreglo interno. Según la documentación, siempre es al menos tan grande como el tamaño de la lista.

Cuando el arreglo interno se llena, se crea uno más grande y se copian todos los elementos. En el código de OpenJDK 21, el crecimiento preferido es la mitad de la capacidad actual (`oldCapacity >> 1`), o sea, la capacidad pasa a ser aproximadamente 1.5 veces la anterior. La documentación de `ArrayList` no lo garantiza: solo promete que agregar un elemento tiene costo constante amortizado.

## Costo amortizado

Copiar todo el arreglo es O(n), pero ocurre pocas veces porque la capacidad crece de forma proporcional. Si se cuentan las copias al agregar `n` elementos a un arreglo que duplica su capacidad:

```java
int capacity = 1, size = 0;
long copies = 0;
for (int i = 0; i < n; i++) {
  if (size == capacity) {
    copies += size;
    capacity *= 2;
  }
  size++;
}
// n = 1_000     -> 1023 copias
// n = 1_000_000 -> 1048575 copias
```

Las copias totales quedan en el orden de `n`, así que el costo **promedio por inserción** es constante, aunque una inserción concreta pueda ser cara. Eso significa "O(1) amortizado".

Si sabes cuántos elementos vas a agregar, `new ArrayList<>(capacidad)` o `ensureCapacity` evitan las copias intermedias.

## Acceso por índice vs. insertar en el medio

Como los elementos están contiguos, leer o escribir la posición `i` es directo. Insertar o quitar en una posición intermedia es otra cosa: los elementos siguientes tienen que moverse para no dejar huecos.

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
list.add(2, "x"); // [a, b, x, c, d]: "c" y "d" se corren a la derecha
list.remove(0);   // [b, x, c, d]: todos los demás se corren a la izquierda
```

Cuantos más elementos quedan después de la posición, más hay que mover. La documentación lo resume así:

| Operación                                        | Costo según la documentación |
| ------------------------------------------------ | ---------------------------- |
| `size`, `isEmpty`, `get`, `set`, `iterator`      | Constante                    |
| `add(e)` (al final)                              | Constante amortizado         |
| El resto (`add(i, e)`, `remove(i)`, `contains`…) | Lineal, aproximadamente      |

## Cuando necesitas los dos extremos

Si una estructura recibe y entrega elementos por el principio y por el final, `ArrayDeque` usa un arreglo circular (así lo describe su código fuente): agregar adelante solo mueve el índice de inicio, sin correr los demás elementos. Según su documentación, la mayoría de sus operaciones son de tiempo constante amortizado.

```java
Deque<String> dq = new ArrayDeque<>(List.of("b", "c"));
dq.addFirst("a");
dq.addLast("d");
// [a, b, c, d]
```

## En la entrevista

- ¿Qué significa que `add` sea O(1) amortizado?
- ¿Por qué el acceso por índice es constante y una inserción en el medio no?
- ¿Cuándo elegirías `ArrayDeque` en lugar de `ArrayList`?
