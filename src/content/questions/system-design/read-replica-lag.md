---
title: Las escrituras van a la base primaria y las lecturas a réplicas asíncronas. Un usuario guarda su perfil, al recargar ve los datos viejos y unos segundos después ve los nuevos. ¿Qué está pasando?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [database-replication]
options:
  - id: a
    text: La transacción no hizo commit en la primaria
  - id: b
    text: La réplica todavía no aplicó el cambio por el retraso de replicación
  - id: c
    text: La réplica rechazó la escritura porque es de solo lectura
  - id: d
    text: El navegador muestra una versión de la página guardada en caché
answer: b
---

La respuesta es **b**: con replicación asíncrona, la primaria confirma el commit sin esperar a las réplicas. Si la lectura llega a una réplica antes de que el cambio la alcance, devuelve el dato viejo.

```text
t1  primaria: COMMIT name = "Ana María"  -> OK
t2  lectura -> réplica                   -> name = "Ana"        (retraso de replicación)
t3  réplica aplica el cambio
t4  lectura -> réplica                   -> name = "Ana María"
```

**Por qué funciona así:** PostgreSQL y Amazon RDS replican de forma asíncrona por defecto, porque esperar a las réplicas haría más lenta cada escritura. A cambio, las réplicas van un poco atrasadas.

**La consecuencia práctica:** las lecturas que deben reflejar lo que el usuario acaba de hacer (_read-your-writes_) van a la primaria, por ejemplo la respuesta al guardar el perfil. Las que toleran unos segundos de atraso pueden ir a las réplicas.

**Las otras opciones:**

- `a`: si el commit hubiera fallado, el dato nuevo no aparecería nunca; aquí aparece unos segundos después.
- `c`: la escritura no fue a la réplica, fue a la primaria.
- `d`: las lecturas llegan a réplicas asíncronas y ese atraso ya explica el dato viejo que se corrige solo; no hace falta suponer una caché del navegador.
