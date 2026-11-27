---
title: Colas de mensajes, entrega al menos una vez y consumidores idempotentes
stack: []
references:
  - title: "Azure Architecture Center: Queue-Based Load Leveling pattern"
    url: https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling
  - title: "Amazon SQS: At-least-once delivery"
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html
  - title: "Amazon SQS: Visibility timeout"
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html
  - title: "RabbitMQ: Reliability guide"
    url: https://www.rabbitmq.com/docs/reliability
  - title: "Apache Kafka: Message delivery semantics"
    url: https://kafka.apache.org/documentation/#semantics
---

## El problema: el registro que tarda lo que tarda el email

Al registrarse, un usuario recibe un email de bienvenida. El controlador lo manda en la misma petición:

```java
@PostMapping("/signup")
public void signup(@RequestBody SignupRequest request) {
  users.save(request.toUser());
  emailProvider.sendWelcome(request.email()); // 2 segundos; si el proveedor cae, el registro falla
}
```

Mientras todo va bien, el usuario espera dos segundos de más. Con una campaña de marketing llegan mil registros por segundo, el proveedor de email limita las llamadas y los registros empiezan a fallar. Un problema del email tumba el registro, que no tiene nada que ver con él.

## Primero, los términos

- **Cola de mensajes**: un servicio que guarda mensajes hasta que alguien los procesa (Amazon SQS, RabbitMQ; Apache Kafka cumple un rol parecido con un log).
- **Mensaje**: un dato que describe un trabajo pendiente, por ejemplo `{"type": "welcome-email", "userId": 42}`.
- **Productor**: el código que publica mensajes en la cola.
- **Consumidor** (_worker_): el código que lee mensajes de la cola y hace el trabajo.
- **Asíncrono**: el productor no espera a que el trabajo termine; sigue con lo suyo.
- **Confirmación** (_ack_): el aviso del consumidor a la cola de que terminó un mensaje y puede borrarlo.
- **Reentrega**: la cola vuelve a entregar un mensaje que no fue confirmado.
- **Idempotente**: una operación que, repetida, deja el mismo resultado que hecha una vez.

## Desacoplar y nivelar la carga

Con una cola en el medio, el registro solo publica un mensaje y responde:

```java
@PostMapping("/signup")
public void signup(@RequestBody SignupRequest request) {
  User user = users.save(request.toUser());
  queue.publish(new WelcomeEmail(user.id())); // milisegundos; el email se manda después
}
```

```java
// otro proceso, a su ritmo
void onMessage(WelcomeEmail message) {
  emailProvider.sendWelcome(users.emailOf(message.userId()));
}
```

Lo que ganas, según el patrón _Queue-Based Load Leveling_ de Azure:

- **La cola amortigua los picos**: mil registros por segundo se convierten en mil mensajes esperando, y el consumidor los procesa a la velocidad que el proveedor tolera.
- **El productor no depende del consumidor**: si el proveedor de email está caído, los registros siguen funcionando y los mensajes esperan en la cola.
- **Escalas cada lado por separado**: agregas consumidores si la cola crece.

El costo: el email ya no sale en el mismo instante, y tienes un componente más que operar y monitorear (el tamaño de la cola es la métrica clave).

## Al menos una vez: los mensajes se pueden repetir

Las colas más usadas garantizan entrega **al menos una vez** (_at-least-once_): un mensaje no se pierde, pero puede llegar más de una vez. ¿Por qué? Mira el orden en que trabaja un consumidor:

```text
1. recibe el mensaje
2. manda el email
3. confirma (ack)      <- si el proceso muere ANTES de este paso...
```

Si el consumidor muere entre el paso 2 y el 3, la cola nunca recibió la confirmación. Para no perder el mensaje, lo vuelve a entregar a otro consumidor, que manda el email **otra vez**. En SQS, un mensaje recibido queda oculto durante el _visibility timeout_ y, si no se borra en ese tiempo, vuelve a ser visible. Además, SQS estándar avisa que en casos raros puede entregar una copia de un mensaje ya borrado.

La alternativa sería confirmar **antes** de procesar. Entonces, si el proceso muere en el medio, el mensaje se pierde: eso es **como máximo una vez** (_at-most-once_). La documentación de Kafka explica las dos variantes con este mismo orden de pasos. Para trabajo que importa, se elige no perder mensajes y aceptar duplicados.

## La solución: consumidores idempotentes

Tanto AWS como RabbitMQ dan el mismo consejo: diseña el consumidor para que procesar el mismo mensaje dos veces no cause daño. RabbitMQ recomienda consumidores idempotentes en lugar de intentar deduplicar de forma explícita.

```java
// mal: cada reentrega cobra otra vez
void onMessage(ChargeOrder message) {
  payments.charge(message.orderId(), message.amount());
}
```

```java
// bien: el id del mensaje (o del pedido) se registra en la misma transacción que el efecto
@Transactional
void onMessage(ChargeOrder message) {
  if (processed.existsById(message.messageId())) {
    return; // ya lo hice: confirmo y no repito el efecto
  }
  payments.charge(message.orderId(), message.amount());
  processed.save(new ProcessedMessage(message.messageId())); // con restricción única en la tabla
}
```

Otras formas de lograrlo:

- **Operaciones naturalmente idempotentes**: "poner el estado del pedido en ENVIADO" se puede repetir; "sumar 1 al contador" no.
- **Clave única en la base**: insertar con un id que la base rechaza si ya existe.
- **Pasar la clave al servicio externo**: muchos proveedores de pagos aceptan una clave de idempotencia por operación.

## En la entrevista

### ¿Para qué pones una cola entre dos servicios?

Para desacoplarlos y nivelar la carga. El productor publica y sigue, sin esperar ni depender de que el consumidor esté vivo. La cola absorbe los picos y el consumidor procesa a su ritmo. Así un servicio lento o caído no tumba al que lo llama, y cada lado escala por separado. El costo es que el trabajo pasa a ser asíncrono.

### ¿Qué significa entrega "al menos una vez" y qué implica para tu código?

Que la cola garantiza no perder mensajes, a cambio de que alguno llegue repetido: si un consumidor procesa pero muere antes de confirmar, la cola lo reentrega. Implica que el consumidor tiene que ser idempotente, por ejemplo registrando el id de cada mensaje procesado en la misma transacción que su efecto, o usando operaciones que se puedan repetir sin daño.

### ¿Por qué no confirmar el mensaje antes de procesarlo?

Porque si el proceso muere después de confirmar y antes de terminar, el mensaje se pierde: es entrega "como máximo una vez". Sirve para datos que se pueden perder, como métricas aproximadas. Para emails, pagos o pedidos se prefiere confirmar después y tolerar duplicados con un consumidor idempotente.
