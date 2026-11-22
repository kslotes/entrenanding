---
title: Sharding (particionado) y elección de la clave
stack: []
references:
  - title: "MongoDB: Choose a Shard Key"
    url: https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/
  - title: "MongoDB: Shard Keys"
    url: https://www.mongodb.com/docs/manual/core/sharding-shard-key/
  - title: "MongoDB: Hashed Sharding"
    url: https://www.mongodb.com/docs/manual/core/hashed-sharding/
  - title: "Apache Cassandra: Dynamo (consistent hashing)"
    url: https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html
  - title: "Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)"
    url: https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf
---

## El problema: una sola base ya no alcanza para escribir

Tu servicio de pedidos crece hasta recibir decenas de miles de escrituras por segundo. Agregaste réplicas, pero las réplicas solo reparten lecturas: **todas las escrituras siguen yendo a la primaria**, y la primaria ya no da más. Tampoco entra en un solo disco. Necesitas que distintos servidores guarden **distintas partes** de los datos.

## Primero, los términos

- **Sharding** (particionado horizontal): dividir las filas de una tabla entre varios servidores de base de datos. Cada servidor guarda una parte.
- **Shard**: cada una de esas partes, con su propio servidor (y normalmente sus propias réplicas).
- **Clave de shard** (_shard key_): el campo que decide en qué shard va cada fila, por ejemplo `customerId`.
- **Router**: el código o componente que, dada una clave, sabe a qué shard ir.
- **Cardinalidad**: cuántos valores distintos puede tomar la clave. `country` tiene pocos; `orderId` tiene millones.
- **Monótona**: una clave que siempre crece (o siempre decrece), como una fecha de creación o un id autoincremental.
- **Hotspot** (punto caliente): un shard que recibe mucha más carga que los demás.
- **Rebalancear**: mover datos entre shards cuando cambia la cantidad de shards o la carga está despareja.

## Por rangos o por hash

Hay dos formas básicas de elegir el shard a partir de la clave:

```java
// Por rangos: clientes 0-999999 en el shard 0, 1000000-1999999 en el shard 1...
int shardByRange(long customerId) {
  return (int) (customerId / 1_000_000);
}

// Por hash: se mezcla la clave y se reparte de forma pareja
int shardByHash(long customerId, int shardCount) {
  return Math.floorMod(Long.hashCode(customerId), shardCount);
}
```

Los **rangos** sirven para consultas por intervalo ("pedidos del cliente 100 al 200" va a un solo shard), pero dependen mucho de cómo se distribuyen los valores. El **hash** reparte de forma pareja, pero una consulta por rango tiene que preguntar a todos los shards.

## La trampa de la clave monótona

Tomas `createdAt` como clave de shard con rangos de fechas. Parece natural: cada shard tiene un período. El problema:

```text
shard 0: enero-marzo    <- ya no recibe escrituras
shard 1: abril-junio    <- ya no recibe escrituras
shard 2: julio-hoy      <- recibe TODAS las escrituras nuevas
```

Todos los pedidos nuevos tienen la fecha de hoy, así que todos caen en el último rango. Tienes tres servidores, pero uno solo trabaja. La documentación de MongoDB lo advierte: una clave que crece o decrece de forma monótona tiende a mandar todas las inserciones a un único fragmento del clúster. Lo mismo pasa con un id autoincremental.

Qué buscar en una buena clave, según esa misma guía:

- **Alta cardinalidad**: muchos valores distintos para repartir.
- **Baja frecuencia**: que ningún valor concentre la mayoría de las filas (un cliente gigante es un hotspot).
- **No monótona**, o hasheada para que deje de serlo (MongoDB ofrece _hashed sharding_ justo para esto).
- **Alineada con las consultas**: si casi siempre buscas por cliente, `customerId` hace que cada consulta toque un solo shard.

## La trampa del módulo al agregar shards

Con `hash(clave) % N`, agregar un shard cambia `N` y cambia el destino de casi todas las claves. Con las claves 0 a 11, pasar de 3 a 4 shards:

```text
clave:   0 1 2 3 4 5 6 7 8 9 10 11
% 3:     0 1 2 0 1 2 0 1 2 0  1  2
% 4:     0 1 2 3 0 1 2 3 0 1  2  3
mueve:   - - - x x x x x x x  x  x     -> 9 de 12 (75 %) cambian de shard
```

Mover el 75 % de los datos para agregar un servidor es carísimo, justo cuando el sistema ya está cargado. La documentación de Cassandra lo describe así: en este esquema ingenuo, agregar un solo nodo puede invalidar casi todas las asignaciones.

### Hashing consistente

La solución es el **hashing consistente**: los nodos y las claves se ubican en un mismo anillo de valores de hash, y cada clave pertenece al primer nodo que encuentra avanzando por el anillo.

```text
          nodo A
        /        \
   clave k1       nodo B    <- k1 es de B (el siguiente en el sentido del anillo)
        \        /
          nodo C
```

Al agregar un nodo D entre A y B, solo las claves que quedan entre A y D pasan a D; el resto no se mueve. Con N nodos, agregar uno mueve en promedio cerca de 1/(N+1) de las claves, no casi todas. Dynamo y Cassandra usan esta idea, con varios puntos por nodo en el anillo (nodos virtuales) para que el reparto sea parejo.

## El costo del sharding

Sharding resuelve la escala de escritura, pero complica todo lo demás:

- Una consulta que no incluye la clave de shard tiene que ir a **todos** los shards.
- Un `JOIN` o una transacción entre filas de distintos shards ya no es una operación local.
- Cambiar la clave de shard más adelante es muy caro: obliga a mover los datos.

Por eso es lo último que se agrega: primero índices, caché y réplicas.

## En la entrevista

### ¿Qué diferencia hay entre replicar y hacer sharding?

Replicar copia **todos** los datos en varios servidores: escala lecturas y da disponibilidad, pero las escrituras siguen en una primaria. Sharding divide los datos: cada servidor guarda una parte, y así se reparten también las escrituras y el almacenamiento. En la práctica se combinan: cada shard tiene sus propias réplicas.

### ¿Por qué es mala idea usar la fecha de creación como clave de shard por rangos?

Porque es monótona: todas las filas nuevas tienen la fecha más reciente y caen en el último rango. Un shard recibe todas las escrituras (un hotspot) y los demás quedan ociosos. Conviene una clave de alta cardinalidad y no monótona, como el id del cliente, o hashear la clave.

### ¿Qué problema resuelve el hashing consistente?

El de rebalancear. Con `hash % N`, cambiar la cantidad de nodos cambia el destino de casi todas las claves. Con hashing consistente, nodos y claves viven en un anillo y agregar o quitar un nodo solo mueve las claves del tramo vecino, cerca de 1/N del total.
