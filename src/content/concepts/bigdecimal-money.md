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

## Por qué no usar double para dinero

`float` y `double` son números de punto flotante binarios (IEEE 754). Muchos decimales simples, como `0.1`, no tienen representación exacta en binario:

```java
System.out.println(0.1 + 0.2); // 0.30000000000000004
```

En un monto suelto parece un detalle, pero al sumar miles de montos el error se acumula y los centavos dejan de cerrar.

## Cómo representa BigDecimal un número

Un `BigDecimal` guarda dos cosas: un entero sin escala (`unscaledValue`, un `BigInteger`) y una **escala** (`scale`, un `int`). El valor es `unscaledValue × 10^-scale`.

```java
new BigDecimal("10.50"); // unscaledValue = 1050, scale = 2
```

Creálo desde un `String` o con `BigDecimal.valueOf(double)`. El constructor que recibe un `double` copia el error binario:

```java
new BigDecimal(0.1);      // 0.1000000000000000055511151231257827021181583404541015625
BigDecimal.valueOf(0.1);  // 0.1
```

## equals y compareTo no son lo mismo

- `compareTo` compara solo el **valor numérico**.
- `equals` compara el **valor y la escala**.

```java
new BigDecimal("2.0").equals(new BigDecimal("2.00"));    // false
new BigDecimal("2.0").compareTo(new BigDecimal("2.00")); // 0
```

Por eso un `HashSet<BigDecimal>` (usa `equals` y `hashCode`) guarda `2.0` y `2.00` como dos elementos, mientras que un `TreeSet<BigDecimal>` (usa `compareTo`) guarda uno solo.

## Escala y redondeo

- `add` y `subtract` devuelven la escala mayor de los operandos; `multiply` suma las escalas: `1.5 × 2.25 = 3.375`.
- `divide` sin `RoundingMode` lanza `ArithmeticException` si el resultado no tiene una representación decimal finita (por ejemplo, `1 / 3`).
- `setScale(n, roundingMode)` ajusta a `n` decimales con el redondeo indicado.

Los dos modos más usados con dinero:

| Modo        | Regla en el empate (`.5`)                    | `1.125` → | `1.135` → |
| ----------- | -------------------------------------------- | --------- | --------- |
| `HALF_UP`   | Redondea hacia arriba (alejándose del cero). | `1.13`    | `1.14`    |
| `HALF_EVEN` | Redondea al vecino par ("bancario").         | `1.12`    | `1.14`    |

`HALF_EVEN` se usa en contabilidad porque, a lo largo de muchas operaciones, los empates se reparten hacia arriba y hacia abajo y el error no se acumula en una sola dirección.

## Currency

`java.util.Currency` representa monedas ISO 4217. `getDefaultFractionDigits()` dice cuántos decimales usa cada una: `2` para USD, `0` para JPY y `-1` para pseudo-monedas como XAU (oro).

## En la entrevista

- ¿Por qué no usar `double` para dinero?
- ¿Qué diferencia hay entre `equals` y `compareTo` en `BigDecimal`?
- ¿Qué `RoundingMode` usarías y por qué?
