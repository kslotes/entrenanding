---
title: Tu cola entrega mensajes "al menos una vez" y el consumidor cobra un pedido por cada mensaje. ¿Qué debes garantizar?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [message-queues]
options:
  - id: a
    text: Nada; "al menos una vez" significa que cada mensaje llega exactamente una vez
  - id: b
    text: Que el consumidor sea idempotente, porque un mensaje puede llegar más de una vez
  - id: c
    text: Confirmar el mensaje antes de cobrar, para que la cola no lo reentregue
  - id: d
    text: Usar un solo consumidor; los duplicados solo aparecen con varios
answer: b
---

La respuesta es **b**: "al menos una vez" garantiza que el mensaje no se pierde, no que llegue una sola vez. Si el consumidor cobra y muere antes de confirmar, la cola lo reentrega y se cobra dos veces.

```java
@Transactional
void onMessage(ChargeOrder message) {
  if (processed.existsById(message.messageId())) {
    return; // reentrega: ya se cobró, no se repite el efecto
  }
  payments.charge(message.orderId(), message.amount());
  processed.save(new ProcessedMessage(message.messageId()));
}
```

**Por qué pasa:** el consumidor recibe, procesa y solo al final confirma. Si algo falla entre procesar y confirmar, la cola no sabe que el trabajo se hizo, y para no perderlo lo vuelve a entregar. AWS SQS y RabbitMQ piden de forma explícita diseñar consumidores idempotentes.

**La consecuencia práctica:** cada consumidor con efectos (cobrar, mandar un email, sumar stock) necesita una forma de reconocer lo ya hecho: un id registrado en la misma transacción, una restricción única o una clave de idempotencia en el servicio externo.

**Las otras opciones:**

- `a`: "al menos" es justamente lo contrario: puede ser una o más veces.
- `c`: evita los duplicados pero pierde el mensaje si el proceso muere antes de cobrar (entrega "como máximo una vez").
- `d`: con un solo consumidor también hay reentregas, por ejemplo si se reinicia antes de confirmar.
