---
title: What does it mean for an HTTP method to be idempotent, and which methods are?
locale: en
type: open
category: backend
stack: [http]
seniority: [jr, ssr]
fundamentals: true
---

A method is **idempotent** when sending the same request once or many times leaves the server in the same state.

- Idempotent: `GET`, `HEAD`, `OPTIONS`, `TRACE`, `PUT`, `DELETE`.
- Not idempotent: `POST`. `PATCH` is not guaranteed to be idempotent.
- Idempotent is not the same as safe: `PUT` and `DELETE` change state, but repeating them does not change it further. The response may differ (a second `DELETE` can return `404`).

It matters because clients, proxies, and retry logic can safely resend idempotent requests after a timeout. For `POST`, APIs often add an idempotency key to make retries safe.
