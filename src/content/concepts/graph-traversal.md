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
  - title: "Files.walk (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#walk(java.nio.file.Path,java.nio.file.FileVisitOption...)
---

## El problema: "¿a cuántos saltos está?"

Una red social quiere sugerir amigos: personas que conoces a través de un amigo, pero que todavía no son tus amigos. Para eso necesita saber **a cuántos saltos** de ti está cada persona:

```text
tú -> ana, tom        (a 1 salto: ya son tus amigos)
ana -> eva            (a 2 saltos: sugerencia)
tom -> eva, tim       (a 2 saltos: sugerencia)
eva -> tú             (un ciclo: vuelve al principio)
```

Con un `for` simple no alcanza: no sabes cuántos niveles hay, y si no tienes cuidado, el ciclo `eva -> tú` te hace dar vueltas para siempre. Este tipo de datos es un **grafo**, y la forma de responder la pregunta es **recorrerlo** de una manera ordenada. Es el mismo problema que el de las rutas con menos transbordos, las dependencias entre módulos de un proyecto o las carpetas de un disco.

## Primero, los términos

- **Grafo**: un conjunto de **nodos** (las personas) unidos por **aristas** (las amistades).
- **Dirigido**: las aristas tienen sentido. `ana -> eva` no implica `eva -> ana`. Un mapa de calles con sentido único es un grafo dirigido.
- **Vecinos** de un nodo: los nodos a los que llega con una arista.
- **Lista de adyacencia**: la forma habitual de guardar un grafo en código: un mapa de cada nodo a la lista de sus vecinos (`Map<String, List<String>>`).
- **Ciclo**: un camino que vuelve a un nodo por el que ya pasó.
- **Distancia** (en aristas): la menor cantidad de aristas para llegar de un nodo a otro.
- **Cola** (FIFO, _first in, first out_): sale primero el que entró primero, como la fila de un banco.
- **Pila** (LIFO, _last in, first out_): sale primero el último que entró, como una pila de platos.

## Qué necesita todo recorrido

Recorrer es visitar todos los nodos alcanzables desde uno de origen, cada uno una sola vez. Todo recorrido necesita dos cosas:

- Un registro de **nodos ya vistos**, para no entrar en ciclos ni repetir trabajo (suele ser un `HashSet` o un arreglo de booleanos).
- Una colección de **nodos pendientes**, que decide cuál se visita a continuación.

Sin el registro de vistos, el ciclo del ejemplo nunca termina:

```java
// mal: sin "ya vistos"
pending.offer("tú");
while (!pending.isEmpty()) {
  String node = pending.poll();
  for (String next : graph.get(node)) pending.offer(next); // tú -> ana -> eva -> tú -> ... para siempre
}
```

El tipo de la colección de pendientes es lo que diferencia un recorrido de otro.

## Colas y pilas

| Estructura | Orden                          | En Java (`Deque`) |
| ---------- | ------------------------------ | ----------------- |
| Cola       | FIFO: sale el más antiguo      | `offer` / `poll`  |
| Pila       | LIFO: sale el último en entrar | `push` / `pop`    |

La documentación de `Deque` describe los dos usos y recomienda usarla en lugar de la clase `Stack`. `ArrayDeque` es la implementación habitual.

Los ejemplos de abajo usan este grafo:

```java
Map<String, List<String>> graph = Map.of(
    "A", List.of("B", "C"),
    "B", List.of("D"),
    "C", List.of("D", "E"),
    "D", List.of("F"),
    "E", List.of("F"),
    "F", List.of()); // F no tiene vecinos, pero tiene que estar en el mapa
```

```text
      A
     / \
    B   C
     \ / \
      D   E
       \ /
        F
```

## Recorrido en anchura (BFS)

BFS (_breadth-first search_) visita primero todos los nodos a distancia 1 del origen, después los de distancia 2, y así sucesivamente, como las ondas que se forman al tirar una piedra al agua. En la clase de MIT 6.006 se presenta justamente así: construir uno por uno los "conjuntos de nivel", los nodos que están a distancia `k` del origen.

Lo que lo hace posible es la **cola**: los nodos salen en el mismo orden en que se descubrieron, así que todos los de un nivel salen antes que cualquiera del siguiente. Como resultado, BFS calcula la menor cantidad de aristas desde el origen hasta cada nodo:

```java
static Map<String, Integer> distances(Map<String, List<String>> graph, String source) {
  Map<String, Integer> dist = new HashMap<>(); // también sirve como "ya vistos"
  Deque<String> pending = new ArrayDeque<>();
  dist.put(source, 0);
  pending.offer(source);
  while (!pending.isEmpty()) {
    String node = pending.poll(); // sale el más antiguo: el nivel actual termina antes que el siguiente
    for (String next : graph.get(node)) {
      if (!dist.containsKey(next)) { // se marca al descubrirlo, para no encolarlo dos veces
        dist.put(next, dist.get(node) + 1);
        pending.offer(next);
      }
    }
  }
  return dist;
}

distances(graph, "A"); // {A=0, B=1, C=1, D=2, E=2, F=3}
```

