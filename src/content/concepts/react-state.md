---
title: Estado en React
stack: [javascript, typescript, react]
references:
  - title: "React: State as a Snapshot"
    url: https://react.dev/learn/state-as-a-snapshot
  - title: "React: Queueing a Series of State Updates"
    url: https://react.dev/learn/queueing-a-series-of-state-updates
  - title: "React: Updating Objects in State"
    url: https://react.dev/learn/updating-objects-in-state
  - title: "React: Updating Arrays in State"
    url: https://react.dev/learn/updating-arrays-in-state
  - title: "React: useState"
    url: https://react.dev/reference/react/useState
---

## El estado es una foto

Cada render recibe su propia **foto** del estado. Dentro de ese render, una variable de estado nunca cambia, aunque el handler sea asíncrono. Llamar a la función `set` no modifica la variable que ya tienes: le pide a React un nuevo render con el valor nuevo.

```jsx
function Greeting() {
  const [name, setName] = useState("Ana");

  function handleClick() {
    setName("Luis");
    console.log(name); // sigue siendo "Ana" en este render
  }

  return <button onClick={handleClick}>{name}</button>;
}
```

Lo mismo pasa con un `setTimeout` o un `await` dentro del handler: siguen viendo la foto del render en el que se creó el handler.

## Cómo procesa React varias llamadas a set

React no vuelve a renderizar en cada `set`. Espera a que termine el handler y aplica todas las actualizaciones juntas (**batching**). Mientras tanto, guarda cada llamada en una cola:

| Llamada                   | Qué encola                                                 |
| ------------------------- | ---------------------------------------------------------- |
| `setScore(10)`            | "reemplazar por 10"                                        |
| `setScore(score + 10)`    | "reemplazar por" `score + 10`, con el `score` de esta foto |
| `setScore((s) => s + 10)` | una **función actualizadora**                              |

En el siguiente render, React recorre la cola en orden. Cada función actualizadora recibe el resultado de la anterior, así que sirve cuando el valor nuevo depende del anterior. Un reemplazo, en cambio, ignora el resultado que llevaba la cola.

## Objetos y arrays: no mutar

Hay que tratar todo objeto o array guardado en el estado como **de solo lectura**. Para cambiarlo, creas uno nuevo y se lo pasas a `set`.

La razón práctica: si el valor nuevo es idéntico al actual según `Object.is`, React omite el render. Mutar un array y pasar la misma referencia no le dice a React que algo cambió.

```jsx
const [tags, setTags] = useState(["js"]);

// Mal: muta el estado y pasa la misma referencia
tags.push("react");
setTags(tags);

// Bien: array nuevo
setTags([...tags, "react"]);
setTags(tags.filter((t) => t !== "js"));
setTags(tags.map((t) => t.toUpperCase()));
```

Los métodos que modifican el array original (`push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, o asignar `arr[i] = x`) no se usan directamente sobre el estado. Los que devuelven un array nuevo (`concat`, `filter`, `map`, `slice`, el spread `[...arr]`) sí.

Copiar es **superficial**: `[...items]` crea un array nuevo, pero los objetos de adentro son los mismos. Para cambiar un objeto dentro del array, también hay que copiar ese objeto.

## En la entrevista

- ¿Por qué leer el estado justo después de llamar a `set` devuelve el valor anterior?
- ¿Cuándo conviene pasar una función a `set` en lugar de un valor?
- ¿Por qué no hay que mutar un array del estado? ¿Qué hace React cuando recibe la misma referencia?
