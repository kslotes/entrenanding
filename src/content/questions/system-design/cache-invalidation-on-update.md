---
title: Con cache-aside, al cambiar el precio de un producto, ¿qué se recomienda hacer?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [caching-strategies]
options:
  - id: a
    text: Actualizar la base de datos y después borrar la clave del producto en la caché
  - id: b
    text: Borrar la clave del producto en la caché y después actualizar la base de datos
  - id: c
    text: Escribir el precio nuevo en la caché y después actualizar la base de datos
  - id: d
    text: Actualizar solo la base de datos; el TTL ya se encarga de la caché
answer: a
---

La respuesta es **a**: primero se actualiza la fuente de verdad (la base) y después se **borra** la copia. La próxima lectura tiene un miss y carga el precio nuevo.

```java
public void changePrice(long id, BigDecimal price) {
  products.updatePrice(id, price); // 1) la base primero
  cache.delete("product:" + id);   // 2) se invalida la copia
}
```

**Por qué borrar y no escribir el valor nuevo:** con dos escrituras al mismo tiempo, el orden en que llegan a la caché puede no coincidir con el de la base:

```text
A: UPDATE 10 -> B: UPDATE 12 -> B: cache = 12 -> A: cache = 10   (base 12, caché 10)
```

Borrar es idempotente: dos borrados dejan la caché igual y la próxima lectura trae el valor real.

**Por qué en ese orden:** si borras primero, un lector puede tener un miss, leer el precio viejo de la base y volver a guardarlo antes de que se haga el `UPDATE`.

**Las otras opciones:**

- `b`: abre la ventana en la que un lector vuelve a cachear el precio viejo.
- `c`: si el `UPDATE` falla, la caché muestra un precio que no existe; además sufre la carrera entre escrituras.
- `d`: el TTL es la red de seguridad, no la estrategia: hasta que venza, todos ven el precio viejo.
