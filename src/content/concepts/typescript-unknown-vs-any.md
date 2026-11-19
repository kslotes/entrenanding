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

## El problema: el error que TypeScript no vio

Una pantalla de perfil lee el usuario de una API:

```ts
async function loadProfile() {
  const response = await fetch("/api/me");
  const user: any = await response.json();
  showName(user.profile.name.toUpperCase()); // compila sin quejas
}
```

Un día el backend cambia y la respuesta pasa a ser `{ "name": "Ana" }`, sin `profile`. TypeScript no avisa nada, el código compila, y en producción la pantalla se rompe con `TypeError: Cannot read properties of undefined (reading 'name')`. El tipo `any` le dijo a TypeScript "no revises esto". `unknown` dice lo contrario: "no sé qué es, así que **demuéstralo** antes de usarlo".

## Primero, los términos

- **Tipo**: la forma que TypeScript espera que tenga un valor (`string`, `number`, `{ name: string }`).
- **Chequeo de tipos**: la revisión que hace TypeScript **al compilar**, antes de que el código corra. Al ejecutarse, el código es JavaScript y los tipos ya no existen.
- **`any`**: un tipo que acepta cualquier valor y **apaga** el chequeo sobre ese valor.
- **`unknown`**: un tipo que acepta cualquier valor, pero no te deja usarlo hasta comprobar qué es.
- **Acotar** (_narrowing_): comprobar el tipo con un `if` para que TypeScript, dentro de ese bloque, sepa qué es el valor.
- **Type guard**: una función que hace esa comprobación y se la "explica" a TypeScript.
- **Aserción** (`value as User`): decirle a TypeScript "confía en mí, es de este tipo". No comprueba nada al ejecutarse.

## Dos tipos que aceptan cualquier valor

Tanto `any` como `unknown` pueden recibir cualquier valor. La diferencia está en **qué te deja hacer TypeScript después**.

## any: el chequeo se apaga

Con `any` puedes acceder a cualquier propiedad, llamar al valor como función o asignarlo a cualquier tipo. TypeScript deja de revisar, y las propiedades que leas también son `any`:

```ts
const config: any = JSON.parse(input);
config.user.name.toUpperCase(); // compila
const port: number = config; // compila
```

Si `input` es `"{}"`, la segunda línea compila sin problemas y al ejecutarse en Node falla con `TypeError: Cannot read properties of undefined (reading 'name')`. `any` se contagia: todo lo que sale de él pierde el chequeo, y se puede asignar a variables con tipos concretos, como `port`, que ahora "es" un `number` aunque contenga un objeto.

## unknown: primero comprueba

`unknown` es la contraparte segura de `any`. Cualquier valor se puede asignar a `unknown`, pero no puedes operar sobre él ni asignarlo a otro tipo (salvo `any` o `unknown`) sin antes **acotarlo** o usar una aserción:

```ts
const data: unknown = JSON.parse(input);
data.user; // error TS18046: 'data' is of type 'unknown'.
const port: number = data; // error TS2322: Type 'unknown' is not assignable to type 'number'.
```

El error aparece en el editor, mientras escribes, en lugar de aparecer en producción.

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
    value !== null && // typeof null también es "object"
    "name" in value &&
    typeof value.name === "string"
  );
}

if (isUser(data)) {
  data.name.toUpperCase(); // data es { name: string }
}
```

El ejemplo del principio, con `unknown`:

```ts
async function loadProfile() {
  const response = await fetch("/api/me");
  const user: unknown = await response.json();

  if (!isUser(user)) {
    showError("La respuesta de la API no tiene el formato esperado");
    return;
  }
  showName(user.name.toUpperCase()); // seguro: ya se comprobó
}
```

Si el backend cambia, el código muestra un error controlado en lugar de romperse. En proyectos grandes, estas comprobaciones se suelen escribir con una librería de validación de esquemas en lugar de a mano.

Una aserción (`const user = data as User`) también compila, pero no comprueba nada: es volver a confiar a ciegas, como con `any`. Úsala solo cuando sabes algo que TypeScript no puede saber.

## Dónde aparece

- **Datos externos**: respuestas de una API, `JSON.parse`, `localStorage`, mensajes de `postMessage`. Tiparlos como `unknown` obliga a validarlos antes de usarlos.
- **Variables de `catch`**: con `useUnknownInCatchVariables` (activada por `--strict`), el error de un `catch` es `unknown`, porque se puede lanzar cualquier valor, no solo un `Error`. Se comprueba con `if (error instanceof Error)`.

```ts
try {
  await save();
} catch (error) {
  // error es unknown: alguien pudo hacer throw "texto" o throw 42
  const message = error instanceof Error ? error.message : String(error);
  showError(message);
}
```

Cada `any` es un lugar donde TypeScript deja de revisar tu código; `unknown` mantiene la revisión y te obliga a demostrar el tipo.

## En la entrevista

### ¿Qué tipo usarías para el resultado de `JSON.parse` y por qué?

`unknown`. El contenido viene de afuera (un archivo, una API, el usuario), así que TypeScript no puede saber su forma. Con `unknown`, el compilador te obliga a validarlo antes de usarlo; con `any`, cualquier acceso compila y los errores aparecen en producción. Por defecto `JSON.parse` devuelve `any`, así que conviene asignarlo a una variable `unknown`.

### ¿Qué es un type guard? Escribe uno.

Es una función que comprueba en tiempo de ejecución si un valor tiene cierta forma y, con el tipo de retorno `value is T`, le dice a TypeScript que dentro del `if` el valor es de ese tipo.

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(input)) {
  input.trim(); // input es string aquí
}
```

### ¿Por qué el error de un `catch` es `unknown` en modo estricto?

Porque en JavaScript se puede lanzar cualquier valor, no solo instancias de `Error`: `throw "texto"` o `throw 42` son válidos. TypeScript no puede garantizar que el error tenga `message` o `stack`, así que con `useUnknownInCatchVariables` (incluida en `--strict`) lo tipa como `unknown` y te obliga a comprobarlo, normalmente con `error instanceof Error`.
