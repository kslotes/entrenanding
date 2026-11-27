---
title: Teorema CAP (consistencia, disponibilidad y particiones)
stack: []
references:
  - title: "Gilbert and Lynch: Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (2002)"
    url: https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf
  - title: "Gilbert and Lynch: Perspectives on the CAP Theorem (2012)"
    url: https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf
  - title: "Eric Brewer: CAP Twelve Years Later: How the Rules Have Changed"
    url: https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/
  - title: "Amazon DynamoDB: Read consistency"
    url: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
---

## El problema: dos centros de datos que dejan de hablarse

Tu sistema de inventario corre en dos centros de datos, uno en Buenos Aires y otro en Madrid, y cada uno tiene una copia de los datos. Queda **un** libro en stock. De pronto se corta el enlace entre los dos: cada lado sigue funcionando, pero no puede avisarle al otro qué cambió.

```text
Buenos Aires                    Madrid
stock = 1         ✗ enlace ✗    stock = 1
cliente A: "comprar"            cliente B: "comprar"
```

Si los dos lados aceptan la compra, vendiste dos libros que no tienes. Si alguno se niega a responder hasta que vuelva el enlace, ese cliente ve un error. No hay una tercera salida: es justo lo que dice el teorema CAP.

## Primero, los términos

- **Sistema distribuido**: varios servidores que guardan y sirven los mismos datos y se comunican por la red.
- **Nodo**: cada uno de esos servidores.
- **Partición de red**: un corte que separa los nodos en grupos que no pueden comunicarse. Los nodos siguen vivos; lo que falla es la red entre ellos.
- **Consistencia** (la C de CAP): todas las lecturas ven la escritura más reciente, como si hubiera una sola copia de los datos. Es una garantía fuerte, llamada **linealizabilidad** o consistencia atómica.
- **Disponibilidad** (la A, de _availability_): todo nodo que no falló responde a cada petición, sin error.
- **Tolerancia a particiones** (la P): el sistema sigue funcionando aunque la red pierda mensajes entre nodos.
- **Consistencia eventual**: si dejan de llegar escrituras, todas las copias terminan iguales, pero mientras tanto una lectura puede ver un dato viejo.

## Lo que dice el teorema

Gilbert y Lynch demostraron en 2002 la conjetura de Brewer: en una red que puede perder mensajes, **es imposible** garantizar a la vez consistencia y disponibilidad. La idea de la prueba es la del ejemplo: si un nodo no recibe noticias del otro lado, no puede distinguir "nadie escribió" de "escribieron y el mensaje se perdió". O responde con lo que tiene (disponible, quizá inconsistente) o espera (consistente, no disponible).

### Por qué "elige 2 de 3" confunde

La frase popular es "de C, A y P, elige dos". Brewer mismo escribió doce años después que esa formulación **siempre fue engañosa**. En un sistema distribuido real las particiones pasan (cables, switches, nubes), así que P no es opcional. La pregunta real es:

> **Cuando hay una partición, ¿prefieres consistencia o disponibilidad?**

Y cuando no hay partición, que es casi siempre, no hay que renunciar a ninguna de las dos.

## CP o AP: qué hace cada uno durante la partición

**CP (consistencia primero):** el lado que no puede confirmar con la mayoría rechaza la operación.

```java
public void buy(long bookId) {
  if (!cluster.hasQuorum()) {                       // ¿puedo hablar con la mayoría de los nodos?
    throw new ServiceUnavailableException("try again later"); // prefiero fallar antes que vender de más
  }
  inventory.decrementOrFail(bookId);
}
```

Encaja con dinero, stock, reservas: un error temporal es mejor que un dato incorrecto.

**AP (disponibilidad primero):** cada lado acepta la operación con su copia local y, cuando vuelve la red, las copias se reconcilian.

```java
public void addToCart(long userId, long bookId) {
  localReplica.addToCart(userId, bookId); // responde siempre; se sincroniza después
}
```

Encaja con un carrito, un contador de "me gusta" o un feed: es mejor aceptar y reconciliar después (unir los dos carritos) que mostrar un error. Brewer insiste en ese último paso: un sistema AP necesita un plan para **recuperarse** de la partición, detectando y resolviendo los conflictos.

Muchas bases te dejan elegir por operación. DynamoDB, por ejemplo, ofrece lecturas eventualmente consistentes (por defecto) y lecturas fuertemente consistentes.

## En la entrevista

### ¿Qué dice el teorema CAP?

Que un sistema distribuido no puede garantizar a la vez consistencia (todas las lecturas ven la última escritura) y disponibilidad (todo nodo vivo responde) cuando hay una partición de red. Como las particiones son inevitables, la decisión real es qué sacrificar durante una partición: rechazar peticiones para no dar datos incorrectos (CP) o responder con datos posiblemente viejos y reconciliar después (AP).

### ¿Puedo tener un sistema CA?

Solo si no hay partición posible, es decir, un solo nodo o una red que nunca falla. En cuanto hay varios nodos comunicándose por una red real, las particiones pasan y el sistema tiene que elegir entre C y A en ese momento. Por eso "elige 2 de 3" confunde: P no es una opción que se descarta.

### ¿Cuándo elegirías CP y cuándo AP?

CP cuando un dato incorrecto es peor que un error: saldos, stock, reservas de asientos. AP cuando responder siempre es más valioso que la exactitud inmediata y los conflictos se pueden reconciliar: carritos, contadores, feeds. En un mismo sistema puedes usar cada uno para distintas operaciones.
