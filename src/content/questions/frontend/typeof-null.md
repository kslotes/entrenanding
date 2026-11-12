---
title: ¿Qué devuelve typeof null en JavaScript?
type: multiple-choice
category: frontend
stack: [javascript]
seniority: [jr]
fundamentals: true
options:
  - id: a
    text: '"null"'
  - id: b
    text: '"undefined"'
  - id: c
    text: '"object"'
  - id: d
    text: Lanza un TypeError
answer: c
---

Devuelve `"object"`, aunque `null` es un valor primitivo. Es un comportamiento histórico del lenguaje que quedó fijado en la especificación para no romper código existente.

Consecuencia práctica: `typeof value === "object"` no alcanza para saber si algo es un objeto. Hay que descartar `null` explícitamente: `value !== null && typeof value === "object"`.
