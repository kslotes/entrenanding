package io.github.kslotes.entrenanding.exercises.money;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.Currency;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class MoneyTest {

  @Nested
  @DisplayName("creación")
  class Creation {

    @Test
    @DisplayName("conserva la moneda")
    void keepsTheCurrency() {
      assertThat(Money.of("10", "USD").currency()).isEqualTo(Currency.getInstance("USD"));
    }

    @Test
    @DisplayName("ajusta el monto a los decimales de la moneda")
    void scalesToCurrencyDigits() {
      assertThat(Money.of("10.5", "USD").amount()).isEqualByComparingTo("10.50");
      assertThat(Money.of("10.5", "USD").amount().scale()).isEqualTo(2);
      assertThat(Money.of("100", "JPY").amount().scale()).isZero();
    }

    @Test
    @DisplayName("redondea half-even (redondeo bancario)")
    void roundsHalfEven() {
      assertThat(Money.of("2.345", "USD").amount()).isEqualTo(new BigDecimal("2.34"));
      assertThat(Money.of("2.355", "USD").amount()).isEqualTo(new BigDecimal("2.36"));
      assertThat(Money.of("100.5", "JPY").amount()).isEqualTo(new BigDecimal("100"));
    }

    @Test
    @DisplayName("rechaza argumentos null")
    void rejectsNulls() {
      assertThatThrownBy(() -> Money.of(null, "USD")).isInstanceOf(NullPointerException.class);
      assertThatThrownBy(() -> Money.of("10", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("rechaza códigos de moneda desconocidos")
    void rejectsUnknownCurrency() {
      assertThatThrownBy(() -> Money.of("10", "XYZ"))
          .isInstanceOf(IllegalArgumentException.class);
    }
  }

  @Nested
  @DisplayName("aritmética")
  class Arithmetic {

    @Test
    @DisplayName("plus suma montos de la misma moneda")
    void plusAdds() {
      assertThat(Money.of("10.25", "EUR").plus(Money.of("0.75", "EUR")))
          .isEqualTo(Money.of("11.00", "EUR"));
    }

    @Test
    @DisplayName("plus devuelve una instancia nueva y no modifica los operandos")
    void plusDoesNotMutate() {
      Money ten = Money.of("10", "EUR");
      Money five = Money.of("5", "EUR");

      Money sum = ten.plus(five);

      assertThat(sum).isNotSameAs(ten).isNotSameAs(five);
      assertThat(ten).isEqualTo(Money.of("10", "EUR"));
      assertThat(five).isEqualTo(Money.of("5", "EUR"));
    }

    @Test
    @DisplayName("plus rechaza monedas distintas")
    void plusRejectsCurrencyMismatch() {
      assertThatThrownBy(() -> Money.of("10", "USD").plus(Money.of("10", "EUR")))
          .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("times multiplica y redondea half-even a los decimales de la moneda")
    void timesRounds() {
      assertThat(Money.of("1.00", "USD").times(new BigDecimal("0.125")))
          .isEqualTo(Money.of("0.12", "USD"));
      assertThat(Money.of("19.99", "USD").times(new BigDecimal("3")))
          .isEqualTo(Money.of("59.97", "USD"));
    }
  }

  @Nested
  @DisplayName("semántica de valor")
  class ValueSemantics {

    @Test
    @DisplayName("es igual sin importar cuántos decimales se escribieron")
    void equalAcrossInputScales() {
      Money a = Money.of("10", "USD");
      Money b = Money.of("10.00", "USD");

      assertThat(a).isEqualTo(b);
      assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }

    @Test
    @DisplayName("no es igual entre monedas distintas")
    void notEqualAcrossCurrencies() {
      assertThat(Money.of("10", "USD")).isNotEqualTo(Money.of("10", "EUR"));
    }

    @Test
    @DisplayName("funciona como elemento de un HashSet")
    void worksInHashSet() {
      Set<Money> set = new HashSet<>();
      set.add(Money.of("10", "USD"));
      set.add(Money.of("10.0", "USD"));
      set.add(Money.of("10.00", "USD"));

      assertThat(set).hasSize(1);
    }

    @Test
    @DisplayName("imprime el monto y el código de moneda")
    void toStringFormat() {
      assertThat(Money.of("10.5", "USD")).hasToString("10.50 USD");
      assertThat(Money.of("100", "JPY")).hasToString("100 JPY");
    }

    @Test
    @DisplayName("es inmutable: clase final con campos final")
    void isImmutable() {
      assertThat(Modifier.isFinal(Money.class.getModifiers())).isTrue();
      for (Field field : Money.class.getDeclaredFields()) {
        if (!Modifier.isStatic(field.getModifiers())) {
          assertThat(Modifier.isFinal(field.getModifiers()))
              .as("el campo %s debe ser final", field.getName())
              .isTrue();
        }
      }
    }
  }
}
