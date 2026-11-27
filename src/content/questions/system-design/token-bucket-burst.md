---
title: Un rate limiter token bucket tiene capacidad 10 y se recarga a 5 fichas por segundo. Un cliente inactivo hace 15 peticiones en el mismo instante. ¿Cuántas se aceptan?
type: multiple-choice
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: true
concepts: [rate-limiting]
options:
  - id: a
    text: "5"
  - id: b
    text: "10"
  - id: c
    text: "15"
  - id: d
    text: "0"
answer: b
---

La respuesta es **10**: la cubeta de un cliente inactivo está llena, con tantas fichas como su capacidad. Cada petición gasta una, así que pasan 10 y las otras 5 reciben `429`.

```text
t = 0 s   cubeta = 10 fichas   15 peticiones -> 10 aceptadas, 5 rechazadas
t = 1 s   se repusieron 5      -> 5 aceptadas más
```

**Por qué funciona así:** el token bucket separa dos cosas. La **tasa** (5 por segundo) es cuántas fichas se reponen y fija el ritmo sostenido. La **capacidad** (10) es cuántas fichas se pueden acumular y fija la ráfaga máxima. Amazon API Gateway expone justo esos dos parámetros: _rate_ y _burst_.

**La consecuencia práctica:** el tráfico real llega a golpes (una pantalla que hace diez llamadas al abrir) y la cubeta lo deja pasar, pero un cliente que pide sin pausa termina limitado a 5 por segundo.

**Las otras opciones:**

- `5`: confunde la tasa de recarga con la capacidad; la tasa limita el ritmo sostenido, no la ráfaga.
- `15`: la cubeta no tiene fichas para todas; sin ficha, la petición se rechaza.
- `0`: un cliente inactivo tiene la cubeta llena, no vacía.
