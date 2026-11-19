---
title: BigDecimal y dinero en Java
stack: [java]
references:
  - title: "JLS 4.2.3: Floating-Point Types and Values"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.2.3
  - title: "BigDecimal (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html
  - title: "RoundingMode (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/RoundingMode.html
  - title: "Currency (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Currency.html
---

## El problema: los centavos que no cierran

Un sistema de facturación suma diez cargos de `0.10` con `double`:

```java
double total = 0;
for (int i = 0; i < 10; i++) {
  total += 0.10;
}
System.out.println(total);       // 0.9999999999999999
System.out.println(total >= 1.0); // false
```

En una factura suelta parece un detalle. Pero al sumar miles de montos el error se acumula, los reportes no coinciden con el banco por algunos centavos y nadie sabe de dónde salió la diferencia. Para dinero, Java ofrece `BigDecimal`, que hace las cuentas en **base 10**, exactas, como las harías en papel:

```java
BigDecimal total = BigDecimal.ZERO;
for (int i = 0; i < 10; i++) {
  total = total.add(new BigDecimal("0.10"));
}
System.out.println(total); // 1.00
```

## Primero, los términos

- **Punto flotante binario** (`float`, `double`): números guardados en base 2 con una cantidad fija de dígitos. Rápidos, pero muchos decimales no se pueden guardar exactos. Lo explica [la página de punto flotante](./floating-point-numbers.md).
- **`BigDecimal`**: un número decimal exacto, con tantos dígitos como haga falta.
- **Escala**: cuántos dígitos hay después de la coma. `10.50` tiene escala 2.
- **Redondeo**: elegir qué hacer con los dígitos que sobran cuando hay que quedarse con menos decimales.
- **Inmutable**: un objeto que no cambia después de crearse. Las operaciones devuelven un objeto nuevo.
- **ISO 4217**: el estándar que asigna un código de tres letras a cada moneda (`USD`, `EUR`, `ARS`).

## Por qué no usar double para dinero

`float` y `double` son números de punto flotante binarios (IEEE 754). Muchos decimales simples, como `0.1`, no tienen representación exacta en binario:

```java
System.out.println(0.1 + 0.2); // 0.30000000000000004
```

Cada operación puede agregar un error mínimo, y con dinero esos errores se acumulan y cambian resultados visibles: un total que no llega a un umbral, una conciliación bancaria que no cierra, un impuesto redondeado al centavo equivocado.

## Cómo representa BigDecimal un número

Un `BigDecimal` guarda dos cosas: un entero sin escala (`unscaledValue`, un `BigInteger`) y una **escala** (`scale`, un `int`). El valor es `unscaledValue × 10^-scale`.

```java
new BigDecimal("10.50"); // unscaledValue = 1050, scale = 2 -> 1050 × 10^-2
```

Como el entero se guarda exacto y la escala es una potencia de 10, cualquier monto decimal se representa sin error.

Créalo desde un `String` o con `BigDecimal.valueOf(double)`. El constructor que recibe un `double` copia el error binario:

```java
new BigDecimal(0.1);     // 0.1000000000000000055511151231257827021181583404541015625
BigDecimal.valueOf(0.1); // 0.1
new BigDecimal("0.1");   // 0.1
```

`BigDecimal` es **inmutable**: `add`, `multiply` y el resto no modifican el objeto, sino que devuelven uno nuevo. Un error típico es olvidar asignar el resultado:

```java
BigDecimal total = BigDecimal.ZERO;
total.add(new BigDecimal("5.00"));         // mal: el resultado se pierde, total sigue en 0
total = total.add(new BigDecimal("5.00")); // bien
```

## equals y compareTo no son lo mismo

- `compareTo` compara solo el **valor numérico**.
- `equals` compara el **valor y la escala**.

```java
new BigDecimal("2.0").equals(new BigDecimal("2.00"));    // false: escalas 1 y 2
new BigDecimal("2.0").compareTo(new BigDecimal("2.00")); // 0: mismo valor
```

Por eso un `HashSet<BigDecimal>` (usa `equals` y `hashCode`) guarda `2.0` y `2.00` como dos elementos, mientras que un `TreeSet<BigDecimal>` (usa `compareTo`) guarda uno solo. Para preguntar "¿son el mismo monto?", usa siempre `compareTo`:

```java
if (payment.compareTo(invoiceTotal) == 0) { // no payment.equals(invoiceTotal)
  markAsPaid();
}
```

