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
  - title: "List.reversed (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#reversed()
---

## El problema: el arreglo que no puede crecer

Un arreglo de Java tiene tamaño fijo desde que se crea:

```java
String[] names = new String[3];
names[0] = "ana";
names[1] = "tom";
names[2] = "eva";
names[3] = "tim"; // ArrayIndexOutOfBoundsException: no hay lugar para un cuarto
```

Casi nunca sabes de antemano cuántos elementos vas a tener: los resultados de una consulta, las líneas de un archivo, los productos de un carrito. `ArrayList` resuelve eso: es un arreglo que **crece solo**. Pero cómo crece, y qué cuesta cada operación, explica por qué algunas formas de usarlo son rápidas y otras se vuelven lentísimas con muchos datos.

## Primero, los términos

- **Arreglo**: un bloque de posiciones de memoria **contiguas** (una al lado de la otra), todas del mismo tipo.
- **Índice**: la posición de un elemento, empezando en `0`.
- **Arreglo dinámico**: una estructura que usa un arreglo por dentro y lo reemplaza por uno más grande cuando se llena. `ArrayList` es uno.
- **Size** (tamaño): cuántos elementos tiene la lista.
- **Capacidad**: el largo del arreglo interno, es decir, cuántos elementos caben antes de tener que crecer. Según la documentación, siempre es al menos tan grande como el tamaño.
- **O(1)**: tiempo constante, que no depende de cuántos elementos haya. **O(n)**: tiempo que crece igual que la cantidad de elementos.
- **Amortizado**: el costo promedio por operación, repartido a lo largo de muchas operaciones. Una operación puntual puede ser cara si las demás son baratas.

## Cómo crece un ArrayList

Cuando el arreglo interno se llena, se crea uno más grande y se copian todos los elementos:

```text
capacidad 4: [a][b][c][d]          size 4: lleno
add("e"):    se crea un arreglo de 6 y se copian a, b, c, d
capacidad 6: [a][b][c][d][e][ ]    size 5
```

En el código de OpenJDK 21, el crecimiento preferido es la mitad de la capacidad actual (`oldCapacity >> 1`), o sea, la capacidad pasa a ser aproximadamente 1.5 veces la anterior. La documentación de `ArrayList` no lo garantiza: solo promete que agregar un elemento al final tiene costo constante amortizado.

## Costo amortizado

Copiar todo el arreglo es `O(n)`, pero ocurre pocas veces porque la capacidad crece de forma **proporcional**: cada vez que crece, tarda más en volver a llenarse. Si se cuentan las copias al agregar `n` elementos a un arreglo que duplica su capacidad:

```java
int capacity = 1, size = 0;
long copies = 0;
for (int i = 0; i < n; i++) {
  if (size == capacity) {
    copies += size; // copiar todo al arreglo nuevo
    capacity *= 2;
  }
  size++;
}
// n = 1_000     -> 1023 copias
// n = 1_000_000 -> 1048575 copias
```

Las copias totales quedan en el orden de `n` (aproximadamente una por elemento), así que el costo **promedio por inserción** es constante, aunque una inserción concreta pueda ser cara. Eso significa "O(1) amortizado".

Si sabes cuántos elementos vas a agregar, `new ArrayList<>(capacidad)` o `ensureCapacity` reservan el espacio de entrada y evitan las copias intermedias:

```java
List<OrderDto> dtos = new ArrayList<>(orders.size()); // ya sabes el tamaño final
for (Order o : orders) dtos.add(toDto(o));
```

## Acceso por índice vs. insertar en el medio

Como los elementos están contiguos, la posición `i` se calcula directamente: "inicio del arreglo + `i` posiciones". Leer o escribir cualquier índice cuesta lo mismo, sea el primero o el millonésimo: **O(1)**.

Insertar o quitar en una posición intermedia es otra cosa: los elementos siguientes tienen que moverse para no dejar huecos, porque el arreglo no puede tener posiciones vacías en el medio.

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
list.add(2, "x"); // [a, b, x, c, d]: "c" y "d" se corren a la derecha
list.remove(0);   // [b, x, c, d]: todos los demás se corren a la izquierda
```

```text
add(0, "x") sobre [a][b][c][d]:
  1. correr d -> posición 4
  2. correr c -> posición 3
  3. correr b -> posición 2
  4. correr a -> posición 1
  5. escribir x en la posición 0
