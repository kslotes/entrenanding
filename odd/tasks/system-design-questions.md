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

- [x] T1 `caching-strategies` — questions: `cache-aside-read-miss` (who loads the value on a miss), `cache-invalidation-on-update` (delete the key on update instead of rewriting it) Commit `8c28de9`.
- [x] T2 `stateless-services` — questions: `in-memory-session-load-balancer` (users logged out behind round-robin; move the session to a shared store) Commit `a858a40`.
- [x] T3 `database-replication` — questions: `read-replica-lag` (stale read after a write with async replicas; read-your-writes) Commit `474d3d1`.
- [x] T4 `database-sharding` — questions: `shard-key-hotspot` (shard by creation date sends all writes to one shard), `modulo-sharding-rebalance` (hash mod N moves most keys when N changes; consistent hashing) Commit `92ebdeb`.
- [x] T5 `cap-theorem` — questions: `cap-network-partition` (during a partition you pick consistency or availability) Commit `b1d8e26`.
- [x] T6 `message-queues` — questions: `at-least-once-duplicates` (consumer must be idempotent), `queue-load-leveling` (queue absorbs a traffic spike for a slow worker) Commit `c40c06e`.
- [x] T7 `rate-limiting` — questions: `token-bucket-burst` (token bucket allows bursts up to its capacity) Commit `b13edea`.

## Log

- L1 (2026-11-22) User request: see S1. Created this document with 7 tasks (7 concepts, 10 questions).
- L2 (2026-11-22) T1-T7 done in one session (inline, Risk: none). Every reference URL returned HTTP 200 (MySQL docs dropped: 403 to automated fetches). Claims checked against the fetched sources: Azure cache-aside (write the store, then invalidate; order matters), ElastiCache (three trips per miss), Facebook Memcache paper (deletes are idempotent), Twelve-Factor (sticky sessions), NGINX (round-robin default, leaky bucket in `limit_req`), PostgreSQL (streaming replication async by default, `remote_apply`), RDS (async read replicas), MongoDB (monotonic shard keys), Cassandra (naive modulo remaps almost all keys), Gilbert and Lynch, Brewer ("2 of 3" misleading), DynamoDB read consistency, SQS and RabbitMQ (idempotent consumers), API Gateway (token bucket rate and burst), RFC 6585 (429). Modulo table (9 of 12 keys move from 3 to 4 shards) computed by hand and checked with the 1/(N+1) formula; the token bucket code ran on JDK 21 (10 of 15 at t=0, 5 more at t=1s). Checks: format, lint, `astro check` 0 errors, 90 tests, build 77 pages (10 under `/preguntas/system-design/`). Negative check (reverted): unknown concept slug -> `system-design/token-bucket-burst.md: unknown concept "rate-limitting"`. Also closed the MVP open items (see `interview-prep-mvp.md`, 2026-11-22).