## Escala y redondeo

- `add` y `subtract` devuelven la escala mayor de los operandos; `multiply` suma las escalas: `1.5 × 2.25 = 3.375`.
- `divide` sin `RoundingMode` lanza `ArithmeticException` si el resultado no tiene una representación decimal finita (por ejemplo, `1 / 3`: `Non-terminating decimal expansion; no exact representable decimal result.`).
- `setScale(n, roundingMode)` ajusta a `n` decimales con el redondeo indicado.

```java
BigDecimal price = new BigDecimal("19.99");
BigDecimal tax = price.multiply(new BigDecimal("0.21")); // 4.1979: escala 4
tax.setScale(2, RoundingMode.HALF_EVEN);                 // 4.20: al centavo

new BigDecimal("100.00").divide(new BigDecimal("3"), RoundingMode.HALF_EVEN); // 33.33
```

Los dos modos más usados con dinero:

| Modo        | Regla en el empate (`.5`)                    | `1.125` → | `1.135` → |
| ----------- | -------------------------------------------- | --------- | --------- |
| `HALF_UP`   | Redondea hacia arriba (alejándose del cero). | `1.13`    | `1.14`    |
| `HALF_EVEN` | Redondea al vecino par ("bancario").         | `1.12`    | `1.14`    |

`HALF_EVEN` se usa en contabilidad porque, a lo largo de muchas operaciones, los empates se reparten hacia arriba y hacia abajo y el error no se acumula en una sola dirección. `HALF_UP` es el redondeo "de la escuela" y lo que suelen esperar los usuarios en un ticket. Lo importante es elegir uno, escribirlo explícito y usar el mismo en todo el sistema.

### Repartir un monto sin perder centavos

Dividir `100.00` entre 3 da `33.33`, y `33.33 × 3 = 99.99`: se perdió un centavo. Al repartir (cuotas, gastos compartidos) se calcula la parte redondeada y el último se lleva la diferencia:

```java
BigDecimal total = new BigDecimal("100.00");
BigDecimal share = total.divide(new BigDecimal("3"), 2, RoundingMode.DOWN); // 33.33
BigDecimal last = total.subtract(share.multiply(new BigDecimal("2")));      // 33.34
// 33.33 + 33.33 + 33.34 = 100.00
```

## Currency

`java.util.Currency` representa monedas ISO 4217. `getDefaultFractionDigits()` dice cuántos decimales usa cada una: `2` para USD, `0` para JPY y `-1` para pseudo-monedas como XAU (oro).

```java
Currency usd = Currency.getInstance("USD");
BigDecimal amount = new BigDecimal("10.555")
    .setScale(usd.getDefaultFractionDigits(), RoundingMode.HALF_EVEN); // 10.56
```

Así el redondeo sigue la moneda en lugar de suponer siempre dos decimales: un monto en yenes se redondea a enteros. Un monto sin su moneda es ambiguo, así que en un modelo de dominio conviene guardarlos juntos, por ejemplo en un [value object](./value-objects.md) `Money`.

## En la entrevista

### ¿Por qué no usar `double` para dinero?

Porque `double` es punto flotante binario y muchos decimales, como `0.1`, no se pueden guardar exactos: `0.1 + 0.2` da `0.30000000000000004` y sumar diez veces `0.10` da `0.9999999999999999`. Con dinero esos errores se acumulan y cambian totales, comparaciones y redondeos. `BigDecimal` guarda el número en base 10 de forma exacta.

### ¿Qué diferencia hay entre `equals` y `compareTo` en `BigDecimal`?

`compareTo` compara solo el valor numérico; `equals` compara el valor **y** la escala. `2.0` y `2.00` dan `0` con `compareTo` (mismo monto) y `false` con `equals` (escalas distintas). Para comparar montos se usa `compareTo`. Hay que tenerlo en cuenta en colecciones: un `HashSet` los guarda como dos elementos y un `TreeSet`, como uno.

### ¿Qué `RoundingMode` usarías y por qué?

`HALF_EVEN` (redondeo bancario) para cálculos contables, porque reparte los empates hacia arriba y hacia abajo y el error no se acumula en una dirección. `HALF_UP` cuando el negocio o la normativa piden el redondeo tradicional, como en un ticket. En los dos casos, escrito explícito en cada `setScale` o `divide`, porque `divide` sin modo de redondeo puede lanzar `ArithmeticException`.
