---
title: Which bean scope does Spring use by default?
locale: en
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

The default scope is **singleton**: the container creates one shared instance per bean definition and returns it on every injection or lookup.

- `prototype` creates a new instance every time the bean is requested.
- `request` and `session` exist only in a web-aware `ApplicationContext`.

Because singletons are shared, they should be stateless or thread-safe.
