---
title: Según el teorema CAP, durante una partición de red entre las réplicas de una base distribuida, ¿qué es cierto?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [cap-theorem]
options:
  - id: a
    text: El sistema puede garantizar consistencia y disponibilidad si tiene suficientes réplicas
  - id: b
    text: El sistema tiene que elegir entre responder con datos posiblemente viejos o rechazar peticiones
  - id: c
    text: El sistema renuncia a la tolerancia a particiones y sigue siendo consistente y disponible
  - id: d
    text: El teorema solo aplica a bases de datos relacionales
answer: b
---

La respuesta es **b**: si las réplicas no pueden comunicarse, un nodo que recibe una petición no sabe si el otro lado escribió algo. O responde con lo que tiene (disponible, quizá inconsistente) o rechaza la petición hasta confirmar (consistente, no disponible).

```text
Buenos Aires  stock = 1   ✗ red ✗   Madrid  stock = 1
compra A -> ¿acepto?                compra B -> ¿acepto?
AP: los dos aceptan  -> se vendieron 2 libros, hay que reconciliar
CP: un lado rechaza  -> un cliente ve un error, el stock queda bien
```

**Por qué funciona así:** Gilbert y Lynch demostraron que, en una red que puede perder mensajes, es imposible garantizar a la vez consistencia y disponibilidad. Las particiones son inevitables, así que la decisión es qué sacrificar mientras duran.

**La consecuencia práctica:** para stock o saldos se prefiere CP (un error temporal antes que vender de más); para un carrito o un feed, AP (responder siempre y reconciliar después).

**Las otras opciones:**

- `a`: más réplicas no ayudan si no pueden hablar entre sí; el problema es la comunicación, no la cantidad.
- `c`: la partición ya ocurrió; "renunciar" a tolerarla no la hace desaparecer. Brewer llama engañosa a esa lectura de "elige 2 de 3".
- `d`: aplica a cualquier sistema que replique datos por una red: bases NoSQL, cachés distribuidas, colas.
