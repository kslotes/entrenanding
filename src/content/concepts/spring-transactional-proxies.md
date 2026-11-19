---
title: Proxies de Spring y @Transactional
stack: [java, spring]
references:
  - title: "Spring Framework: Proxying Mechanisms"
    url: https://docs.spring.io/spring-framework/reference/core/aop/proxying.html
  - title: "Spring Framework: Using @Transactional"
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
  - title: "Spring Framework: Understanding the Declarative Transaction Implementation"
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html
  - title: "Spring Framework: Rolling Back a Declarative Transaction"
    url: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html
  - title: "Spring Boot: Aspect-Oriented Programming"
    url: https://docs.spring.io/spring-boot/reference/features/aop.html
  - title: "java.lang.reflect.Proxy (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html
---

## El problema que resuelve

Una **transacción** es un grupo de operaciones sobre la base de datos que se aplican todas juntas o ninguna. Si transfieres dinero, restar de una cuenta y sumar a la otra tiene que pasar en bloque: si la segunda operación falla, la primera debe deshacerse (**rollback**). Si todo sale bien, se confirma (**commit**).

Sin ayuda, cada método que necesita una transacción repite el mismo código alrededor de la lógica de negocio:

```java
public void transfer(long from, long to, BigDecimal amount) throws SQLException {
  Connection connection = dataSource.getConnection();
  try {
    connection.setAutoCommit(false);           // empezar la transacción
    accounts.withdraw(connection, from, amount);
    accounts.deposit(connection, to, amount);
    connection.commit();                       // todo bien: confirmar
  } catch (Exception e) {
    connection.rollback();                     // algo falló: deshacer todo
    throw e;
  } finally {
    connection.close();
  }
}
```

Con `@Transactional` escribes solo la lógica, y Spring agrega el resto por ti:

```java
@Transactional
public void transfer(long from, long to, BigDecimal amount) {
  accounts.withdraw(from, amount);
  accounts.deposit(to, amount);
}
```

La pregunta importante es **cómo** agrega Spring ese código sin tocar tu clase. La respuesta es un proxy, y entenderlo explica todos los casos en los que `@Transactional` "no funciona".

## Qué es un proxy

Un **proxy** es un objeto que se hace pasar por otro: tiene los mismos métodos, recibe las llamadas, hace algo antes o después y delega en el objeto real, al que se llama **target**. Es como una recepcionista: atiende a quien llega desde la calle y lo pasa con la persona que corresponde.

El JDK trae proxies dinámicos (`java.lang.reflect.Proxy`). Este ejemplo agrega un log antes de cada llamada:

```java
interface Greeter {
  String greet(String name);

  String greetTwice(String name);
}

class SimpleGreeter implements Greeter {
  public String greet(String name) {
    return "Hola, " + name;
  }

  public String greetTwice(String name) {
    return greet(name) + " / " + this.greet(name);
  }
}

Greeter target = new SimpleGreeter();
InvocationHandler logging = (proxy, method, methodArgs) -> {
  System.out.println("[proxy] antes de " + method.getName());
  return method.invoke(target, methodArgs);
};
Greeter proxy = (Greeter) Proxy.newProxyInstance(
    Greeter.class.getClassLoader(), new Class<?>[] {Greeter.class}, logging);

proxy.greet("Ana");       // [proxy] antes de greet
proxy.greetTwice("Luis"); // [proxy] antes de greetTwice  (una sola vez)
```

Fíjate en `greetTwice`: el proxy intercepta la llamada que llega desde afuera, pero las dos llamadas internas a `greet` se hacen sobre `this`, que es el target. El proxy no se entera de ellas. Volviendo a la analogía: si alguien que ya está dentro de la oficina habla con un compañero, la recepcionista no participa.

## Cómo crea Spring los proxies

**AOP** (programación orientada a aspectos) es la técnica de agregar comportamiento común, como transacciones, seguridad o logs, sin escribirlo en cada método. Ese comportamiento agregado se llama **advice**. Spring AOP lo implementa envolviendo tu bean en un proxy: los demás beans reciben el proxy inyectado, no tu objeto, y por eso el proxy puede ejecutar el advice antes de delegar.

```java
@RestController
public class TransferController {

  private final TransferService service; // en realidad es el proxy de TransferService

  public TransferController(TransferService service) {
    this.service = service;
    System.out.println(service.getClass()); // TransferService$$SpringCGLIB$$0
  }
}
```

Spring usa dos tipos de proxy:

- **Proxy dinámico del JDK**: si el target implementa al menos una interfaz. El proxy implementa esa interfaz.
- **CGLIB**: una librería que genera en tiempo de ejecución una **subclase** del target y sobrescribe sus métodos. Spring la usa si el target no implementa interfaces. Spring Boot la usa por defecto en todos los casos (`spring.aop.proxy-target-class=true`).

Como CGLIB funciona por herencia, solo puede interceptar lo que una subclase puede sobrescribir: no sirve con clases `final`, métodos `final` ni métodos `private`.

## Cómo funciona @Transactional

El soporte de transacciones se basa en ese proxy, con un `TransactionInterceptor` que rodea cada llamada. Cuando el controller llama a `service.transfer(...)`:

```
TransferController -> proxy.transfer()
  proxy:  abre la transacción
  proxy:  target.transfer()          <- tu código
  proxy:  commit (o rollback si salió una excepción)
```

Todo depende de que la llamada **pase por el proxy**. De ahí salen todas sus reglas.

### La auto-invocación no abre transacción

Una **auto-invocación** es cuando un método de un bean llama a otro método del mismo bean (`this.algo()`, escrito o implícito). Esa llamada ocurre dentro del target y no pasa por el proxy, así que la anotación se ignora.

