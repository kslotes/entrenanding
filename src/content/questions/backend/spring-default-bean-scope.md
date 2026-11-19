---
title: ¿Qué scope usa Spring por defecto para sus beans?
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [jr, ssr]
fundamentals: true
concepts: [spring-beans]
options:
  - id: a
    text: singleton
  - id: b
    text: prototype
  - id: c
    text: request
  - id: d
    text: session
answer: a
---

El scope por defecto es **singleton**: el contenedor crea **una única instancia** por cada definición de bean y entrega ese mismo objeto a todos los que lo inyectan.

```java
@Service
public class InvoiceService { /* ... */ }

@RestController
public class InvoiceController {
  public InvoiceController(InvoiceService service) { /* ... */ }
}

@Component
public class InvoiceReminderJob {
  public InvoiceReminderJob(InvoiceService service) { /* ... */ }
}
// El controller y el job reciben exactamente el mismo objeto InvoiceService.
```

**Por qué es el valor por defecto:** los beans típicos (servicios, repositorios, controllers) no guardan datos de cada llamada; reciben todo por parámetro. Una sola instancia alcanza, ahorra memoria y se crea al arrancar la app, así que una configuración rota falla al iniciar y no en producción.

**La consecuencia práctica:** en una app web cada petición HTTP corre en un hilo distinto, y todos los hilos usan ese mismo objeto a la vez. Por eso un singleton no debe guardar en sus campos datos de un usuario o de una petición:

```java
@Service
public class CheckoutService {
  private String currentUser; // mal: dos peticiones simultáneas se pisan este valor

  public void checkout(String user) {
    this.currentUser = user;
    // ...
  }
}
```

La solución es pasar esos datos por parámetro y usar variables locales, que cada hilo tiene por separado.

**Las otras opciones:**

- `prototype` crea una instancia nueva cada vez que se pide el bean.
- `request` y `session` crean una instancia por petición HTTP o por sesión, y solo existen en una aplicación web.
