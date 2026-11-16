---
title: unknown y any en TypeScript
stack: [typescript]
references:
  - title: "TypeScript Handbook: Everyday Types (any)"
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any
  - title: "TypeScript Handbook: More on Functions (unknown)"
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown
  - title: "TypeScript 3.0 release notes: New unknown top type"
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type
  - title: "TypeScript Handbook: Narrowing"
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - title: "TSConfig: useUnknownInCatchVariables"
    url: https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html
---

## Dos tipos que aceptan cualquier valor

Tanto `any` como `unknown` pueden recibir cualquier valor. La diferencia está en **qué te deja hacer TypeScript después**.

## any: el chequeo se apaga

Con `any` puedes acceder a cualquier propiedad, llamar al valor como función o asignarlo a cualquier tipo. TypeScript deja de revisar, y las propiedades que leas también son `any`:

```ts
const config: any = JSON.parse(input);
config.user.name.toUpperCase(); // compila
const port: number = config; // compila
```

Si `input` es `"{}"`, la segunda línea compila sin problemas y al ejecutarse en Node falla con `TypeError: Cannot read properties of undefined (reading 'name')`. `any` se contagia: todo lo que sale de él pierde el chequeo.

## unknown: primero comprueba

`unknown` es la contraparte segura de `any`. Cualquier valor se puede asignar a `unknown`, pero no puedes operar sobre él ni asignarlo a otro tipo (salvo `any` o `unknown`) sin antes **acotarlo** o usar una aserción:

```ts
const data: unknown = JSON.parse(input);
data.user; // error TS18046: 'data' is of type 'unknown'.
const port: number = data; // error TS2322: Type 'unknown' is not assignable to type 'number'.
```

## Acotar el tipo (narrowing)

TypeScript sigue el flujo del código: dentro de un `if` que comprueba el tipo, el valor pasa a tener ese tipo.

```ts
if (typeof data === "number") {
  data.toFixed(2); // data es number
}
if (data instanceof Date) {
  data.getFullYear(); // data es Date
}
```

Para formas propias se escribe un **type guard**, una función cuyo tipo de retorno es un predicado `value is T`:

```ts
function isUser(value: unknown): value is { name: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  );
}

if (isUser(data)) {
  data.name.toUpperCase(); // data es { name: string }
}
```

## Dónde aparece

- **Datos externos**: respuestas de una API, `JSON.parse`, `localStorage`. Tiparlos como `unknown` obliga a validarlos antes de usarlos.
- **Variables de `catch`**: con `useUnknownInCatchVariables` (activada por `--strict`), el error de un `catch` es `unknown`, porque se puede lanzar cualquier valor, no solo un `Error`. Se comprueba con `if (error instanceof Error)`.

Cada `any` es un lugar donde TypeScript deja de revisar tu código; `unknown` mantiene la revisión y te obliga a demostrar el tipo.

## En la entrevista

- ¿Qué tipo usarías para el resultado de `JSON.parse` y por qué?
- ¿Qué es un type guard? Escribe uno.
- ¿Por qué el error de un `catch` es `unknown` en modo estricto?
