---
title: Según la especificación de HTTP, ¿cuál de estos métodos NO es idempotente?
type: multiple-choice
category: backend
stack: [http]
seniority: [jr, ssr]
fundamentals: true
concepts: [http-method-semantics]
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

La respuesta es **POST**. La RFC 9110 define como **idempotentes** a PUT, DELETE y los métodos seguros (como GET y HEAD): enviar la misma petición varias veces deja el servidor igual que enviarla una vez. POST no tiene esa garantía.

```http
PUT  /products/7/stock  {"stock": 10}   -> stock = 10
PUT  /products/7/stock  {"stock": 10}   -> stock = 10   (mismo estado)

POST /orders            {"item": "book"} -> crea el pedido 1
POST /orders            {"item": "book"} -> crea el pedido 2   (otro efecto)
```

**Por qué importa:** cuando una petición se queda sin respuesta (un timeout, un corte de red), el cliente no sabe si el servidor la procesó. Con un método idempotente puede reintentar sin riesgo: en el peor caso el efecto se aplica de nuevo y el resultado es el mismo. Con POST, reintentar puede crear dos pedidos o cobrar dos veces. Por eso las librerías HTTP reintentan solas un GET o un PUT, pero no un POST.

**La consecuencia práctica:** la idempotencia es un contrato que tu código tiene que cumplir. Un `PUT` que "suma 1 al stock" lo rompe; esa operación va con POST. Y si un POST debe poder reintentarse (un pago), el cliente envía una clave única por operación para que el servidor detecte el duplicado.

**Las otras opciones:**

- `GET`: es seguro (solo lectura) y, por lo tanto, también idempotente.
- `PUT`: reemplaza el recurso con lo que envías; repetirlo deja el mismo estado.
- `DELETE`: después del primero el recurso ya no existe, y después del segundo tampoco. Que el segundo devuelva `404` no importa: la idempotencia mide el efecto, no la respuesta.
