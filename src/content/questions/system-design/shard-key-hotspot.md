---
title: Particionas la tabla de pedidos en 4 shards por rangos de la fecha de creación. ¿Qué problema aparece con las escrituras?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [database-sharding]
options:
  - id: a
    text: Todos los pedidos nuevos caen en el mismo shard, que recibe todas las escrituras
  - id: b
    text: Las escrituras se reparten de forma pareja, pero las lecturas por fecha se vuelven lentas
  - id: c
    text: Cada escritura tiene que confirmarse en los 4 shards a la vez
  - id: d
    text: Ninguno; la fecha de creación es una clave de shard ideal
answer: a
---

La respuesta es **a**: la fecha de creación es **monótona**, siempre crece. Todos los pedidos nuevos tienen la fecha de hoy y caen en el último rango, así que un solo shard recibe todas las escrituras.

```text
shard 0: enero-marzo    (sin escrituras)
shard 1: abril-junio    (sin escrituras)
shard 2: julio-sept     (sin escrituras)
shard 3: octubre-hoy    <- todas las escrituras nuevas
```

**Por qué pasa:** el sharding por rangos manda cada fila al shard cuyo rango contiene su clave. Si los valores nuevos siempre son los más altos, siempre van al mismo rango. La documentación de MongoDB lo advierte para cualquier clave que crece o decrece de forma monótona.

**La consecuencia práctica:** pagas 4 servidores y escala como uno. Se elige una clave de alta cardinalidad y no monótona, como el id del cliente, o se hashea la clave para repartir las inserciones.

**Las otras opciones:**

- `b`: el reparto de escrituras es justo lo que falla; las lecturas por fecha, en cambio, son de lo poco que este esquema hace bien.
- `c`: cada fila vive en un solo shard; confirmar en todos sería replicar, no particionar.
- `d`: es una de las peores claves para escrituras, por ser monótona.
