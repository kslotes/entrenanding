---
title: Rate limiting y el algoritmo token bucket
stack: []
references:
  - title: "Amazon API Gateway: Throttle requests to your REST APIs"
    url: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html
  - title: "NGINX: ngx_http_limit_req_module"
    url: https://nginx.org/en/docs/http/ngx_http_limit_req_module.html
  - title: "RFC 6585 4: 429 Too Many Requests"
    url: https://www.rfc-editor.org/rfc/rfc6585.html#section-4
  - title: "RFC 9110 10.2.3: Retry-After"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3
---

## El problema: un cliente que se come la API de todos

Tu API pública de cotizaciones funciona bien hasta que un cliente despliega un script con un bug: un bucle que pide la misma cotización sin pausa, miles de veces por segundo. La base se satura y **todos** los clientes reciben timeouts, no solo el que tiene el bug.

```java
@GetMapping("/quotes/{symbol}")
public Quote quote(@PathVariable String symbol) {
  return quotes.find(symbol); // sin límite: un cliente puede pedir esto 5000 veces por segundo
}
```

Hace falta un límite por cliente: hasta cierta cantidad de peticiones, se atiende; por encima, se rechaza rápido y sin tocar la base.

## Primero, los términos

- **Rate limiting** (limitación de tasa): rechazar las peticiones de un cliente que supera una cantidad permitida por unidad de tiempo. AWS lo llama _throttling_.
- **Tasa** (_rate_): cuántas peticiones por segundo se permiten de forma sostenida.
- **Ráfaga** (_burst_): muchas peticiones juntas en poco tiempo, por ejemplo al abrir una pantalla que hace diez llamadas a la vez.
- **Clave del límite**: a quién se le cuenta, por ejemplo la API key, el usuario o la IP.
- **429 Too Many Requests**: el código HTTP (RFC 6585) para "mandaste demasiadas peticiones en este período".
- **Retry-After**: un header que le dice al cliente cuánto esperar antes de reintentar.

## Token bucket: una tasa sostenida con margen para ráfagas

El algoritmo **token bucket** (cubeta de fichas) funciona así:

1. Cada cliente tiene una cubeta con capacidad para `C` fichas. Empieza llena.
2. Se agregan fichas a una tasa fija, `R` por segundo, sin pasar de `C`.
3. Cada petición gasta una ficha. Si no hay fichas, se rechaza.

Las dos perillas significan cosas distintas:

- `R` es la **tasa sostenida**: a largo plazo, nadie supera `R` peticiones por segundo.
- `C` es la **ráfaga máxima**: un cliente que estuvo tranquilo puede gastar hasta `C` fichas de golpe.

Amazon API Gateway usa exactamente estos dos parámetros: el _rate_ es cuántas fichas se agregan por segundo y el _burst_ es la capacidad de la cubeta.

```java
class TokenBucket {
  private final long capacity;        // C: ráfaga máxima
  private final double refillPerNano; // R, expresada por nanosegundo
  private double tokens;
  private long lastRefill;

  TokenBucket(long capacity, double tokensPerSecond, long now) {
    this.capacity = capacity;
    this.refillPerNano = tokensPerSecond / 1_000_000_000.0;
    this.tokens = capacity; // empieza llena
    this.lastRefill = now;
  }

  synchronized boolean tryAcquire(long now) {
    // repone las fichas ganadas desde la última vez, sin pasar la capacidad
    tokens = Math.min(capacity, tokens + (now - lastRefill) * refillPerNano);
    lastRefill = now;
    if (tokens >= 1) {
      tokens -= 1;
      return true;  // hay ficha: se atiende
    }
    return false;   // cubeta vacía: 429
  }
}
```

No hace falta un temporizador que agregue fichas: se calculan al momento con el tiempo transcurrido. Con `C = 10` y `R = 5`:

```text
t = 0 s     15 peticiones juntas  -> 10 aceptadas, 5 rechazadas (la cubeta tenía 10)
t = 1 s     se repusieron 5 fichas -> 5 peticiones más aceptadas, la sexta rechazada
```

### ¿Por qué permitir ráfagas?

Porque el tráfico real llega a golpes. Una pantalla que hace diez llamadas al abrirse no es un abuso, aunque en ese segundo supere la tasa promedio. La cubeta deja pasar esos picos cortos y sigue frenando a quien pide mucho de forma sostenida.

Hay otros algoritmos. NGINX, por ejemplo, usa _leaky bucket_ (cubeta con fuga) en `limit_req`: las peticiones salen a ritmo constante y el parámetro `burst` define cuántas pueden esperar en fila. Una **ventana fija** ("100 por minuto, reinicia en el minuto exacto") es más simple pero deja pasar el doble justo en el borde entre dos ventanas.

## Responder bien al rechazar

```java
@GetMapping("/quotes/{symbol}")
public ResponseEntity<Quote> quote(@PathVariable String symbol, @RequestHeader("X-Api-Key") String apiKey) {
  if (!limiter.bucketFor(apiKey).tryAcquire(System.nanoTime())) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS) // 429
        .header(HttpHeaders.RETRY_AFTER, "1")                    // vuelve a intentar en 1 segundo
        .build();
  }
  return ResponseEntity.ok(quotes.find(symbol));
}
```

- El rechazo es barato: no toca la base, así que protege al resto de los clientes.
- `429` y `Retry-After` le dicen al cliente qué pasó y cuándo reintentar, en lugar de un `500` genérico.
- Con varias instancias detrás de un balanceador, una cubeta en memoria por instancia multiplica el límite real por la cantidad de instancias. Para un límite global, el contador vive en un almacén compartido (como Redis) o en un gateway delante de todas.

## En la entrevista

### ¿Cómo funciona el token bucket?

Cada cliente tiene una cubeta de capacidad `C` que se llena a `R` fichas por segundo, sin pasar de `C`. Cada petición gasta una ficha; sin fichas, se rechaza con `429`. `R` fija la tasa sostenida y `C` la ráfaga máxima: un cliente que estuvo inactivo puede hacer hasta `C` peticiones de golpe, pero a largo plazo no supera `R` por segundo.

### ¿Qué código HTTP devuelves cuando se supera el límite?

`429 Too Many Requests`, definido en la RFC 6585, idealmente con un header `Retry-After` que indique cuánto esperar. Así el cliente distingue "estás pidiendo demasiado" de un error del servidor y puede reintentar más tarde de forma ordenada.

### Tienes cinco instancias y cada una limita a 100 peticiones por segundo en memoria. ¿Cuál es el límite real?

Hasta 500 por segundo, porque cada instancia cuenta por su lado y el balanceador reparte el tráfico. Si el límite tiene que ser global, el estado de la cubeta va a un almacén compartido como Redis, o el límite se aplica en un gateway que ve todo el tráfico.
