package io.github.kslotes.entrenanding.exercises.money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;

/**
 * Reference solution.
 *
 * <p>A record gives immutability, equals, hashCode and toString for free. The catch is that
 * {@link BigDecimal#equals} compares scale too ({@code 10.0} is not equal to {@code 10.00}), so the
 * compact constructor normalizes the scale to the currency's fraction digits. Without that, two
 * amounts that look the same would break equals, hashCode and every HashSet that holds them.
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
          "Currency mismatch: " + currency.getCurrencyCode() + " vs " + other.currency.getCurrencyCode());
    }
  }
}
