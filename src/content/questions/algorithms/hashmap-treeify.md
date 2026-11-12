---
title: Desde Java 8, ¿qué hace HashMap cuando un bucket acumula muchas colisiones?
type: multiple-choice
category: algorithms
stack: [java]
seniority: [ssr, sr]
fundamentals: true
options:
  - id: a
    text: Lanza una excepción
  - id: b
    text: Convierte la lista del bucket en un árbol
  - id: c
    text: Descarta la entrada más antigua
  - id: d
    text: Cambia la función hash de las claves
answer: b
---

**Convierte la lista del bucket en un árbol** (nodos `TreeNode`, estructurados de forma parecida a `TreeMap`). En el código de OpenJDK:

- `TREEIFY_THRESHOLD = 8`: un bucket se convierte en árbol al agregar un elemento cuando ya tiene al menos esa cantidad de nodos.
- `MIN_TREEIFY_CAPACITY = 64`: si la tabla es más chica que eso, en lugar de convertir el bucket se redimensiona la tabla.

Así, el peor caso de una búsqueda dentro de un bucket con muchas colisiones baja de lineal a logarítmico.
