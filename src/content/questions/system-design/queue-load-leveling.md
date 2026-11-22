---
title: El registro de usuarios manda el email de bienvenida en la misma petición, y en los picos el proveedor de email limita las llamadas y los registros fallan. ¿Qué aporta poner una cola en el medio?
type: multiple-choice
category: system-design
stack: []
seniority: [jr, ssr]
fundamentals: true
concepts: [message-queues]
options:
  - id: a
    text: Hace que el proveedor de email envíe más rápido
  - id: b
    text: Garantiza que cada email se envíe exactamente una vez
  - id: c
    text: El registro responde sin esperar al email, y un consumidor envía los emails al ritmo que el proveedor tolera
  - id: d
    text: Elimina la necesidad de reintentar cuando el proveedor falla
answer: c
---

La respuesta es **c**: con una cola, el registro solo publica un mensaje y responde. Los picos se acumulan como mensajes en espera, y un consumidor los procesa a su ritmo.

```java
@PostMapping("/signup")
public void signup(@RequestBody SignupRequest request) {
  User user = users.save(request.toUser());
  queue.publish(new WelcomeEmail(user.id())); // milisegundos: no espera al proveedor
}
```

**Por qué funciona:** la cola actúa como un amortiguador entre una carga variable y un servicio que procesa a ritmo constante (el patrón _Queue-Based Load Leveling_). Si el proveedor está caído o lento, los mensajes esperan y el registro sigue funcionando.

**La consecuencia práctica:** un problema del email deja de tumbar el registro. A cambio, el email sale unos segundos después, y conviene vigilar el tamaño de la cola para agregar consumidores si crece.

**Las otras opciones:**

- `a`: el proveedor envía igual de rápido; lo que cambia es que ya no recibe más de lo que soporta.
- `b`: la mayoría de las colas entregan "al menos una vez"; un mensaje puede repetirse.
- `d`: los fallos siguen existiendo; la diferencia es que el mensaje queda en la cola y se reentrega en lugar de perder el registro.
