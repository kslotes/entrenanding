---
title: Replicación de bases de datos y réplicas de lectura
stack: []
references:
  - title: "PostgreSQL: Log-Shipping Standby Servers (streaming and synchronous replication)"
    url: https://www.postgresql.org/docs/current/warm-standby.html
  - title: "PostgreSQL: Hot Standby"
    url: https://www.postgresql.org/docs/current/hot-standby.html
  - title: "Amazon RDS: Working with DB instance read replicas"
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html
---

## El problema: "guardé mi perfil y no cambió"

Tu aplicación lee mucho más de lo que escribe, así que agregas réplicas de la base de datos y mandas las lecturas ahí. Todo va más rápido, hasta que llega un reporte raro: un usuario cambia su nombre, la página se recarga y muestra el nombre viejo. Recarga de nuevo y ahora sí aparece el nuevo.

```java
public Profile rename(long userId, String name) {
  primaryDb.update("UPDATE users SET name = ? WHERE id = ?", name, userId); // escribe en la principal
  return replicaDb.findProfile(userId); // lee de una réplica que todavía no recibió el cambio
}
```

No hay ningún bug en el SQL. La réplica todavía no se enteró del cambio.

## Primero, los términos

- **Replicación**: mantener copias de los mismos datos en varios servidores de base de datos.
- **Primaria** (_primary_): el servidor que acepta las escrituras. Es la fuente de verdad.
- **Réplica** (_standby_, _read replica_): un servidor que recibe los cambios de la primaria y los aplica en su copia. En PostgreSQL, una réplica _hot standby_ acepta consultas de solo lectura.
- **Commit**: el momento en que una transacción queda confirmada en la base.
- **Replicación asíncrona**: la primaria confirma el commit sin esperar a las réplicas; los cambios les llegan después.
- **Replicación síncrona**: la primaria espera que una o más réplicas confirmen antes de dar el commit por terminado.
- **Retraso de replicación** (_replication lag_): el tiempo entre el commit en la primaria y el momento en que el cambio es visible en la réplica.
- **Failover**: promover una réplica a primaria cuando la primaria falla.

## Para qué sirve replicar

- **Escalar lecturas**: muchas aplicaciones hacen diez lecturas por cada escritura. Las réplicas reparten esas lecturas.
- **Alta disponibilidad**: si la primaria cae, una réplica toma su lugar (failover).
- **Separar cargas pesadas**: un reporte que recorre millones de filas corre en una réplica y no frena las ventas.

Lo que **no** escala así son las escrituras: todas siguen pasando por la primaria.

## Asíncrona por defecto, y por eso hay retraso

La documentación de PostgreSQL lo dice directo: la replicación por streaming es **asíncrona por defecto**, y hay un pequeño retraso entre el commit en la primaria y que los cambios sean visibles en la réplica. Amazon RDS también copia los cambios a sus réplicas de lectura de forma asíncrona.

```text
t1  primaria: COMMIT name = "Ana María"     -> responde OK al cliente
t2  cliente:  GET /profile -> réplica       -> name = "Ana"       (todavía no llegó)
t3  réplica:  aplica el cambio
t4  cliente:  GET /profile -> réplica       -> name = "Ana María"
```

Normalmente son milisegundos, pero bajo carga, con una red lenta o una consulta larga en la réplica, pueden ser segundos o más. A esto se le llama **consistencia eventual**: la réplica termina igual a la primaria, pero no en el mismo instante.

¿Por qué no hacerla síncrona siempre? Porque cada commit esperaría a la red y a la réplica: escrituras más lentas, y si una réplica síncrona cae, los commits pueden quedar bloqueados. Además, la asincronía tiene un costo propio: si la primaria cae, los commits que no llegaron a replicarse se pierden en el failover.

## Cómo evitar leer tu propia escritura vieja

La garantía que el usuario espera se llama **leer tus propias escrituras** (_read-your-writes_): después de cambiar algo, al menos él debe ver el cambio. Formas comunes de lograrla:

**1. Leer de la primaria justo después de escribir.** La opción más simple:

```java
public Profile rename(long userId, String name) {
  primaryDb.update("UPDATE users SET name = ? WHERE id = ?", name, userId);
  return primaryDb.findProfile(userId); // la respuesta a una escritura sale de la primaria
}
```

**2. Fijar al usuario a la primaria por un rato.** Después de que un usuario escribe, sus lecturas van a la primaria durante unos segundos (por ejemplo, guardando la hora de su última escritura en la sesión). El resto de los usuarios sigue leyendo réplicas.

**3. Esperar a la réplica para ciertos commits.** PostgreSQL permite `synchronous_commit = remote_apply`: el commit espera hasta que las réplicas síncronas aplicaron la transacción y la hacen visible a las consultas. Garantiza la lectura, a cambio de escrituras más lentas.

La regla práctica: manda a las réplicas las lecturas que toleran unos segundos de atraso (listados, búsquedas, reportes) y a la primaria las que deben reflejar lo que el usuario acaba de hacer.

## En la entrevista

### ¿Por qué un usuario puede no ver un cambio que acaba de guardar?

Porque la escritura fue a la primaria y la lectura a una réplica asíncrona que todavía no recibió el cambio. La primaria confirmó el commit sin esperar a las réplicas, así que hay un retraso de replicación. Se soluciona leyendo de la primaria justo después de escribir, fijando al usuario a la primaria unos segundos, o con replicación síncrona para esas escrituras.

### ¿Qué diferencia hay entre replicación síncrona y asíncrona?

En la síncrona, la primaria espera que las réplicas confirmen antes de terminar el commit: no se pierden datos si la primaria cae, pero cada escritura es más lenta y depende de las réplicas. En la asíncrona, la primaria confirma enseguida: escrituras rápidas, pero las réplicas van con retraso y un failover puede perder los últimos commits.

### ¿Las réplicas de lectura ayudan a escalar las escrituras?

No. Todas las escrituras siguen yendo a la primaria, y además cada réplica tiene que aplicar cada cambio. Las réplicas escalan lecturas y dan disponibilidad. Para repartir escrituras hace falta particionar los datos entre varias primarias (sharding).