Paso a paso:

| Sale de la cola | Descubre             | Cola después |
| --------------- | -------------------- | ------------ |
| `A` (0)         | `B`=1, `C`=1         | `B, C`       |
| `B` (1)         | `D`=2                | `C, D`       |
| `C` (1)         | `E`=2 (`D` ya visto) | `D, E`       |
| `D` (2)         | `F`=3                | `E, F`       |
| `E` (2)         | nada (`F` ya visto)  | `F`          |
| `F` (3)         | nada                 | vacía        |

Cada nodo entra una vez a la cola y cada arista se revisa una vez, así que el costo es `O(|V| + |E|)` (nodos más aristas), como se demuestra en esa misma clase.

Dónde se usa: sugerencias de "amigos de amigos", la ruta con menos transbordos, el camino más corto en un laberinto o una grilla, o un crawler que primero visita las páginas enlazadas desde la portada.

## Recorrido en profundidad (DFS)

DFS (_depth-first search_) avanza por un camino hasta donde puede y solo entonces retrocede para probar otro, como quien recorre un laberinto con la mano apoyada en la pared. Se implementa con recursión o con una **pila** explícita: el último nodo descubierto es el próximo en visitarse.

```java
static List<String> dfs(Map<String, List<String>> graph, String source) {
  List<String> visited = new ArrayList<>();
  Set<String> seen = new HashSet<>();
  Deque<String> stack = new ArrayDeque<>();
  stack.push(source);
  while (!stack.isEmpty()) {
    String node = stack.pop(); // sale el último que entró: sigue por el camino actual
    if (!seen.add(node)) continue; // ya visitado por otro camino
    visited.add(node);
    List<String> next = graph.get(node);
    for (int i = next.size() - 1; i >= 0; i--) stack.push(next.get(i)); // al revés, para visitar en orden
  }
  return visited;
}

dfs(graph, "A"); // [A, B, D, F, C, E]
```

El orden cambia por completo: baja `A -> B -> D -> F` hasta el fondo y solo después vuelve a `C`. DFS no visita por niveles, así que **no** sirve para calcular la menor cantidad de aristas: llega a `D` por `B` sin saber si había un camino más corto.

Dónde se usa: detectar ciclos (por ejemplo, dependencias circulares entre módulos), ordenar tareas según sus dependencias (lo que hace una herramienta de build) y recorrer árboles de carpetas. `Files.walk` de Java, por ejemplo, recorre el árbol de archivos en profundidad, como dice su documentación.

## Grafos con pesos

BFS cuenta aristas. Si cada arista tiene un costo distinto (minutos de viaje, precio de un pasaje), el camino con menos aristas puede no ser el más barato:

```text
A -> B: 10 minutos          A -> C: 2,  C -> D: 2,  D -> B: 2
1 arista, 10 minutos        3 aristas, 6 minutos
```

BFS elige `A -> B` porque tiene una sola arista. Para pesos no negativos se usa Dijkstra, que la clase 13 de MIT 6.006 presenta como una generalización de BFS para grafos con pesos y que se apoya en una **cola de prioridad** (en Java, `PriorityQueue`, que internamente es un heap de mínimos): en lugar de sacar el nodo más antiguo, saca el que tiene el menor costo acumulado.

## En la entrevista

### ¿Qué estructuras necesita un recorrido de grafo y para qué sirve cada una?

Dos. Un registro de **nodos ya vistos** (un `HashSet`), para no repetir trabajo y no quedar atrapado en ciclos. Y una colección de **pendientes**, que decide el orden: una **cola** da BFS (por niveles) y una **pila** da DFS (en profundidad). En Java, las dos se hacen con `ArrayDeque`.

### ¿Por qué BFS encuentra el camino con menos aristas?

Porque la cola saca los nodos en el orden en que se descubrieron: primero todos los que están a 1 arista, después todos los que están a 2, y así. La primera vez que BFS descubre un nodo, lo hace desde el nivel más cercano posible, así que esa distancia es la mínima. Por eso se marca como visto al descubrirlo y nunca se actualiza.

```java
dist.put(next, dist.get(node) + 1); // la primera vez es la menor
```

### ¿Qué cambia en un grafo con pesos?

Que "menos aristas" deja de significar "más barato": un camino de 3 aristas cortas puede costar menos que uno de 1 arista larga. BFS ignora los pesos, así que puede dar una respuesta incorrecta. Con pesos no negativos se usa Dijkstra, que reemplaza la cola por una cola de prioridad y siempre sigue por el nodo con menor costo acumulado.
