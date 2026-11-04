---
title: Objeto de valor inmutable Money
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
---

Construye `Money`, un objeto de valor inmutable que guarda un monto en una moneda. El código que maneja dinero aparece en casi cualquier backend y es fácil equivocarse: `double` pierde centavos y el `equals` de `BigDecimal` sorprende a mucha gente.

## Qué implementar

Edita `src/main/java/.../money/Money.java` hasta que pasen todos los tests de `MoneyTest`.

- `Money.of("10.5", "USD")` crea un monto. El monto se ajusta a los decimales de la moneda (2 para USD, 0 para JPY) con redondeo half-even.
- `amount()` y `currency()` devuelven sus partes.
- `plus(other)` suma dos montos de la misma moneda y rechaza monedas distintas con `IllegalArgumentException`.
- `times(factor)` multiplica y redondea half-even a los decimales de la moneda.
- Dos `Money` con la misma moneda y el mismo valor son iguales y tienen el mismo `hashCode`, aunque uno se haya escrito como `"10"` y el otro como `"10.00"`.
- `toString()` imprime `10.50 USD`.
- La clase es inmutable: `final` y con campos `final`. Las operaciones devuelven instancias nuevas.

Puedes convertir la clase en un `record`.

## Ejecutar los tests

Desde `exercises/backend`:

```sh
./mvnw -pl java-core/immutable-money test
```

En Windows, usa `mvnw.cmd` en lugar de `./mvnw`.

## Pistas

- Nunca uses `double` para dinero. ¿Por qué `0.1 + 0.2` no es igual a `0.3`?
- ¿`new BigDecimal("10.0").equals(new BigDecimal("10.00"))` es verdadero? ¿Y con `compareTo`?
- Si usas un record, ¿dónde puedes normalizar el monto antes de guardarlo?

La solución de referencia está en `solution/`, comentada para que aprendas de ella. Inténtalo primero y después compara.
