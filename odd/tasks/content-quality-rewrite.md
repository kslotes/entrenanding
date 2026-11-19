# Content quality rewrite

Objective: rewrite every concept and question explanation to the plain-language, code-first standard validated on `spring-beans`. Work one task (one concept group) per session to keep token usage low. Branch `feat/question-concepts`. Delivery: `ask-on-risk`. Checks: `pnpm format:check`, `pnpm test`, `pnpm build`.

## How to resume (one task per session)

Prompt to use: "Continuá con `odd/tasks/content-quality-rewrite.md`: hacé la próxima tarea pendiente."

1. Read this file until `## Log`, and the reference template: `src/content/concepts/spring-beans.md` and `src/content/questions/backend/spring-default-bean-scope.md`.
2. Take the first `[ ]` task. Rewrite its concept file and every question listed in it. Do not touch other tasks.
3. Run the checks, mark the task `[x]`, append one Log line, and stop.

## Specs

- S1. User (verbatim, 2026-11-17): "en la explicación me gustaría que se encuentren ejemplos en código también y no exclusviamente teoría, ya que no me queda claro a qué parte de la aplicación estamos hacienod alusión ni tampoco para qué es útil que esto se maneje así."
- S2. User (verbatim): "tampoco entiendo que es "sin estado", ni "seguro para hilos". Todo esto la idea es explicarlo ya que el motivo de todo este proyecto es aprender las cosas a fondo, en lenguaje simple y aplicable a la practica."
- S3. User (verbatim): "en la parte del concepto hay 3 preguntas de entrevista pero ninguna tiene una respuesta, ni teórica ni con ejemplo de codigo."
- S4. User (verbatim): "en lugar de aplicar todas las correciones juntas quiero que hagas un .md para poder ir haciendolo de a partes ya que el uso de tokens para esto es brutal"

### Standard (derived from S1-S3, validated by the user on the template)

Concept files (`src/content/concepts/*.md`):

- Open with **the problem it solves**, with a short code example of life without it.
- Define every technical term the first time it appears, in plain language. Never assume the reader knows it.
- For each rule, say **why** it works that way and **where in a real app** it shows up.
- Show code for the wrong way and the right way, with a comment on the line that matters. Use a timeline or step trace when the bug depends on order or timing.
- `## En la entrevista`: each question is a `###` heading followed by a direct answer and, when it helps, code.
- Keep existing `references`; add an official reference when a new claim needs one. Verify claims against official docs.

Question explanations (`src/content/questions/**/*.md` body):

- First sentence: the correct answer and the core reason.
- A short code example showing the behavior.
- **Why** it works that way, and the practical consequence, in plain language.
- One line per wrong option explaining why it is wrong.
- Shorter than the concept; the full detail lives in the concept page.

Language: Spanish, neutral register (tú), code identifiers in English.

## Tasks

Each task = one concept file + the questions that link to it.

