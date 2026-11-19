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

## El problema: el estado que "no se actualiza"

Dos bugs muy comunes al empezar con React:

```jsx
function Cart() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  function addTwo() {
    setCount(count + 1);
    setCount(count + 1);
    console.log(count); // 0, y la pantalla muestra 1, no 2
  }

  function addItem(item) {
    items.push(item);
    setItems(items); // la lista en pantalla no cambia
  }
  // ...
}
```

En el primero, el `console.log` muestra el valor viejo y las dos sumas cuentan como una. En el segundo, el array sí cambió en memoria, pero la pantalla no se entera. Las dos cosas tienen la misma raíz: **cómo guarda y compara React el estado**. Una vez que lo entiendes, ninguno de los dos vuelve a sorprenderte.

## Primero, los términos

- **Componente**: una función que devuelve lo que se muestra en pantalla (JSX).
- **Render**: cada vez que React **llama** a tu componente para saber qué mostrar. Cada render es una ejecución nueva de la función, con sus propias variables.
- **Estado**: datos que el componente recuerda entre renders, como un contador o una lista.
- **`useState`**: el hook que crea un estado. Devuelve el valor actual y una función `set` para pedir un cambio.
- **Handler**: una función que responde a un evento, como `onClick`.
- **Mutar**: modificar un objeto o array existente en lugar de crear uno nuevo.
- **Referencia**: lo que guarda una variable que contiene un objeto o array: "cuál" objeto es, no su contenido.
- **Batching** (agrupar): React junta varias llamadas a `set` y hace un solo render con todas.

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

Por qué funciona así: `name` es una constante (`const`) de esta ejecución de la función. React no puede cambiarla; lo que hace es volver a llamar a `Greeting`, y en esa **nueva** ejecución `useState` devuelve `"Luis"`.

```text
Render 1: name = "Ana"  -> click -> setName("Luis") -> pide un render nuevo
Render 2: name = "Luis"    (el handler del render 1 sigue viendo "Ana")
```

Lo mismo pasa con un `setTimeout` o un `await` dentro del handler: siguen viendo la foto del render en el que se creó el handler. Es el mecanismo de los [closures](./js-closures.md): la función recuerda las variables del lugar donde se creó.

## Cómo procesa React varias llamadas a set

React no vuelve a renderizar en cada `set`. Espera a que termine el handler y aplica todas las actualizaciones juntas (**batching**). Así, cinco cambios de estado en un click producen un solo render, no cinco. Mientras tanto, guarda cada llamada en una cola:

| Llamada                   | Qué encola                                                 |
| ------------------------- | ---------------------------------------------------------- |
| `setScore(10)`            | "reemplazar por 10"                                        |
| `setScore(score + 10)`    | "reemplazar por" `score + 10`, con el `score` de esta foto |
| `setScore((s) => s + 10)` | una **función actualizadora**                              |

En el siguiente render, React recorre la cola en orden. Cada función actualizadora recibe el resultado de la anterior, así que sirve cuando el valor nuevo depende del anterior. Un reemplazo, en cambio, ignora el resultado que llevaba la cola.

Con `count` en `0`:

```jsx
setCount(count + 1); // encola "reemplazar por 1"
setCount(count + 1); // encola "reemplazar por 1" otra vez
// siguiente render: 1

setCount((c) => c + 1); // 0 -> 1
setCount((c) => c + 1); // 1 -> 2
// siguiente render: 2
```

La regla práctica: si el valor nuevo se calcula a partir del anterior (contadores, "agregar a la lista", alternar un booleano), usa la función actualizadora.

## Objetos y arrays: no mutar

Hay que tratar todo objeto o array guardado en el estado como **de solo lectura**. Para cambiarlo, creas uno nuevo y se lo pasas a `set`.

La razón práctica: si el valor nuevo es idéntico al actual según `Object.is`, React omite el render. `Object.is` compara referencias, no contenido, así que es instantáneo; a cambio, mutar un array y pasar la misma referencia no le dice a React que algo cambió.

```jsx
const [tags, setTags] = useState(["js"]);

// Mal: muta el estado y pasa la misma referencia
tags.push("react");
setTags(tags); // Object.is(tags, tags) es true -> sin render

// Bien: array nuevo
setTags([...tags, "react"]); // agregar
setTags(tags.filter((t) => t !== "js")); // quitar
setTags(tags.map((t) => t.toUpperCase())); // transformar
```

Los métodos que modifican el array original (`push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, o asignar `arr[i] = x`) no se usan directamente sobre el estado. Los que devuelven un array nuevo (`concat`, `filter`, `map`, `slice`, `toSorted`, `toReversed`, el spread `[...arr]`) sí.

Con objetos es igual: se crea un objeto nuevo con el spread y se cambia solo lo necesario.

```jsx
const [form, setForm] = useState({ name: "", email: "" });

setForm({ ...form, email: "ana@mail.com" }); // objeto nuevo, name se conserva
```

### Copiar es superficial

`[...items]` crea un array nuevo, pero los objetos de adentro son **los mismos**. Para cambiar un objeto dentro del array, también hay que copiar ese objeto:

```jsx
const [todos, setTodos] = useState([{ id: 1, done: false }]);

// Mal: el array es nuevo, pero el objeto de adentro se mutó
const copy = [...todos];
copy[0].done = true; // también cambia el objeto de todos[0]
setTodos(copy);

// Bien: array nuevo y objeto nuevo solo para el que cambia
setTodos(todos.map((t) => (t.id === 1 ? { ...t, done: true } : t)));
```

El primer caso puede "funcionar" en pantalla y aun así romper cosas que comparan el valor anterior con el nuevo, como `useMemo`, `React.memo` o un "deshacer".

## En la entrevista

### ¿Por qué leer el estado justo después de llamar a `set` devuelve el valor anterior?

Porque el estado de un render es una foto: la variable es una constante de esa ejecución del componente. `set` no la modifica; le pide a React un render nuevo, y solo en esa nueva ejecución `useState` devuelve el valor actualizado. El handler, que se creó en el render anterior, sigue viendo el valor viejo.

### ¿Cuándo conviene pasar una función a `set` en lugar de un valor?

Cuando el valor nuevo depende del anterior. React encola las actualizaciones y aplica cada función actualizadora sobre el resultado de la anterior, así que tres `setCount((c) => c + 1)` suman 3. Tres `setCount(count + 1)` suman 1, porque las tres usan el mismo `count` de la foto.

### ¿Por qué no hay que mutar un array del estado? ¿Qué hace React cuando recibe la misma referencia?

Porque React decide si volver a renderizar comparando el valor nuevo con el actual con `Object.is`, que compara referencias. Si mutas el array y pasas el mismo, la comparación da `true` y React **omite el render**: la pantalla queda desactualizada. Hay que crear un array nuevo con `map`, `filter`, `toSorted` o el spread.

```jsx
setItems([...items, newItem]); // referencia nueva: React detecta el cambio
```
