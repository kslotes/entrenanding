---
title: ¿Qué forma de inyección de dependencias recomienda en general el equipo de Spring para las dependencias obligatorias?
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [jr, ssr]
fundamentals: true
options:
  - id: a
    text: Inyección por constructor
  - id: b
    text: Inyección por setter
  - id: c
    text: "@Autowired sobre campos"
  - id: d
    text: Buscar el bean en el ApplicationContext cuando se necesita
answer: a
---

**Inyección por constructor**. La documentación de Spring explica por qué:

- Permite que los componentes sean inmutables (campos `final`).
- Garantiza que las dependencias obligatorias no sean `null`.
- El objeto llega siempre completamente inicializado a quien lo usa.

La inyección por setter queda para dependencias opcionales con un valor por defecto razonable. Un constructor con demasiados parámetros es una señal de que la clase tiene demasiadas responsabilidades.
