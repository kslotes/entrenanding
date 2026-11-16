---
title: Beans, inyección de dependencias y scopes en Spring
stack: [java, spring]
references:
  - title: "Spring Framework: Dependency Injection"
    url: https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html
  - title: "Spring Framework: Using @Autowired"
    url: https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html
  - title: "Spring Framework: Bean Scopes"
    url: https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html
  - title: "Spring Framework: Classpath Scanning and Managed Components"
    url: https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html
---

## Qué es un bean

Un **bean** es un objeto que crea, configura y administra el contenedor de Spring (el `ApplicationContext`). Tú describes cada bean con una **definición** (una clase anotada con `@Component`, un método `@Bean` o XML) y el contenedor se encarga de instanciarlo y de entregarle sus dependencias. Eso es la inyección de dependencias: el objeto no busca a sus colaboradores, los recibe.

## Formas de inyectar

| Forma       | Cómo llega la dependencia                         | Qué permite                                                      |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| Constructor | Como argumento del constructor.                   | Campos `final` y un objeto que llega completamente inicializado. |
| Setter      | Spring llama a un `setX(...)` después de crearlo. | Reconfigurar o volver a inyectar la dependencia más tarde.       |

También puedes poner `@Autowired` directamente sobre un campo, e incluso mezclarlo con un constructor.

```java
@Component
public class InvoiceService {

  private final TaxCalculator taxCalculator;

  public InvoiceService(TaxCalculator taxCalculator) {
    this.taxCalculator = taxCalculator;
  }
}
```

Si la clase tiene **un solo constructor**, no hace falta `@Autowired`: Spring lo usa. Si tiene varios y ninguno es el primario o por defecto, al menos uno debe llevar `@Autowired` para indicar cuál usar.

Según la documentación, la inyección por setter conviene para dependencias que tienen un valor por defecto razonable dentro de la clase; si no, hay que comprobar `null` en cada lugar donde se usan. También advierte que un constructor con muchos argumentos es una señal de que la clase tiene demasiadas responsabilidades.

### Dependencias circulares

Si `A` recibe `B` por constructor y `B` recibe `A` por constructor, el contenedor detecta la referencia circular en tiempo de ejecución y lanza `BeanCurrentlyInCreationException`. La documentación menciona configurar alguna de las clases por setter como salida, aunque aclara que no es lo recomendado.

## Scopes

El **scope** define cuántas instancias crea el contenedor a partir de una misma definición:

| Scope         | Instancias                                                            | Dónde existe       |
| ------------- | --------------------------------------------------------------------- | ------------------ |
| `singleton`   | Una por contenedor y por definición de bean. Es el valor por defecto. | Cualquier contexto |
| `prototype`   | Una nueva cada vez que se inyecta o se pide con `getBean()`.          | Cualquier contexto |
| `request`     | Una por petición HTTP.                                                | Solo contexto web  |
| `session`     | Una por `HttpSession`.                                                | Solo contexto web  |
| `application` | Una por `ServletContext`.                                             | Solo contexto web  |
| `websocket`   | Una por WebSocket.                                                    | Solo contexto web  |

El scope se cambia con `@Scope`:

```java
@Scope("prototype")
@Component
public class ReportBuilder {
  // ...
}
```

Tres detalles que suelen preguntarse:

- **El singleton de Spring no es el patrón Singleton.** El patrón GoF garantiza una instancia por `ClassLoader`; Spring garantiza una por contenedor y por definición. Puedes tener dos beans singleton de la misma clase.
- **Un singleton es una única instancia compartida**, así que la documentación recomienda singleton para beans sin estado y prototype para beans con estado.
- **Un prototype inyectado en un singleton se resuelve una sola vez**, cuando se crea el singleton. Si necesitas una instancia nueva en cada uso, la documentación remite a _method injection_. Además, Spring no llama a los callbacks de destrucción de los beans prototype: limpiarlos es responsabilidad de quien los usa.

## En la entrevista

- ¿Qué ventajas tiene recibir las dependencias por constructor?
- ¿Qué diferencia hay entre el singleton de Spring y el patrón Singleton?
- ¿Qué pasa si inyectas un bean prototype en uno singleton?
