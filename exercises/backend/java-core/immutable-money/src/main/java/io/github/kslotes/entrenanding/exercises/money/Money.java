package io.github.kslotes.entrenanding.exercises.money;

import java.math.BigDecimal;
import java.util.Currency;

/**
 * Un monto de dinero en una moneda.
 *
 * <p>Lee {@code statement.md} en la carpeta del ejercicio y haz que pasen los tests de
 * {@code MoneyTest}. Puedes convertir esta clase en un record.
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
