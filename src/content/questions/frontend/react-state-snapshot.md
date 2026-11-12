---
title: Con count en 0, un click ejecuta setCount(count + 1) tres veces. ¿Cuánto vale count en el siguiente render?
type: multiple-choice
category: frontend
stack: [javascript, react]
seniority: [jr, ssr]
fundamentals: false
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

Vale **1**. El estado es una foto del render actual: dentro de ese handler, `count` vale `0` en las tres llamadas, así que las tres piden `setCount(0 + 1)`.

`set` no cambia la variable en el código que ya está corriendo; solo pide el valor para el **siguiente** render.

Para encadenar actualizaciones, se pasa una función actualizadora: `setCount((c) => c + 1)` tres veces da `3`, porque React aplica cada función sobre el resultado de la anterior.