- [x] T1 `spring-beans` — questions: spring-default-bean-scope. Template, validated by the user.
- [x] T2 `spring-beans` (remaining) — questions: spring-constructor-injection. Concept already covered by T1.
- [x] T3 `spring-transactional-proxies` — questions: transactional-self-invocation
- [x] T4 `java-reference-equality` — questions: integer-cache-equality, string-identity-vs-equals
- [x] T5 `java-exceptions` — questions: checked-vs-unchecked-exceptions, finally-runs-before-return
- [x] T6 `equals-hashcode-contract` — questions: equals-overload-hashset
- [x] T7 `http-method-semantics` — questions: http-idempotent-methods
- [x] T8 `modifying-collections-while-iterating` — questions: concurrent-modification-foreach, splice-while-iterating
- [x] T9 `binary-search` — questions: binary-search-complexity, binary-search-off-by-one, int-overflow-midpoint
- [x] T10 `hash-tables` — questions: hashmap-get-complexity, hashmap-treeify
- [x] T11 `dynamic-arrays` — questions: arraylist-insert-at-start
- [x] T12 `graph-traversal` — questions: bfs-data-structure
- [x] T13 `recursion` — questions: fibonacci-missing-base-case
- [x] T14 `quicksort` — questions: quicksort-worst-case
- [x] T15 `js-equality-and-types` — questions: null-undefined-equality, typeof-null
- [x] T16 `js-hoisting-and-scope` — questions: var-hoisting
- [x] T17 `js-closures` — questions: var-closure-in-loop
- [x] T18 `js-event-loop` — questions: event-loop-microtasks
- [x] T19 `js-array-sort` — questions: default-array-sort
- [x] T20 `floating-point-numbers` — questions: floating-point-sum
- [x] T21 `react-state` — questions: react-mutating-state-array, react-state-snapshot
- [x] T22 `typescript-unknown-vs-any` — questions: typescript-unknown-vs-any
- [x] T23 `bigdecimal-money` — no linked questions
- [x] T24 `value-objects` — no linked questions
- [x] T25 `debounce-throttle` — no linked questions

Route: inline, one task per session. Risk: none (Markdown content only; RDD assess returns `passive`).

## Log

- L1 (2026-11-17) User request: see S1-S3.
- L2 (2026-11-17) T1 done: rewrote `spring-beans` concept and `spring-default-bean-scope` explanation. Checks: prettier OK, 90 tests OK, build 60 pages OK. User: "ahora si me gusta mucho mas".
- L3 (2026-11-17) User asked to split the work into parts (S4). Created this document.
- L4 (2026-11-17) T2 done: rewrote `spring-constructor-injection` explanation (answer + code, three reasons from the docs, test with `new`, one line per wrong option). Concept unchanged: T1 already covers injection forms and the interview answer. Checks: prettier OK, 90 tests OK, build 60 pages OK.
- L5 (2026-11-17) T3 done: rewrote `spring-transactional-proxies` (problem with manual commit/rollback, terms defined: transacción, proxy, AOP, advice, CGLIB, weaving, checked exception; self-invocation batch-import bug and fix in another bean; checked-exception commit example; three interview answers) and `transactional-self-invocation`. Added Spring Boot AOP reference for the CGLIB default. Checks: prettier OK, 90 tests OK, build 60 pages OK.
- L6 (2026-11-17) T4 done: rewrote `java-reference-equality` (problem: `Long` id compared with `!=` passes tests and fails with ids > 127; terms defined: primitivo, objeto, referencia, wrapper, autoboxing, unboxing, identidad vs igualdad, pool, literal, expresión constante; `Objects.equals`, null unboxing from `Map.get`, `role == "ADMIN"` from a request; three interview answers) and both questions. Predict-output questions have no options, so "one line per wrong option" became "las respuestas tentadoras". Added `Objects.equals` reference.
- L7 (2026-11-17) T5 done: rewrote `java-exceptions` (problem: ignored error codes; terms defined: excepción, lanzar, capturar, propagar, pila de llamadas, recurso; checked vs unchecked with the compiling version, why both exist, wrapping in `UncheckedIOException`, link to `@Transactional` rollback; finally/return step trace and the `return` in finally that swallows an exception; manual close vs try-with-resources; three interview answers) and both questions. Added JLS 14.17 and `UncheckedIOException` references.
- L8 (2026-11-17) T6 done: rewrote `equals-hashcode-contract` (problem: HashSet keeps CSV duplicates; terms defined: equals, hash, bucket, colisión, sobrescribir, sobrecargar, inmutable; two-step lookup; equals without hashCode; overload vs override with `@Override`; mutable key lost in a set; records and the array-component surprise; three interview answers) and `equals-overload-hashset`. Added JLS 8.4.8.1, JLS 9.6.4.4 and `Set` references.
- L9 (2026-11-17) T7 done: rewrote `http-method-semantics` (problem: timeout plus retry charges a payment twice; terms defined: método, recurso, estado, timeout, reintento, proxy, caché; method table; PUT set vs increment in Spring; idempotency key for POST; unsafe GET link vs `@DeleteMapping`; three interview answers) and `http-idempotent-methods`. Added RFC 9110 9.3.4 and the IETF `Idempotency-Key` draft references.
- L10 (2026-11-17) T8 done: rewrote `modifying-collections-while-iterating` (problem: cart filter keeps an out-of-stock item; terms defined: recorrer, índice, iterador, mutar, modificación estructural; splice step table; for-each desugaring; how `modCount` detection works; single-thread CME; silent early exit traced; removeIf, iterator, stream filter; three interview answers) and both questions. Added `AbstractList.modCount` reference.
- L11 (2026-11-17) T9 done: rewrote `binary-search` (problem: linear search over a million sorted prices; terms defined: ordenado, índice, intervalo, O grande, log₂, off-by-one, desbordamiento; step table and closed-interval code; real uses incl. `git bisect`; mixed-convention AIOOBE trace; why the safe midpoints work; insertion point `- 1`; three interview answers) and its three questions. Added `git bisect` reference. Arithmetic re-verified by hand.
- L12 (2026-11-17) T10 done: rewrote `hash-tables` (problem: nested loops joining orders and customers vs a map by id; terms defined: clave/valor, hash, bucket, colisión, lista enlazada, árbol balanceado, O(1)/O(n), capacidad; why the bit mix exists; resize threshold table; `HashMap.newHashMap`; why `MIN_TREEIFY_CAPACITY` exists; four interview answers) and both questions. Bucket indices re-verified with a Java-hash script. Added `HashMap.newHashMap` reference.
  Correction during T10: treeified bins only reach O(log n) when same-hash keys are `Comparable`; the treeify question example now implements it and the concept states the caveat.
