---
title: Un método de un bean llama a otro método @Transactional de la misma clase (this.save()). Con la configuración por defecto, ¿qué pasa con la transacción?
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [ssr, sr]
fundamentals: true
concepts: [spring-transactional-proxies]
options:
  - id: a
    text: Se abre una transacción nueva para save()
  - id: b
    text: No se abre ninguna transacción por esa llamada
  - id: c
    text: Spring lanza una excepción al arrancar
  - id: d
    text: La transacción se abre, pero nunca hace commit
answer: b
---

**No se abre ninguna transacción por esa llamada**: `@Transactional` funciona con un proxy que envuelve al bean, y `this.save()` es una llamada interna que nunca pasa por ese proxy.

```java
@Service
public class OrderService {

  public void placeOrder(Order order) {
    validate(order);
    save(order); // this.save(): va directo al objeto, sin pasar por el proxy
  }

  @Transactional
  public void save(Order order) {
    orders.save(order);
    orderLines.saveAll(order.lines()); // si falla, la orden ya quedó guardada
  }
}
```

**Por qué:** los otros beans no reciben tu `OrderService`, sino un proxy que se hace pasar por él. Cuando un controller llama a `placeOrder`, el proxy podría abrir una transacción, pero `placeOrder` no tiene la anotación. Ya dentro del objeto real, `save` se llama sobre `this`, y el proxy no se entera: la anotación se ignora.

**La consecuencia práctica:** cada `save` del repositorio se confirma por separado. Si fallan las líneas, la orden queda guardada a medias, y Spring no avisa nada. La solución habitual es mover `save` a otro bean e inyectarlo, para que la llamada pase por su proxy.

**Las otras opciones:**

- **Transacción nueva**: eso pasaría si la llamada llegara desde otro bean, a través del proxy.
- **Excepción al arrancar**: Spring no detecta las auto-invocaciones; el fallo es silencioso.
- **Se abre sin commit**: no hay transacción abierta que pueda quedar pendiente; simplemente no se crea.
