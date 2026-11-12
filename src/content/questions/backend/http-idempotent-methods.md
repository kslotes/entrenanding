---
title: Según la especificación de HTTP, ¿cuál de estos métodos NO es idempotente?
type: multiple-choice
category: backend
stack: [http]
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: GET
  - id: b
    text: PUT
  - id: c
    text: DELETE
  - id: d
    text: POST
answer: d
---

**POST**. La RFC 9110 define como idempotentes a PUT, DELETE y los métodos seguros (como GET y HEAD): repetir la misma petición tiene el mismo efecto buscado en el servidor que enviarla una vez.

POST no tiene esa garantía: enviarlo dos veces puede crear dos recursos o cobrar dos veces. Esto importa al reintentar después de un error de red: una petición idempotente se puede repetir sin riesgo.
