---
title: ¿Qué forma de inyección de dependencias recomienda en general el equipo de Spring para las dependencias obligatorias?
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [jr, ssr]
fundamentals: true
concepts: [spring-beans]
options:
  - id: a
    text: Inyección por constructor
  - id: b
    text: Inyección por setter
  - id: c
    text: "@Autowired sobre campos"
  - id: d
    text: Buscar el bean en el ApplicationContext cuando se necesita
answer: a
---

La respuesta es **inyección por constructor**: si la clase no puede funcionar sin una dependencia, pedirla en el constructor hace imposible crear el objeto sin ella.

```java
@Service
public class InvoiceService {

  private final InvoiceRepository repository; // final: se asigna una vez y no cambia

  // Un solo constructor: Spring lo usa sin necesidad de @Autowired.
  public InvoiceService(InvoiceRepository repository) {
    this.repository = repository;
  }
}
```

**Por qué:** la documentación de Spring da tres razones.

- **Inmutable**: el campo es `final`, así que nadie puede reemplazar ni borrar la dependencia después de crear el objeto.
- **Nunca `null`**: si no existe un bean `InvoiceRepository`, Spring no puede llamar al constructor y la app falla **al arrancar**, no en medio de una petición.
- **Completo desde el inicio**: quien recibe el `InvoiceService` lo recibe listo para usar, sin pasos pendientes.

**La consecuencia práctica:** en un test puedes crear la clase con `new` y pasarle un doble de prueba, sin levantar Spring:

```java
InvoiceService service = new InvoiceService(new InMemoryInvoiceRepository());
```

Además, si el constructor empieza a tener muchos parámetros, es una señal visible de que la clase hace demasiado.

**Las otras opciones:**

- **Setter**: el objeto existe un momento sin la dependencia y el campo no puede ser `final`. Spring la reserva para dependencias **opcionales** con un valor por defecto razonable.
- **`@Autowired` sobre campos**: el campo no puede ser `final` y, en un test sin Spring, no hay forma de asignarlo salvo con reflexión.
- **Buscar en el `ApplicationContext`**: es lo contrario de inyectar; la clase queda atada a Spring y oculta qué necesita, lo que también complica los tests.
