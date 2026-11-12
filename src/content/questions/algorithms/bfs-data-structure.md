---
title: ¿Qué estructura de datos usa un recorrido en anchura (BFS) para decidir qué nodo visitar a continuación?
type: multiple-choice
category: algorithms
stack: []
seniority: [jr, ssr]
fundamentals: true
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

Una **cola (FIFO)**. Los nodos se visitan en el orden en que se descubren, así que se procesa todo un nivel antes de pasar al siguiente. Por eso BFS encuentra el camino más corto, en cantidad de aristas, en un grafo sin pesos.

- Con una **pila** el recorrido pasa a ser en profundidad (DFS).
- Un **heap de mínimos** es lo que usa Dijkstra, cuando las aristas tienen pesos.
- La **tabla hash** suele acompañar a BFS para registrar los nodos visitados, pero no decide el orden.
