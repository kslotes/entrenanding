---
title: What does this loop print?
locale: en
type: predict-output
category: frontend
stack: [javascript]
seniority: [jr, ssr]
fundamentals: true
language: javascript
code: |
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
expectedOutput: |-
  3
  3
  3
---

It prints `3` three times.

- `var` is function-scoped, so all three callbacks close over the **same** `i` binding.
- `setTimeout` callbacks run only after the loop finishes, when `i` is already `3`.

Using `let` fixes it: `let` creates a new binding per iteration, so the output becomes `0`, `1`, `2`.
