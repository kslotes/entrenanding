---
title: Un método de un bean llama a otro método @Transactional de la misma clase (this.save()). Con la configuración por defecto, ¿qué pasa con la transacción?
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [ssr, sr]
fundamentals: true
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

**No se abre ninguna transacción por esa llamada**. Por defecto, `@Transactional` funciona con un proxy (modo `proxy`): solo intercepta las llamadas que llegan desde afuera a través del proxy. Una llamada interna (`this.save()`) va directo al objeto y saltea el proxy, aunque el método tenga la anotación.

Formas de resolverlo:

- Mover el método transaccional a otro bean e inyectarlo.
- Usar el modo `aspectj` con weaving, que modifica el bytecode de la clase en lugar de usar un proxy.
