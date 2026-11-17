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
  - title: "java.lang.reflect.Proxy (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/Proxy.html
---

## Qué es un proxy

Un **proxy** es un objeto que se hace pasar por otro: implementa la misma interfaz (o extiende la misma clase), recibe las llamadas, hace algo antes o después y delega en el objeto real (el _target_).

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

Fíjate en `greetTwice`: el proxy intercepta la llamada que llega desde afuera, pero las dos llamadas internas a `greet` se hacen sobre `this`, que es el target. El proxy no se entera de ellas.

## Cómo crea Spring los proxies

Spring AOP agrega comportamiento (_advice_) a un objeto envolviéndolo en un proxy. El código que tiene una referencia al proxy llama al proxy, y por eso el proxy puede ejecutar el advice antes de delegar en el target.

- Si el target implementa al menos una interfaz, usa un **proxy dinámico del JDK**.
- Si no, usa **CGLIB**: una subclase del target generada en tiempo de ejecución.

Como CGLIB funciona por herencia, no puede interceptar clases `final`, métodos `final` ni métodos `private`.

La documentación de AOP es explícita: una vez que la llamada llegó al target, cualquier llamada que haga sobre sí mismo (`this.algo()`, explícito o implícito) va contra `this` y no contra el proxy, así que **la auto-invocación se saltea el advice**. Sus opciones, en orden de preferencia:

1. Reorganizar el código para que no haya auto-invocación (por ejemplo, mover el método a otro bean).
2. Inyectar una referencia al propio bean (_self injection_) y llamar a través de ella.
3. `AopContext.currentProxy()`, que la documentación desaconseja porque acopla tu clase a Spring AOP.

El weaving de AspectJ (en compilación o en carga) no tiene este problema porque modifica el bytecode en lugar de usar un proxy.

## @Transactional se apoya en ese proxy

El soporte declarativo de transacciones se basa en un proxy de AOP que usa un `TransactionInterceptor` para gestionar la transacción alrededor de cada invocación. `@Transactional` funciona por defecto en **modo proxy**, y de ahí salen sus reglas:

- **Solo se interceptan las llamadas que pasan por el proxy.** Todo lo anterior sobre auto-invocación aplica igual.
- **Visibilidad**: lo habitual son métodos `public`. Desde Spring 6.0, los proxies basados en clases también aceptan métodos `protected` o de paquete; con proxies basados en interfaz, el método debe ser `public` y estar en la interfaz.
- **Inicialización**: el proxy debe estar completamente inicializado, así que no conviene depender de transacciones en un `@PostConstruct`.
- **Hilos**: la transacción habitual está ligada al hilo actual y no se propaga a hilos nuevos que inicies dentro del método.
- **Modo `aspectj`**: no hay proxy; la clase se modifica por weaving y la anotación se aplica a cualquier tipo de método.

## Cuándo hace rollback

Con la configuración por defecto, Spring marca la transacción para rollback solo ante `RuntimeException` (y sus subclases) y `Error`. Una checked exception que sale del método **no** provoca rollback. Para cambiarlo se usan `rollbackFor` y `noRollbackFor`:

```java
@Transactional(rollbackFor = PaymentDeclinedException.class)
public void charge(Order order) throws PaymentDeclinedException {
  // ...
}
```

## En la entrevista

- ¿Qué tipos de proxy usa Spring y cuándo usa cada uno?
- ¿Por qué un método `final` o `private` no puede tener advice con CGLIB?
- ¿Qué excepciones provocan rollback por defecto?