```

Cuantos más elementos quedan después de la posición, más hay que mover. Insertar al principio mueve **todos**: `O(n)`. La documentación lo resume así:

| Operación                                        | Costo según la documentación |
| ------------------------------------------------ | ---------------------------- |
| `size`, `isEmpty`, `get`, `set`, `iterator`      | Constante                    |
| `add(e)` (al final)                              | Constante amortizado         |
| El resto (`add(i, e)`, `remove(i)`, `contains`…) | Lineal, aproximadamente      |

`contains` es lineal por otro motivo: tiene que mirar los elementos uno por uno hasta encontrarlo. Para búsquedas rápidas por valor, usa un [`HashSet` o un `HashMap`](./hash-tables.md).

### Dónde muerde en una app real

Un caso típico es armar una lista "lo más nuevo primero" insertando cada elemento al principio:

```java
List<Event> timeline = new ArrayList<>();
for (Event e : eventsOldestFirst) {
  timeline.add(0, e); // mal: cada inserción corre todos los anteriores
}
// con 100 000 eventos: unos 5 000 millones de movimientos en total
```

Cada `add(0, e)` es `O(n)`, y hacerlo `n` veces da `O(n²)`. Con pocos datos no se nota; con muchos, el endpoint tarda segundos. Las alternativas:

```java
// 1. Agregar al final (O(1) amortizado) y dar vuelta una vez al terminar.
List<Event> timeline = new ArrayList<>(eventsOldestFirst);
Collections.reverse(timeline); // un solo recorrido: O(n)

// 2. Desde Java 21, una vista invertida sin copiar.
List<Event> newestFirst = eventsOldestFirst.reversed();
```

El otro caso típico es usar `list.remove(0)` para procesar una cola de tareas: cada `remove(0)` corre todos los que quedan. Para eso existe `ArrayDeque`.

## Cuando necesitas los dos extremos

Si una estructura recibe y entrega elementos por el principio y por el final (una **cola** o una **deque**, "cola de dos extremos"), `ArrayDeque` usa un arreglo circular, como describe su código fuente: guarda dónde empieza y dónde termina, y agregar adelante solo mueve el índice de inicio, sin correr los demás elementos.

```text
arreglo circular de 8, head = 2:
  [ ][ ][b][c][ ][ ][ ][ ]
addFirst("a"): head = 1, nada se mueve
  [ ][a][b][c][ ][ ][ ][ ]
```

Según su documentación, la mayoría de sus operaciones son de tiempo constante amortizado, y es probable que sea más rápida que `LinkedList` usada como cola.

```java
Deque<String> dq = new ArrayDeque<>(List.of("b", "c"));
dq.addFirst("a");
dq.addLast("d");
// [a, b, c, d]

Deque<Task> queue = new ArrayDeque<>();
queue.addLast(task);           // encolar al final
Task next = queue.pollFirst(); // sacar del principio, sin correr nada
```

La contracara: `ArrayDeque` no tiene acceso por índice (`get(i)`). Si necesitas leer posiciones arbitrarias, sigue siendo `ArrayList`.

## En la entrevista

### ¿Qué significa que `add` sea O(1) amortizado?

Que el costo **promedio** de agregar al final es constante, aunque algunas inserciones puntuales sean caras. Cuando el arreglo interno se llena, `ArrayList` crea uno más grande (en OpenJDK, 1.5 veces) y copia todo, que es `O(n)`. Pero como la capacidad crece de forma proporcional, esas copias son cada vez más raras, y repartidas entre todas las inserciones suman aproximadamente una copia por elemento.

### ¿Por qué el acceso por índice es constante y una inserción en el medio no?

Porque los elementos están en posiciones de memoria contiguas: la posición `i` se calcula como "inicio + `i`", sin recorrer nada. Insertar en el medio, en cambio, obliga a correr una posición todos los elementos que están después para abrir el hueco; insertar al principio los corre todos, así que es `O(n)`.

```java
list.get(500_000); // O(1): cálculo directo
list.add(0, x);    // O(n): mueve todos los elementos
```

### ¿Cuándo elegirías `ArrayDeque` en lugar de `ArrayList`?

Cuando agregas o quitas elementos por los extremos, sobre todo por el principio: colas de tareas, recorridos en anchura (BFS), historial de "deshacer". `ArrayDeque` usa un arreglo circular y lo hace en tiempo constante amortizado, mientras que `ArrayList.add(0, x)` o `remove(0)` son `O(n)`. Elegirías `ArrayList` cuando necesitas acceso por índice, que `ArrayDeque` no ofrece.
