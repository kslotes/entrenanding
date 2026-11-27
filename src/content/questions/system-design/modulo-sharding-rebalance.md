---
title: Repartes las claves con shard = hash(clave) % N. ¿Qué pasa al agregar un shard (de N a N + 1)?
type: multiple-choice
category: system-design
stack: []
seniority: [sr]
fundamentals: true
concepts: [database-sharding]
options:
  - id: a
    text: Solo se mueven las claves que van al shard nuevo, cerca de 1/(N + 1) del total
  - id: b
    text: La mayoría de las claves cambia de shard y hay que mover casi todos los datos
  - id: c
    text: Ninguna clave se mueve; el shard nuevo solo recibe datos nuevos
  - id: d
    text: Las claves se mueven solas sin costo, porque el hash no cambia
answer: b
---

La respuesta es **b**: al cambiar `N` cambia el resultado del módulo para casi todas las claves, así que casi todos los datos tienen que mudarse de shard.

```text
clave:   0 1 2 3 4 5 6 7 8 9 10 11
% 3:     0 1 2 0 1 2 0 1 2 0  1  2
% 4:     0 1 2 3 0 1 2 3 0 1  2  3
mueve:   - - - x x x x x x x  x  x     -> 9 de 12 claves cambian de shard
```

**Por qué pasa:** el hash de cada clave no cambia, pero el destino depende de `hash % N`. Con otro `N`, una clave solo se queda donde estaba si los dos restos coinciden, y eso pasa con pocas.

**La consecuencia práctica:** agregar capacidad obliga a mover casi todos los datos justo cuando el sistema está cargado. Por eso Dynamo y Cassandra usan **hashing consistente**: nodos y claves viven en un anillo, y agregar un nodo solo mueve las claves del tramo vecino.

**Las otras opciones:**

- `a`: eso describe el hashing consistente, no el módulo.
- `c`: las claves existentes también se recalculan con el nuevo `N`; si no se mueven, el router las busca en el shard equivocado.
- `d`: el hash no cambia, pero el resto sí; y mover datos entre servidores nunca es gratis.