- L13 (2026-11-17) T11 done: rewrote `dynamic-arrays` (problem: fixed-size array overflow; terms defined: arreglo, contiguo, índice, arreglo dinámico, size, capacidad, O(1)/O(n), amortizado; growth diagram 4 -> 6; presizing; shift trace for `add(0, x)`; O(n²) newest-first timeline and fixes with `Collections.reverse` / `List.reversed`; circular-array diagram for `ArrayDeque`; three interview answers) and `arraylist-insert-at-start`. Added `List.reversed` reference.
- L14 (2026-11-17) T12 done: rewrote `graph-traversal` (problem: friend suggestions by hop count with a cycle; terms defined: grafo, nodo, arista, dirigido, vecinos, lista de adyacencia, ciclo, distancia, cola, pila; infinite loop without "seen"; explicit graph literal incl. `F` so `graph.get` never returns null; BFS step table; real uses; DFS order and uses incl. `Files.walk`; weighted counterexample and Dijkstra; three interview answers) and `bfs-data-structure`. Added `Files.walk` reference.
- L15 (2026-11-17) T13 done: rewrote `recursion` (problem: counting a category tree of unknown depth; terms defined: función recursiva, caso base, caso recursivo, pila de llamadas, frame, StackOverflowError; sumDigits trace; factorial stack diagram down and up; why infinite recursion fails instead of hanging; deep-but-correct recursion and explicit stack; fixed `isEven`; fib call tree, both base cases, repeated work and iterative version; three interview answers) and `fibonacci-missing-base-case`. Counts re-verified: fib(40) makes 331 160 281 naive calls.
- L16 (2026-11-17) User asked for five tasks in one go ("haz 5 puntos del tiron"). T14-T18 done:
  - T14 `quicksort`: problem (same input order 50x slower), terms, partition trace, balanced vs unbalanced diagram, randomized pivot code, stability in `List.sort`; question rewritten. Lomuto counts (499500 reversed and all-equal) and partition trace re-verified with a script; the right side of the trace is `[7, 9]`.
  - T15 `js-equality-and-types`: problem (`input.value == 0` true for an empty field), terms, primitives vs references, `typeof user === "object"` with null, non-transitive `==`, `value == null`, `Number.isNaN`; both questions rewritten. Examples verified in Node.
  - T16 `js-hoisting-and-scope`: problem (`var discount` inside `if` gives NaN), terms, block vs function scope with the let and correct versions, hoisting rewrite, TypeError vs ReferenceError, TDZ purpose; `var-hoisting` rewritten.
  - T17 `js-closures`: problem (click handler remembering `productId`), terms, `once` helper, loop handlers with var vs let, method passed to `setInterval`; `var-closure-in-loop` rewritten. Verified in Node that a timer callback's `this` is the Timeout object, not undefined; text says so (window in browsers). Added `bind` reference.
  - T18 `js-event-loop`: problem (frozen "Procesando..."), terms, loop diagram, step trace, why microtasks exist, busy-wait delaying a timer, chunking with `setTimeout` (not `await Promise.resolve()`), Web Worker; `event-loop-microtasks` rewritten. Outputs verified in Node.
    Wording: replaced "recién" with "solo" to keep the neutral register.
