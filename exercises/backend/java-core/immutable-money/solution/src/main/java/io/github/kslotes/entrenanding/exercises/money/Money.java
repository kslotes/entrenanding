package io.github.kslotes.entrenanding.exercises.money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Solución de referencia.
 *
 * <p>Un record da inmutabilidad, equals, hashCode y toString sin escribirlos. La trampa es que
 * {@link BigDecimal#equals} también compara la escala ({@code 10.0} no es igual a {@code 10.00}),
 * por eso el constructor compacto normaliza la escala a los decimales de la moneda. Sin eso, dos
 * montos que se ven iguales rompen equals, hashCode y cualquier HashSet que los contenga.
 */
public record Money(BigDecimal amount, Currency currency) {

  private static final RoundingMode ROUNDING = RoundingMode.HALF_EVEN;

  public Money {
    Objects.requireNonNull(amount, "amount");
    Objects.requireNonNull(currency, "currency");
    amount = amount.setScale(currency.getDefaultFractionDigits(), ROUNDING);
  }

  public static Money of(String amount, String currencyCode) {
    Objects.requireNonNull(amount, "amount");
    Objects.requireNonNull(currencyCode, "currencyCode");
    return new Money(new BigDecimal(amount), Currency.getInstance(currencyCode));
  }

  public Money plus(Money other) {
    requireSameCurrency(other);
    return new Money(amount.add(other.amount), currency);
  }

  public Money times(BigDecimal factor) {
    Objects.requireNonNull(factor, "factor");
    return new Money(amount.multiply(factor), currency);
  }

  @Override
  public String toString() {
    return amount.toPlainString() + " " + currency.getCurrencyCode();
  }

  private void requireSameCurrency(Money other) {
    Objects.requireNonNull(other, "other");
    if (!currency.equals(other.currency)) {
      throw new IllegalArgumentException(
          "Monedas distintas: " + currency.getCurrencyCode() + " vs " + other.currency.getCurrencyCode());
    }
  }
}
