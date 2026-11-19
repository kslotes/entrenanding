---
title: En TypeScript, ¿qué diferencia a unknown de any?
type: multiple-choice
category: frontend
stack: [typescript]
seniority: [jr, ssr]
fundamentals: true
concepts: [typescript-unknown-vs-any]
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

La respuesta es que **con `unknown` no se puede operar sobre el valor sin antes acotar su tipo**. Las dos aceptan cualquier valor, pero `any` apaga el chequeo de TypeScript y `unknown` lo mantiene: no deja acceder a propiedades, llamar al valor ni asignarlo a un tipo concreto hasta comprobar qué es.

```ts
function withAny(value: any) {
  value.trim(); // compila; si value es 42, falla al ejecutarse: value.trim is not a function
}

function withUnknown(value: unknown) {
  value.trim(); // error TS18046: 'value' is of type 'unknown'.
  if (typeof value === "string") {
    value.trim(); // OK: dentro del if, TypeScript sabe que es string
  }
}
```

**Por qué existe:** el chequeo de tipos ocurre **al compilar**, y al ejecutarse el código es JavaScript sin tipos. Con `any`, los errores pasan la compilación y aparecen en producción. `unknown` traslada el error al editor: te obliga a _acotar_ el tipo (con `typeof`, `instanceof` o un _type guard_) antes de usarlo.

**La consecuencia práctica:** es el tipo indicado para todo lo que viene de afuera y cuya forma no controlas: el resultado de `JSON.parse`, la respuesta de una API, `localStorage`. También es el tipo de la variable de un `catch` en modo estricto, porque en JavaScript se puede lanzar cualquier valor:

```ts
try {
  await save();
} catch (error) {
  // error es unknown
  if (error instanceof Error) console.error(error.message);
}
```

**Las otras opciones:**

- `unknown` solo acepta `null` y `undefined`: acepta cualquier valor, igual que `any`.
- Desactiva el chequeo igual que `any`, pero solo en tiempo de ejecución: TypeScript no chequea nada al ejecutarse (los tipos desaparecen al compilar), y `unknown` justamente **mantiene** el chequeo al compilar.
- No hay diferencia, es un alias de `any`: son tipos distintos; `unknown` se agregó en TypeScript 3.0 como la alternativa segura a `any`.