Un caso típico es una importación por lotes donde quieres que cada fila tenga su propia transacción, para que una fila con errores no deshaga las demás:

```java
@Service
public class CustomerImportService {

  public void importAll(List<CustomerRow> rows) {
    for (CustomerRow row : rows) {
      importOne(row); // this.importOne(): no pasa por el proxy, NO hay transacción
    }
  }

  @Transactional
  public void importOne(CustomerRow row) {
    customers.save(row.toCustomer());
    addresses.save(row.toAddress()); // si falla, el customer ya quedó guardado
  }
}
```

Sin transacción, cada `save` se confirma por separado. Si la dirección falla, el cliente queda guardado sin dirección: exactamente lo que `@Transactional` debía evitar. Y no hay ningún error ni advertencia.

Si `importAll` también tuviera `@Transactional`, `importOne` correría dentro de esa única transacción externa: una fila con errores desharía la importación completa, y una configuración como `@Transactional(propagation = REQUIRES_NEW)` en `importOne` tampoco tendría efecto.

La solución que prefiere la documentación es reorganizar el código para que la llamada venga desde otro bean:

```java
@Service
public class CustomerImportService {

  private final CustomerRowImporter importer; // otro bean: llega su proxy

  public CustomerImportService(CustomerRowImporter importer) {
    this.importer = importer;
  }

  public void importAll(List<CustomerRow> rows) {
    for (CustomerRow row : rows) {
      importer.importOne(row); // pasa por el proxy: una transacción por fila
    }
  }
}

@Service
public class CustomerRowImporter {

  @Transactional
  public void importOne(CustomerRow row) {
    customers.save(row.toCustomer());
    addresses.save(row.toAddress());
  }
}
```

Otras salidas que menciona la documentación: inyectar el propio bean (_self injection_) y llamar a través de él, o `AopContext.currentProxy()`, que desaconseja porque ata tu clase a Spring AOP. También puedes usar el modo `aspectj`, que no usa proxy: modifica el bytecode de la clase (esto se llama **weaving**), así que también intercepta las llamadas internas.

### Otras reglas que salen del proxy

- **Visibilidad**: lo habitual son métodos `public`. Desde Spring 6.0, los proxies CGLIB también aceptan métodos `protected` o de paquete. Con proxies del JDK, el método debe ser `public` y estar en la interfaz. Los métodos `private` nunca se interceptan.
- **Inicialización**: en un `@PostConstruct` el proxy todavía no está listo, así que no conviene depender de una transacción ahí.
- **Hilos**: la transacción está ligada al hilo actual. Si dentro del método lanzas trabajo en otro hilo (por ejemplo, con `CompletableFuture.runAsync`), ese trabajo queda fuera de la transacción.

## Cuándo hace rollback

En Java hay dos tipos de excepción. Una **checked exception** (como `IOException`) es la que el compilador te obliga a declarar con `throws` o a capturar. Una **unchecked exception** es una `RuntimeException` o sus subclases (como `IllegalStateException`), y el compilador no exige nada.

Por defecto, Spring hace rollback solo ante `RuntimeException` y `Error`. Si sale una checked exception, **hace commit** de lo que se haya escrito hasta ese momento:

```java
@Transactional
public void charge(Order order) throws PaymentDeclinedException {
  orders.markAsPaid(order);           // se escribe en la base
  paymentGateway.charge(order);       // lanza PaymentDeclinedException (checked)
}
// Resultado: commit. La orden queda como pagada aunque el cobro falló.
```

La lógica de Spring es que una checked exception suele representar un resultado de negocio esperado que el que llama puede manejar, no un fallo del sistema. Si para ti sí es un fallo, dilo explícitamente con `rollbackFor` (y `noRollbackFor` para el caso contrario):

```java
@Transactional(rollbackFor = PaymentDeclinedException.class)
public void charge(Order order) throws PaymentDeclinedException {
  // ahora PaymentDeclinedException también provoca rollback
}
```

## En la entrevista

### ¿Qué tipos de proxy usa Spring y cuándo usa cada uno?

Usa un **proxy dinámico del JDK** cuando el bean implementa al menos una interfaz; el proxy implementa esa interfaz, así que solo intercepta los métodos que estén en ella. Si no hay interfaz, usa **CGLIB**, que genera una subclase del bean. Spring Boot fuerza CGLIB por defecto (`spring.aop.proxy-target-class=true`), así que en una app Boot lo normal es ver clases como `TransferService$$SpringCGLIB$$0`. En ambos casos el proxy solo ve las llamadas que llegan desde afuera.

### ¿Por qué un método `final` o `private` no puede tener advice con CGLIB?

Porque CGLIB funciona por herencia: el proxy es una subclase que **sobrescribe** cada método para agregar el advice y luego llamar al original. Java no permite sobrescribir un método `final` ni un método `private`, así que el proxy no puede meterse en medio. La llamada se ejecuta sin transacción y sin aviso:

```java
@Service
public class InvoiceService {

  @Transactional
  public final void close(Invoice invoice) { // final: CGLIB no puede sobrescribirlo
    // corre sin transacción
  }
}
```

### ¿Qué excepciones provocan rollback por defecto?

Solo las unchecked: `RuntimeException`, sus subclases y `Error`. Una checked exception provoca **commit** de lo que se haya escrito. Para que una checked también haga rollback se usa `@Transactional(rollbackFor = MiExcepcion.class)`. Por eso, si tu dominio usa checked exceptions para fallos reales, tienes que declararlas en `rollbackFor`, o los datos quedarán a medio guardar.
