---
title: Immutable Money value object
locale: en
category: backend
stack: [java]
seniority: [jr, ssr]
fundamentals: true
---

Build `Money`, an immutable value object that holds an amount in one currency. Code that handles money shows up in almost every backend, and it is easy to get wrong: `double` loses cents, and `BigDecimal` has an `equals` that surprises people.

## What to implement

Edit `src/main/java/.../money/Money.java` until every test in `MoneyTest` passes.

- `Money.of("10.5", "USD")` creates an amount. The amount is scaled to the currency's fraction digits (2 for USD, 0 for JPY) with half-even rounding.
- `amount()` and `currency()` return the parts.
- `plus(other)` adds two amounts in the same currency and rejects different currencies with `IllegalArgumentException`.
- `times(factor)` multiplies and rounds half-even to the currency's digits.
- Two `Money` objects with the same currency and value are equal, with the same `hashCode`, even if one was written as `"10"` and the other as `"10.00"`.
- `toString()` prints `10.50 USD`.
- The class is immutable: `final`, with only `final` fields. Operations return new instances.

You can turn the class into a `record`.

## Run the tests

From `exercises/backend`:

```sh
./mvnw -pl java-core/immutable-money test
```

On Windows, use `mvnw.cmd` instead of `./mvnw`.

## Hints

- Never use `double` for money. Why does `0.1 + 0.2` not equal `0.3`?
- Is `new BigDecimal("10.0").equals(new BigDecimal("10.00"))` true? What about `compareTo`?
- If you use a record, where can you normalize the amount before it is stored?

The reference solution is in `solution/`. Try first, then compare.