- L17 (2026-11-17) User: "perfecto, continua con 5 mas". T19-T23 done:
  - T19 `js-array-sort`: problem (price table sorted as text), terms, why default sort uses strings, object comparator, `localeCompare` with accents, boolean-comparator bug, stability use, `toSorted` and React; `default-array-sort` rewritten. Outputs verified in Node.
  - T20 `floating-point-numbers`: problem (ten 0.10 items miss the free-shipping threshold), terms, scaled tolerance, unsafe 64-bit ids, cents, `toFixed(1.005)` gotcha, `Intl.NumberFormat`; `floating-point-sum` rewritten. Outputs verified in Node. Added `Intl.NumberFormat` reference.
  - T21 `react-state`: problem (stale count and mutated array), terms, render timeline, queue example, object spread, shallow-copy bug with nested objects; `react-mutating-state-array` and `react-state-snapshot` rewritten (the batching option now explains it changes render count, not the value).
  - T22 `typescript-unknown-vs-any`: problem (API shape change crashes with `any`), terms, guarded version of the example, assertions, typed `catch`; question rewritten. TS18046 and TS2322 verified with `tsc --strict` in a scratch dir.
  - T23 `bigdecimal-money` (no linked questions): problem (ten 0.10 charges in double), terms, immutability bug, `compareTo` for amounts, tax and division examples, splitting 100.00 in three without losing a cent, `Currency`-driven scale. All outputs verified with a scratch Java 21 program.
- L18 (2026-11-17) User: "perfecto, terminalas". T24-T25 done (no linked questions):
  - T24 `value-objects`: problem (a `final Date` field changed from outside), terms, entity vs value object, validated and normalized `Email`, `LocalDate` returning new instances, corrected `Promotion` with defensive copies, record with `List.copyOf`; three interview answers. Removed the voseo "Mencioná". Examples verified with a scratch Java 21 program; the epoch comment avoids a timezone-dependent date string. Added `List.copyOf` reference.
  - T25 `debounce-throttle`: problem (one request per keystroke, out-of-order responses), terms, `debounce` and `throttle` implementations, `this` and args handling, lost trailing call in simple throttle, React cleanup with `cancel()`; three interview answers. Implementations verified in Node (single call with "react", `this` kept, `cancel` works, throttle limits rate).
    All 25 tasks done. Pending: commit (not requested yet) and the Engram mirror of this document.
- L19 (2026-11-19) User: "vayamos dividiendolo para que quede en tamaños coherentes por cada PR". Delivered as 12 independent PRs to `main` (branches `docs/rewrite-01` to `docs/rewrite-12`), each one or more related concepts with their questions, 237–400 changed lines; this document travels in slice 03. RDD assess: `passive`. Checks on the full change: format, tests, build 60 pages.
