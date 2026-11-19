---
title: Con count en 0, un click ejecuta setCount(count + 1) tres veces. ¿Cuánto vale count en el siguiente render?
type: multiple-choice
category: frontend
stack: [javascript, react]
seniority: [jr, ssr]
fundamentals: false
concepts: [react-state]
evidence:
  - type: interview-report
    url: https://leetcode.com/discuss/post/6766726/writesonic-full-stack-developer-intervie-q35l/
  - type: interview-report
    url: https://leetcode.com/discuss/post/7347058/microsoft-software-engineer-ii-frontend-z7ods/
options:
  - id: a
    text: "0"
  - id: b
    text: "1"
  - id: c
    text: "3"
  - id: d
    text: Depende de si React agrupa las actualizaciones
answer: b
---

La respuesta es **1**: el estado es una **foto** del render actual. Dentro de ese handler, `count` vale `0` en las tres llamadas, así que las tres piden lo mismo: `setCount(0 + 1)`.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1); // setCount(0 + 1)
    setCount(count + 1); // setCount(0 + 1): count sigue siendo 0 en este render
    setCount(count + 1); // setCount(0 + 1)
  }
  // siguiente render: count = 1
}
```

**Por qué pasa:** `setCount` no cambia la variable `count` que ya tienes; le pide a React un render nuevo con otro valor. Cada render es una ejecución nueva de la función del componente, con su propia constante `count`. El handler fue creado en el render donde `count` vale `0`, así que esa es la única que puede ver.

**La consecuencia práctica:** cuando el valor nuevo depende del anterior, pasa una **función actualizadora**. React encola las tres funciones y aplica cada una sobre el resultado de la anterior:

```jsx
setCount((c) => c + 1); // 0 -> 1
setCount((c) => c + 1); // 1 -> 2
setCount((c) => c + 1); // 2 -> 3
// siguiente render: count = 3
```

Es lo que corresponde en casos reales como un botón "+1" que el usuario puede tocar muy rápido o una actualización que llega después de un `await`.

**Las otras opciones:**

- `0`: `setCount` sí pide un valor nuevo; lo que no hace es cambiar `count` dentro del render actual.
- `3`: es lo que da con la función actualizadora `(c) => c + 1`, no con `count + 1`.
- Depende de si React agrupa las actualizaciones: agrupar (_batching_) decide cuántos renders hay, no el valor. Aunque hubiera un render por llamada, las tres calculan `0 + 1` con la foto en la que se creó el handler.
