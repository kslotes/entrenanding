# System design questions

Objective: seed the empty `system-design` category with 10 multiple-choice questions, each linked to a concept page in the content-quality standard. Branch `feat/system-design-questions`. Delivery: `ask-on-risk` (content only). Checks: `pnpm format:check`, `pnpm test`, `pnpm build`.

## How to resume (one task per session)

Prompt to use: "Continuá con `odd/tasks/system-design-questions.md`: hacé la próxima tarea pendiente."

1. Read this file until `## Log`, and the standard in `odd/tasks/content-quality-rewrite.md` (`### Standard`), with `src/content/concepts/http-method-semantics.md` and `src/content/questions/backend/http-idempotent-methods.md` as templates.
2. Take the first `[ ]` task. Write its concept file and every question listed in it.
3. Run the checks, mark the task `[x]` with its commit, append one Log line, and stop.

## Specs

- S1. User (verbatim, 2026-11-22): "quiero uqe agreguemos 10 preguntas a system-design con respuestas multiple choice, siempre verificando que tambien esten los conceptos de cada una de las preguntas, con el formato que ya venimos trabajando"
- S2. Every question: `type: multiple-choice`, `category: system-design`, path `src/content/questions/system-design/<slug>.md`, `concepts` with at least one existing slug. Body follows the question standard (answer first, code or diagram, why, one line per wrong option).
- S3. Every concept: `src/content/concepts/<slug>.md` in the concept standard (problem first, terms defined, code for wrong and right way, `## En la entrevista` with answered `###` questions), `references` to official docs or primary sources; every URL checked (HTTP 200) and every claim checked against them.
- S4. Assumption: all questions are `fundamentals: true` (no evidence needed), `stack: []` unless the question depends on one technology. Topics below are the parent's proposal; the user can change them.

## Tasks

Each task = one concept + its questions. Route: inline, Risk: none (Markdown content only).

- [ ] T1 `caching-strategies` — questions: `cache-aside-read-miss` (who loads the value on a miss), `cache-invalidation-on-update` (delete the key on update instead of rewriting it)
- [ ] T2 `stateless-services` — questions: `in-memory-session-load-balancer` (users logged out behind round-robin; move the session to a shared store)
- [ ] T3 `database-replication` — questions: `read-replica-lag` (stale read after a write with async replicas; read-your-writes)
- [ ] T4 `database-sharding` — questions: `shard-key-hotspot` (shard by creation date sends all writes to one shard), `modulo-sharding-rebalance` (hash mod N moves most keys when N changes; consistent hashing)
- [ ] T5 `cap-theorem` — questions: `cap-network-partition` (during a partition you pick consistency or availability)
- [ ] T6 `message-queues` — questions: `at-least-once-duplicates` (consumer must be idempotent), `queue-load-leveling` (queue absorbs a traffic spike for a slow worker)
- [ ] T7 `rate-limiting` — questions: `token-bucket-burst` (token bucket allows bursts up to its capacity)

## Log

- L1 (2026-11-22) User request: see S1. Created this document with 7 tasks (7 concepts, 10 questions).
