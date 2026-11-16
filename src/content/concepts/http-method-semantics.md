---
title: Semántica de los métodos HTTP
stack: [http]
references:
  - title: "RFC 9110 9.2.1: Safe Methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1
  - title: "RFC 9110 9.2.2: Idempotent Methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
  - title: "RFC 9110 9.2.3: Methods and Caching"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.3
  - title: "RFC 9110 18.2: Method Registration"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-18.2
  - title: "RFC 5789: PATCH Method for HTTP"
    url: https://www.rfc-editor.org/rfc/rfc5789.html
---

## Tres propiedades distintas

La RFC 9110 clasifica los métodos HTTP con propiedades que se confunden a menudo:

| Propiedad       | Qué garantiza                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Segura**      | La semántica es de solo lectura: el cliente no pide ni espera cambios de estado en el servidor.   |
| **Idempotente** | El efecto buscado de varias peticiones idénticas es el mismo que el de una sola.                  |
| **Cacheable**   | La definición del método permite guardar la respuesta y reutilizarla para peticiones posteriores. |

Según la RFC, de los métodos que define, GET, HEAD, OPTIONS y TRACE son **seguros**, y PUT, DELETE y los métodos seguros son **idempotentes**. Todo método seguro es idempotente, pero no al revés.

## Idempotente no significa "misma respuesta"

La idempotencia habla del **efecto en el servidor**, no del código de estado:

```http
DELETE /orders/42   -> 204 No Content   (el pedido se borra)
DELETE /orders/42   -> 404 Not Found    (ya no existe)
```

Las respuestas difieren, pero el estado final es el mismo: el pedido 42 no existe. La RFC lo dice de forma explícita: repetir la petición tiene el mismo efecto buscado aunque la respuesta pueda ser distinta.

Tampoco prohíbe efectos secundarios: el servidor puede registrar cada petición en un log o guardar un historial. Lo que importa es lo que el cliente pidió.

## Por qué importa: reintentos

La RFC distingue los métodos idempotentes porque una petición se puede **repetir automáticamente** si la conexión falla antes de leer la respuesta. Como repetirla tiene el mismo efecto, no importa si la primera llegó o no.

Para el resto de los métodos, la RFC indica que un cliente no debería reintentar automáticamente salvo que sepa que esa operación concreta es idempotente, y que un proxy no debe hacerlo.

## La semántica depende de cómo diseñas la operación

Que un método sea idempotente es un contrato: tu implementación tiene que respetarlo.

- `PUT` pide que el estado del recurso **se cree o se reemplace** por la representación enviada. Enviar `{"stock": 10}` dos veces deja el stock en 10.
- Una operación del estilo "suma 1 al stock" no es idempotente: cada repetición cambia el resultado. Si la expones con `PUT`, rompes el contrato.
- `PATCH` (RFC 5789) aplica un conjunto de cambios parciales y la RFC lo define como ni seguro ni idempotente.

## Seguro no es lo mismo que "inofensivo por accidente"

Si un `GET` dispara una acción, como `GET /page?do=delete`, la RFC exige que el dueño del recurso la deshabilite para métodos seguros. Los crawlers y el prefetch de los navegadores hacen GET sobre cualquier enlace que encuentran.

## En la entrevista

- ¿Qué diferencia hay entre un método seguro y uno idempotente?
- Si un DELETE repetido devuelve 404, ¿deja de ser idempotente?
- ¿Por qué la idempotencia importa al reintentar después de un timeout?
