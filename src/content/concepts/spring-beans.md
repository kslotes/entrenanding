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
  - title: "Spring Framework: Method Injection"
    url: https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-method-injection.html
  - title: "Spring Framework: Classpath Scanning and Managed Components"
    url: https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html
---

## El problema que resuelve

Imagina un controller que necesita un servicio, que a su vez necesita un repositorio. Sin Spring, alguien tiene que crear todo a mano y en el orden correcto:

```java
DataSource dataSource = new HikariDataSource(config);
InvoiceRepository repository = new InvoiceRepository(dataSource);
TaxCalculator taxCalculator = new TaxCalculator();
InvoiceService service = new InvoiceService(repository, taxCalculator);
InvoiceController controller = new InvoiceController(service);
```

Con diez clases es tedioso; con cien es inmanejable. Spring se encarga de esa tarea: tú declaras qué clases participan y qué necesita cada una, y el contenedor las crea y las conecta.

## Qué es un bean

Un **bean** es un objeto que crea, configura y administra el contenedor de Spring (el `ApplicationContext`). Describes cada bean con una **definición**: una clase anotada con `@Component` (o sus variantes `@Service`, `@Repository`, `@RestController`), un método `@Bean` o XML.

**Inyección de dependencias** significa que el objeto no crea ni busca a sus colaboradores: los recibe desde afuera.

```java
@Service
public class InvoiceService {

  private final InvoiceRepository repository;
  private final TaxCalculator taxCalculator;

  // Spring ve este constructor, busca un bean InvoiceRepository y uno
  // TaxCalculator, y los pasa como argumentos al crear InvoiceService.
  public InvoiceService(InvoiceRepository repository, TaxCalculator taxCalculator) {
    this.repository = repository;
    this.taxCalculator = taxCalculator;
  }
}
```

## Formas de inyectar

| Forma       | Cómo llega la dependencia                         | Qué permite                                                      |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| Constructor | Como argumento del constructor.                   | Campos `final` y un objeto que llega completamente inicializado. |
| Setter      | Spring llama a un `setX(...)` después de crearlo. | Reconfigurar o volver a inyectar la dependencia más tarde.       |
| Campo       | `@Autowired` directamente sobre el campo.         | Menos código, pero el campo no puede ser `final`.                |

Si la clase tiene **un solo constructor**, no hace falta `@Autowired`: Spring lo usa. Si tiene varios y ninguno es el primario o por defecto, al menos uno debe llevar `@Autowired` para indicar cuál usar.

Según la documentación, la inyección por setter conviene para dependencias opcionales que tienen un valor por defecto razonable; si no, hay que comprobar `null` en cada lugar donde se usan. También advierte que un constructor con muchos argumentos es una señal de que la clase tiene demasiadas responsabilidades.

### Dependencias circulares

Si `A` recibe `B` por constructor y `B` recibe `A` por constructor, ninguno puede crearse primero. El contenedor lo detecta al arrancar y lanza `BeanCurrentlyInCreationException`. La documentación menciona inyectar alguna de las dos por setter como salida, aunque aclara que no es lo recomendado: lo habitual es rediseñar para romper el ciclo.

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

### Por qué singleton es el valor por defecto

Mira qué clases suelen ser beans: servicios, repositorios, controllers. Son **trabajadores**: reciben datos por parámetro, hacen algo y devuelven un resultado. No necesitan recordar nada entre una llamada y otra, así que una sola instancia alcanza para todos.

Crear una instancia nueva en cada uso gastaría memoria y trabajo del garbage collector sin ningún beneficio. Además, el `ApplicationContext` crea los singletons **al arrancar la aplicación**: si una dependencia falta o está mal configurada, la app falla al iniciar y no en medio de una petición en producción.

Puedes comprobar que todos reciben el mismo objeto:

```java
@SpringBootTest
class SingletonScopeTest {

  @Autowired ApplicationContext context;

  @Test
  void returnsTheSameInstanceEveryTime() {
    InvoiceService first = context.getBean(InvoiceService.class);
    InvoiceService second = context.getBean(InvoiceService.class);

    assertSame(first, second); // misma referencia en memoria
  }
}
```

### Sin estado y seguro para hilos

Como el singleton es un único objeto compartido, hay que entender dos ideas.

**Sin estado (stateless)** significa que el objeto no tiene campos que cambien según quién lo use. `InvoiceService` es stateless: sus únicos campos son dependencias `final` que nunca cambian después de crearlo. Todo lo que varía en cada llamada llega por parámetro.

**Seguro para hilos (thread-safe)** significa que el objeto funciona bien aunque varios hilos lo usen al mismo tiempo. Esto importa porque en una aplicación web el servidor (por ejemplo, Tomcat) atiende **cada petición HTTP en un hilo distinto, en paralelo**, y todos esos hilos usan la misma instancia del singleton.

Este servicio tiene estado, y por eso tiene un bug:

```java
@Service
public class CheckoutService {

  private String currentUser; // estado: cambia según quién llame

  public void checkout(String user, Cart cart) {
    this.currentUser = user;
    Order order = createOrder(cart); // tarda unos milisegundos
    paymentGateway.charge(this.currentUser, order.total());
  }
}
```

