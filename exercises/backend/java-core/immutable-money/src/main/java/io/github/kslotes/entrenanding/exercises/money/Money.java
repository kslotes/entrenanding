package io.github.kslotes.entrenanding.exercises.money;

import java.math.BigDecimal;
import java.util.Currency;

/**
 * An amount of money in one currency.
 *
 * <p>Read {@code statement.en.md} (or {@code statement.es.md}) in this folder, then make the tests
 * in {@code MoneyTest} pass. You may turn this class into a record.
 */
public final class Money {

  public static Money of(String amount, String currencyCode) {
    throw new UnsupportedOperationException("TODO");
  }

  public BigDecimal amount() {
    throw new UnsupportedOperationException("TODO");
  }

  public Currency currency() {
    throw new UnsupportedOperationException("TODO");
  }

  public Money plus(Money other) {
    throw new UnsupportedOperationException("TODO");
  }

  public Money times(BigDecimal factor) {
    throw new UnsupportedOperationException("TODO");
  }
}
