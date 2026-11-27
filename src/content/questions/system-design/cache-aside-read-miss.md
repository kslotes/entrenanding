---
title: En el patrón cache-aside, ¿qué pasa cuando una lectura no encuentra el dato en la caché?
type: multiple-choice
category: system-design
stack: []
seniority: [jr, ssr]
fundamentals: true
concepts: [caching-strategies]
options:
  - id: a
    text: La caché consulta la base de datos por su cuenta y devuelve el dato
  - id: b
    text: La aplicación lee la base de datos, guarda el dato en la caché y lo devuelve
  - id: c
    text: La aplicación devuelve un error hasta que un proceso de fondo cargue la caché
  - id: d
    text: La base de datos envía el dato a la caché en cuanto detecta la lectura
answer: b
---

La respuesta es **b**: en cache-aside la caché no conoce la base de datos. Es la **aplicación** la que, ante un miss, lee la base, guarda la copia en la caché y la devuelve.

```java
public Product get(long id) {
  String key = "product:" + id;
  return cache.get(key).orElseGet(() -> {
    Product product = products.findById(id).orElseThrow(); // miss: la app va a la base
    cache.set(key, product, Duration.ofMinutes(10));        // y deja la copia para los próximos
    return product;
  });
}
```

**Por qué funciona así:** la caché queda como un almacén "tonto" de claves y valores, y toda la lógica vive en tu código. Solo se cachea lo que alguien pide, y si la caché se cae la aplicación sigue respondiendo desde la base, más lenta pero correcta.

**La consecuencia práctica:** el primer pedido de cada clave paga tres viajes (caché, base, caché); los siguientes son hits mientras dure el TTL.

**Las otras opciones:**

- `a`: eso es _read-through_, donde la caché sabe cargar el dato. En cache-aside la caché no habla con la base.
- `c`: un miss no es un error; la aplicación resuelve el dato en el momento.
- `d`: la base no sabe que existe una caché ni recibe avisos de lecturas que no le llegan.
