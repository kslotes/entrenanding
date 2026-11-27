---
title: Servicios sin estado y escalado horizontal
stack: []
references:
  - title: "The Twelve-Factor App: VI. Processes"
    url: https://12factor.net/processes
  - title: "NGINX: Using nginx as HTTP load balancer"
    url: https://nginx.org/en/docs/http/load_balancing.html
  - title: "AWS Elastic Load Balancing: Sticky sessions for Application Load Balancer"
    url: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html
  - title: "Spring Session reference"
    url: https://docs.spring.io/spring-session/reference/
  - title: "RFC 6265: HTTP State Management Mechanism (cookies)"
    url: https://www.rfc-editor.org/rfc/rfc6265.html
---

## El problema: el carrito que aparece y desaparece

Tu tienda funciona bien con un servidor. Llega el Black Friday y levantas tres copias de la aplicación detrás de un balanceador. Desde ese momento, los clientes se quejan: agregan un producto, recargan la página y el carrito está vacío; recargan otra vez y el producto vuelve.

```java
@PostMapping("/cart/items")
public void add(@RequestBody Item item, HttpSession session) {
  List<Item> cart = (List<Item>) session.getAttribute("cart"); // la sesión vive en la memoria de ESTE servidor
  cart.add(item);
}
```

La sesión se guardó en la memoria del servidor 1. La siguiente petición la atendió el servidor 2, que no tiene esa sesión. El código no cambió: cambió la cantidad de servidores.

## Primero, los términos

- **Estado**: datos que la aplicación recuerda entre una petición y otra, como el carrito o quién inició sesión.
- **Sesión**: el estado de un usuario concreto durante su visita. El navegador guarda solo un identificador en una **cookie** (por ejemplo `JSESSIONID=abc123`) y lo envía en cada petición; los datos quedan del lado del servidor.
- **Instancia**: cada copia de la aplicación corriendo, cada una con su propia memoria.
- **Escalado vertical**: darle más CPU y memoria a un solo servidor. Tiene un techo y un único punto de falla.
- **Escalado horizontal**: agregar más instancias iguales y repartir el tráfico entre ellas.
- **Balanceador de carga**: el componente que recibe las peticiones y elige a qué instancia mandarlas.
- **Round-robin**: el reparto por turnos, 1, 2, 3, 1, 2, 3... Es el método por defecto de NGINX.
- **Servicio sin estado** (_stateless_): una instancia que no guarda en su memoria nada que la próxima petición necesite. Cualquier instancia puede atender cualquier petición.
- **Almacén compartido** (_backing service_): un servicio externo al que acceden todas las instancias, como Redis o la base de datos.

## Por qué falla: cada instancia tiene su propia memoria

```text
petición 1 (agregar libro)  -> servidor 1  -> guarda cart=[libro] en SU memoria
petición 2 (ver carrito)    -> servidor 2  -> no conoce la sesión abc123 -> carrito vacío
petición 3 (ver carrito)    -> servidor 3  -> tampoco
petición 4 (ver carrito)    -> servidor 1  -> cart=[libro]
```

Lo mismo pasa cuando una instancia se reinicia o el autoescalado la apaga: todo lo que tenía en memoria se pierde.

## La solución: sacar el estado de la instancia

The Twelve-Factor App lo dice así: los procesos son **sin estado y no comparten nada**; cualquier dato que deba persistir va a un servicio con estado, normalmente una base de datos. La sesión se muda a un almacén al que acceden todas las instancias:

```text
navegador --cookie SESSION=abc123--> balanceador --> cualquier instancia --> Redis: session abc123 = {cart: [libro]}
```

En Spring no cambias el controlador: Spring Session reemplaza la implementación de `HttpSession` por una que lee y escribe en un almacén compartido, por ejemplo Redis. El `session.getAttribute("cart")` de arriba ahora devuelve el mismo carrito en las tres instancias.

Otra opción es que el cliente lleve el estado: un token firmado (como un JWT) con los datos de identidad. El servidor verifica la firma sin buscar nada en memoria. Sirve para la identidad, no para un carrito que cambia a cada rato.

### Lo que ganas

- **Escalas agregando instancias**, sin coordinarlas entre sí.
- **Una instancia que cae no se lleva datos**: el balanceador manda el tráfico a las demás y la sesión sigue en Redis.
- **Despliegues sin cortar sesiones**: puedes reemplazar instancias una por una.

## ¿Y las sticky sessions?

Los balanceadores ofrecen **afinidad de sesión** (_sticky sessions_): mandan siempre al mismo usuario a la misma instancia, usando una cookie del balanceador o el hash de la IP (`ip_hash` en NGINX). Arregla el síntoma, pero:

- Si esa instancia cae o se reinicia, el usuario pierde la sesión igual.
- El reparto se desequilibra: una instancia puede quedar con los usuarios más activos.
- Al agregar instancias nuevas, los usuarios existentes siguen pegados a las viejas.

Twelve-Factor las considera una violación del modelo y recomienda guardar la sesión en un almacén con expiración, como Memcached o Redis. Son un parche aceptable para una aplicación vieja que no puedes cambiar ya, no un diseño.

## En la entrevista

### ¿Qué significa que un servicio sea sin estado?

Que una instancia no guarda en su memoria nada que necesite la próxima petición. El estado (sesiones, carritos, archivos subidos) vive en servicios compartidos como Redis, la base de datos o un almacenamiento de objetos. Así cualquier instancia puede atender cualquier petición, y agregar o quitar instancias no rompe nada.

### Tienes tres instancias con round-robin y los usuarios pierden la sesión al azar. ¿Qué pasa y cómo lo arreglas?

La sesión se guarda en la memoria de la instancia que atendió la primera petición, y round-robin manda la siguiente a otra instancia que no la conoce. Se arregla moviendo la sesión a un almacén compartido, como Redis con Spring Session. Las sticky sessions también lo "arreglan", pero el usuario pierde la sesión si su instancia cae y el tráfico se reparte peor.

### ¿Qué diferencia hay entre escalar vertical y horizontalmente?

Vertical es un servidor más grande: simple, pero con un techo de hardware y un único punto de falla. Horizontal es agregar más instancias iguales detrás de un balanceador: no tiene ese techo y tolera fallas, pero exige que las instancias sean sin estado.
