---
title: ¿Cuál es la complejidad de list.add(0, x) en un ArrayList de n elementos?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [jr, ssr]
fundamentals: true
concepts: [dynamic-arrays]
options:
  - id: a
    text: O(1)
  - id: b
    text: O(1) amortizado
  - id: c
    text: O(log n)
  - id: d
    text: O(n)
answer: d
---

La respuesta es **O(n)**: `ArrayList` guarda los elementos en un arreglo, uno al lado del otro y sin huecos, así que insertar en la posición 0 obliga a **correr una posición todos** los elementos existentes.

```text
add(0, "x") sobre [a][b][c][d]:
  correr d, correr c, correr b, correr a  -> 4 movimientos (n = 4)
  escribir x en la posición 0
resultado: [x][a][b][c][d]
```

Con 4 elementos son 4 movimientos; con un millón, un millón. El costo crece igual que `n`.

**Por qué funciona así:** lo que hace rápido a un arreglo es que la posición `i` se calcula directamente ("inicio + `i`"), y por eso `get(i)` es `O(1)`. Ese cálculo solo funciona si no hay huecos, así que insertar o quitar en el medio obliga a mover todo lo que está después. La documentación de `ArrayList` lo resume: `get` y `set` son constantes, `add` al final es `O(1)` amortizado y el resto de las operaciones es lineal.

**La consecuencia práctica:** insertar al principio dentro de un bucle es `O(n²)`:

```java
for (Event e : events) {
  timeline.add(0, e); // mal: con 100 000 eventos, miles de millones de movimientos
}
```

Agrega al final y da vuelta la lista una vez (`Collections.reverse`), o usa `ArrayDeque`, que tiene un arreglo circular y agrega o quita en los extremos en tiempo constante amortizado.

**Las otras opciones:**

- `O(1)`: es el costo de `get(i)` o `set(i, x)`, que no mueven nada.
- `O(1) amortizado`: es el costo de `add(x)` al **final**; solo de vez en cuando hay que copiar el arreglo a uno más grande.
- `O(log n)`: es el costo de una búsqueda binaria o de un árbol; nada en `add(0, x)` divide el problema a la mitad.
