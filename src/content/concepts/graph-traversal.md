---
title: Recorridos de grafos (BFS y DFS)
stack: []
references:
  - title: "MIT 6.006 (Spring 2020), Lecture 9: Breadth-First Search"
    url: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-9-breadth-first-search/
  - title: "MIT 6.006 (Spring 2020), Lecture 13: Dijkstra"
    url: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-13-dijkstra/
  - title: "Deque (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html
  - title: "ArrayDeque (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html
---

## Qué es recorrer un grafo

Un grafo tiene **nodos** y **aristas** que los conectan. Recorrerlo es visitar todos los nodos alcanzables desde uno de origen, cada uno una sola vez. Todo recorrido necesita dos cosas:

- Un registro de **nodos ya vistos**, para no entrar en ciclos ni repetir trabajo (suele ser un `HashSet` o un arreglo de booleanos).
- Una colección de **nodos pendientes**, que decide cuál se visita a continuación.

El tipo de esa colección de pendientes es lo que diferencia un recorrido de otro.

## Colas y pilas

| Estructura | Orden                          | En Java (`Deque`) |
| ---------- | ------------------------------ | ----------------- |
| Cola       | FIFO: sale el más antiguo      | `offer` / `poll`  |
| Pila       | LIFO: sale el último en entrar | `push` / `pop`    |

La documentación de `Deque` describe los dos usos y recomienda usarla en lugar de la clase `Stack`. `ArrayDeque` es la implementación habitual.

## Recorrido en anchura (BFS)

BFS visita primero todos los nodos a distancia 1 del origen, después los de distancia 2, y así sucesivamente. En la clase de MIT 6.006 se presenta justamente así: construir uno por uno los "conjuntos de nivel", los nodos que están a distancia `k` del origen. Como resultado, BFS calcula la menor cantidad de aristas desde el origen hasta cada nodo:

```java
static Map<String, Integer> distances(Map<String, List<String>> graph, String source) {
  Map<String, Integer> dist = new HashMap<>(); // también sirve como "ya vistos"
  Deque<String> pending = new ArrayDeque<>();
  dist.put(source, 0);
  pending.offer(source);
  while (!pending.isEmpty()) {
    String node = pending.poll();
    for (String next : graph.get(node)) {
      if (!dist.containsKey(next)) {
        dist.put(next, dist.get(node) + 1);
        pending.offer(next);
      }
    }
  }
  return dist;
}

// A -> B, C;  B -> D;  C -> D, E;  D -> F;  E -> F
// {A=0, B=1, C=1, D=2, E=2, F=3}
```

Cada nodo entra una vez y cada arista se revisa una vez, así que el costo es O(|V| + |E|), como se demuestra en esa misma clase.

## Recorrido en profundidad (DFS)

DFS avanza por un camino hasta donde puede y recién entonces retrocede. Se implementa con recursión o con una pila explícita:

```java
static List<String> dfs(Map<String, List<String>> graph, String source) {
  List<String> visited = new ArrayList<>();
  Set<String> seen = new HashSet<>();
  Deque<String> stack = new ArrayDeque<>();
  stack.push(source);
  while (!stack.isEmpty()) {
    String node = stack.pop();
    if (!seen.add(node)) continue;
    visited.add(node);
    List<String> next = graph.get(node);
    for (int i = next.size() - 1; i >= 0; i--) stack.push(next.get(i));
  }
  return visited;
}

// Mismo grafo: [A, B, D, F, C, E]
```

El orden cambia por completo: DFS no visita por niveles, así que no sirve para calcular la menor cantidad de aristas.

## Grafos con pesos

BFS cuenta aristas. Si cada arista tiene un costo distinto, el camino con menos aristas puede no ser el más barato. Para pesos no negativos se usa Dijkstra, que la clase 13 de MIT 6.006 presenta como una generalización de BFS para grafos con pesos y que se apoya en una cola de prioridad.

## En la entrevista

- ¿Qué estructuras necesita un recorrido de grafo y para qué sirve cada una?
- ¿Por qué BFS encuentra el camino con menos aristas?
- ¿Qué cambia en un grafo con pesos?
