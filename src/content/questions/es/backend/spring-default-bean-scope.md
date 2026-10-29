---
title: ¿Qué scope usa Spring por defecto para sus beans?
locale: es
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: singleton
  - id: b
    text: prototype
  - id: c
    text: request
  - id: d
    text: session
answer: a
---

El scope por defecto es **singleton**: el contenedor crea una única instancia compartida por cada definición de bean y la devuelve en cada inyección o búsqueda.

- `prototype` crea una instancia nueva cada vez que se solicita el bean.
- `request` y `session` solo existen en un `ApplicationContext` web.

Como los singletons se comparten, deben ser sin estado o seguros para hilos.
