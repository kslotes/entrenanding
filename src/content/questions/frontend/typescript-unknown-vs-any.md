---
title: En TypeScript, ¿qué diferencia a unknown de any?
type: multiple-choice
category: frontend
stack: [typescript]
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: unknown solo acepta null y undefined
  - id: b
    text: Con unknown no se puede operar sobre el valor sin antes acotar su tipo
  - id: c
    text: unknown desactiva el chequeo de tipos igual que any, pero solo en tiempo de ejecución
  - id: d
    text: No hay diferencia; unknown es un alias de any
answer: b
---

Las dos aceptan cualquier valor, pero `unknown` es la variante segura: no permite acceder a propiedades, llamar al valor ni usarlo como un tipo concreto hasta acotarlo (`typeof`, `instanceof`, un type guard).

```ts
function f(value: unknown) {
  value.trim(); // error
  if (typeof value === "string") {
    value.trim(); // OK: acá es string
  }
}
```

Con `any`, `value.trim()` compila aunque `value` no sea un string, y el error aparece recién en tiempo de ejecución. `unknown` es una buena opción para datos externos, como el resultado de `JSON.parse`.
