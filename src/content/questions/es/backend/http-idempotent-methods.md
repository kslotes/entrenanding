---
title: ¿Qué significa que un método HTTP sea idempotente y cuáles lo son?
locale: es
type: open
category: backend
stack: [http]
seniority: [jr, ssr]
fundamentals: true
---

Un método es **idempotente** cuando enviar la misma petición una o muchas veces deja al servidor en el mismo estado.

- Idempotentes: `GET`, `HEAD`, `OPTIONS`, `TRACE`, `PUT`, `DELETE`.
- No idempotente: `POST`. No está garantizado que `PATCH` sea idempotente.
- Idempotente no es lo mismo que seguro: `PUT` y `DELETE` cambian el estado, pero repetirlos no lo cambia más. La respuesta puede variar (un segundo `DELETE` puede devolver `404`).

Importa porque los clientes, los proxies y la lógica de reintentos pueden reenviar peticiones idempotentes sin riesgo tras un tiempo de espera agotado. Para `POST`, las API suelen agregar una clave de idempotencia para que los reintentos sean seguros.