Si Ana y Beto compran al mismo tiempo:

```
Hilo de Ana:  currentUser = "ana"
Hilo de Beto: currentUser = "beto"            <- pisa el valor de Ana
Hilo de Ana:  charge("beto", totalDeAna)      <- le cobra a Beto la compra de Ana
```

La solución más simple es no guardar estado: usar parámetros y variables locales. Cada hilo tiene su propia copia de las variables locales, así que nadie las comparte.

```java
public void checkout(String user, Cart cart) {
  Order order = createOrder(cart);
  paymentGateway.charge(user, order.total()); // nada compartido
}
```

Cuando el estado compartido es intencional (por ejemplo, un contador global de peticiones), usa tipos preparados para concurrencia como `AtomicInteger` o `ConcurrentHashMap`, en lugar de un `int` o un `HashMap`:

```java
@Service
public class RequestCounter {

  private final AtomicInteger count = new AtomicInteger();

  public int increment() {
    return count.incrementAndGet(); // operación atómica, segura entre hilos
  }
}
```

Si lo que necesitas es estado propio de cada usuario o de cada petición, ese es justamente el caso de los scopes `session`, `request` o `prototype`.

### El singleton de Spring no es el patrón Singleton

El patrón Singleton (GoF) garantiza una instancia por `ClassLoader`, normalmente con un constructor privado y un `getInstance()` estático. El singleton de Spring garantiza una instancia **por contenedor y por definición de bean**; la clase es una clase normal. Por eso puedes tener dos beans singleton de la misma clase:

```java
@Configuration
public class DataSourceConfig {

  @Bean
  public DataSource ordersDataSource() {
    return new HikariDataSource(ordersConfig());
  }

  @Bean
  public DataSource reportsDataSource() {
    return new HikariDataSource(reportsConfig());
  }
}
```

Hay dos definiciones, así que hay dos instancias de `HikariDataSource`, cada una singleton dentro de su definición.

### Un prototype dentro de un singleton

Las dependencias de un singleton se resuelven **una sola vez**, cuando se crea el singleton. Si le inyectas un bean prototype, recibe una instancia al arrancar y la conserva para siempre:

```java
@Service
public class ReportService {

  private final ReportBuilder builder; // prototype, pero se inyecta una sola vez

  public ReportService(ReportBuilder builder) {
    this.builder = builder;
  }

  public Report generate() {
    return builder.build(); // siempre la misma instancia de ReportBuilder
  }
}
```

Si necesitas una instancia nueva en cada uso, la documentación remite a _method injection_. Una forma habitual es inyectar un `ObjectProvider` y pedir el bean cada vez:

```java
@Service
public class ReportService {

  private final ObjectProvider<ReportBuilder> builders;

  public ReportService(ObjectProvider<ReportBuilder> builders) {
    this.builders = builders;
  }

  public Report generate() {
    return builders.getObject().build(); // nueva instancia en cada llamada
  }
}
```

Además, Spring no llama a los callbacks de destrucción de los beans prototype: liberar sus recursos es responsabilidad de quien los usa.

## En la entrevista

### ¿Qué ventajas tiene recibir las dependencias por constructor?

- **Campos `final`**: la dependencia no puede cambiarse ni quedar en `null` después de crear el objeto.
- **Objeto completo desde el inicio**: si falta una dependencia, Spring no puede crear el bean y la app falla al arrancar, no al usarlo.
- **Tests sin Spring**: puedes crear la clase con `new` y pasarle dobles de prueba.
- **Señal de diseño**: un constructor con muchos parámetros hace visible que la clase hace demasiado.

```java
@Test
void calculatesTotalWithTaxes() {
  TaxCalculator taxes = invoice -> new BigDecimal("21.00");
  InvoiceService service = new InvoiceService(new InMemoryInvoiceRepository(), taxes);

  assertEquals(new BigDecimal("121.00"), service.total(invoiceOf("100.00")));
}
```

Con inyección por campo (`@Autowired private TaxCalculator taxCalculator;`) no hay forma de pasar la dependencia sin levantar Spring o usar reflexión.

### ¿Qué diferencia hay entre el singleton de Spring y el patrón Singleton?

El patrón Singleton lo garantiza la propia clase (constructor privado y `getInstance()`), y hay una instancia por `ClassLoader`. El singleton de Spring lo garantiza el contenedor: la clase es normal, hay una instancia por contenedor y por definición de bean, y puedes tener varias definiciones de la misma clase (como los dos `DataSource` de arriba). Además, la clase de Spring se puede instanciar con `new` en un test; la del patrón no.

### ¿Qué pasa si inyectas un bean prototype en uno singleton?

El singleton recibe **una única instancia** del prototype al crearse y la usa para siempre, así que en la práctica el prototype se comporta como singleton dentro de ese bean. Si necesitas una instancia nueva en cada uso, inyecta un `ObjectProvider<T>` (o usa `@Lookup`) y pide el bean cada vez que lo necesites, como en el ejemplo de `ReportService`.
