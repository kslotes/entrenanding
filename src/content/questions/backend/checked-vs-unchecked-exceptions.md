---
title: ¿Cuál de estas excepciones es unchecked (no obliga a declararla ni a capturarla)?
type: multiple-choice
category: backend
stack: [java]
seniority: [jr]
fundamentals: true
options:
  - id: a
    text: IOException
  - id: b
    text: SQLException
  - id: c
    text: IllegalArgumentException
  - id: d
    text: InterruptedException
answer: c
---

`IllegalArgumentException` extiende `RuntimeException`, y las subclases de `RuntimeException` (y de `Error`) son **unchecked**: el compilador no exige `throws` ni `try/catch`.

Las otras tres extienden `Exception` sin pasar por `RuntimeException`, así que son **checked**: el método que las lanza debe declararlas, y quien lo llama debe capturarlas o volver a declararlas.
