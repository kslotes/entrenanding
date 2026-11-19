---
title: ¿Qué estructura de datos usa un recorrido en anchura (BFS) para decidir qué nodo visitar a continuación?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr, ssr]
fundamentals: true
concepts: [graph-traversal]
options:
  - id: a
    text: Una pila (LIFO)
  - id: b
    text: Una cola (FIFO)
  - id: c
    text: Un heap de mínimos
  - id: d
    text: Una tabla hash
answer: b
---

La respuesta es una **cola (FIFO)**, que significa _first in, first out_: sale primero el que entró primero, como la fila de un banco. Así los nodos se visitan en el orden en que se descubren, y todo un nivel se procesa antes de pasar al siguiente.

```java
Deque<String> pending = new ArrayDeque<>();
Set<String> seen = new HashSet<>(Set.of("A"));
pending.offer("A");
while (!pending.isEmpty()) {
  String node = pending.poll(); // sale el más antiguo
  for (String next : graph.get(node)) {
    if (seen.add(next)) pending.offer(next); // entra al final de la fila
  }
}
// A -> B, C;  B -> D;  C -> E
// Orden de visita: A, B, C, D, E  (nivel 0, nivel 1, nivel 2)
```

**Por qué importa:** como los nodos a 1 arista salen antes que los que están a 2, la primera vez que BFS llega a un nodo lo hace por el camino con **menos aristas**. Por eso BFS sirve para preguntas como "¿a cuántos saltos está?": amigos de amigos en una red social, la ruta con menos transbordos o el camino más corto en un laberinto.

**La consecuencia práctica:** en Java la cola se hace con `ArrayDeque` (`offer` para agregar al final, `poll` para sacar del principio). Usar un `ArrayList` con `remove(0)` también funciona, pero cada `remove(0)` corre todos los elementos y el recorrido se vuelve lento.

**Las otras opciones:**

- Una **pila (LIFO)**: sale primero el último que entró. Con ella el recorrido sigue un camino hasta el fondo antes de volver: es un recorrido en profundidad (DFS), que no encuentra el camino más corto.
- Un **heap de mínimos**: saca el elemento con menor valor. Es lo que usa Dijkstra (con `PriorityQueue`) cuando las aristas tienen pesos distintos.
- Una **tabla hash**: suele acompañar a BFS para registrar los nodos ya vistos y no entrar en ciclos, pero no tiene orden, así que no puede decidir cuál visitar después.
