# Question concepts coverage

Objective: every question links to at least one concept page with the theory needed to answer it. Branch `feat/question-concepts`. Delivery: `ask-on-risk`, chain strategy `stacked-to-main` (cached from interview-prep-mvp). Test runner: Vitest (`pnpm test`).

## Specs

- S1. User (verbatim): "asegurate que todos los temas que se cubren en las preguntas esten de la parte de conceptos, ya que si no se sabe alguna respuesta se pueda ir a hacer un repaso teorico de la misma para poder contestarla."
- S2. Accepted mapping (18 new concepts, 2026-11-16):
  - `binary-search`: binary-search-complexity, binary-search-off-by-one, int-overflow-midpoint
  - `hash-tables`: hashmap-get-complexity, hashmap-treeify
  - `dynamic-arrays`: arraylist-insert-at-start
  - `graph-traversal`: bfs-data-structure
  - `recursion`: fibonacci-missing-base-case
  - `quicksort`: quicksort-worst-case
  - `modifying-collections-while-iterating`: splice-while-iterating, concurrent-modification-foreach
  - `java-exceptions`: checked-vs-unchecked-exceptions, finally-runs-before-return
  - `http-method-semantics`: http-idempotent-methods
  - `java-reference-equality`: integer-cache-equality, string-identity-vs-equals
  - `spring-beans`: spring-constructor-injection, spring-default-bean-scope
  - `spring-transactional-proxies`: transactional-self-invocation
  - `js-array-sort`: default-array-sort
  - `js-event-loop`: event-loop-microtasks
  - `floating-point-numbers`: floating-point-sum
  - `js-equality-and-types`: null-undefined-equality, typeof-null
  - `react-state`: react-state-snapshot, react-mutating-state-array
  - `typescript-unknown-vs-any`: typescript-unknown-vs-any
  - `js-hoisting-and-scope`: var-hoisting, var-closure-in-loop (keeps `js-closures`)
- S3. Same rules as T1.C1: each concept cites official docs (every URL checked), every code example executed, theory explains the concept and never the question's answer, nothing unverifiable (prior user rule: "Prefiero que tengamos menos pero verificado antes que empezar a inventar cosas").
- S4. CI rule: every question needs at least 1 concept (same as exercises).
- S5. User (verbatim): "que se muestre como link algo para viajar a la teoria y hacer un repaso en caso de no saber contestarla, porque sino es facil, aprietan cualquier opcion y listo. No quiero que sea necesario." Concept links visible before answering, without having to answer.
- S6. User (verbatim): "quiero que tambien saquemos la opcion de \"repetir pregunta\"". Remove the retry button and its `r` shortcut; an answer is final.

## Tasks

| ID  | Specs  | Route                                                 | Status | Commit     |
| --- | ------ | ----------------------------------------------------- | ------ | ---------- |
| T1  | S2, S3 | delegated writer (parallel unit: algorithms concepts) | done   | `87b80ef`  |
| T2  | S2, S3 | delegated writer (parallel unit: backend concepts)    | done   | `789a33c`  |
| T3  | S2, S3 | delegated writer (parallel unit: frontend concepts)   | done   | `8ea0527`  |
| T4  | S4     | inline (schema rule + tests + CONTRIBUTING)           | done   | see Log L4 |
| T5  | S5, S6 | inline (question page + README)                       | done   | see Log L5 |

Route evidence: T1–T3 are independent units with disjoint edit surfaces (own concept files and own question files), each 6–7 researched concepts with executed examples (several minutes each); launched together. T4 is small and runs inline after T1–T3 so content tests stay green.

## Log

- L1 (2026-11-16, verbatim): "perfecto, ya cerre el PR, antes de continuar quiero que hagamos un par de cosas. En primer lugar, asegurate que todos los temas que se cubren en las preguntas esten de la parte de conceptos, ya que si no se sabe alguna respuesta se pueda ir a hacer un repaso teorico de la misma para poder contestarla."
- L2 (2026-11-16): mapping and CI rule proposed; user (verbatim): "si, hagamoslo". PR #18 merged (`09dbf48`); branch `feat/question-concepts` from `main`.
- L3 (2026-11-16): T1–T3 done by 3 parallel writers. 19 concept files (~1580 lines); all 30 questions now have `concepts`. Every reference URL fetched (200) with anchors confirmed; JS examples run on Node 24.13, Java on JDK 21.0.11, TS compiled with `tsc --strict --ignoreConfig` (TS 6 refuses single files next to a `tsconfig.json` otherwise, TS5112); React and Spring snippets not runnable here, checked against react.dev / Spring reference, no output claimed. Parent unified Java doc links to SE 25 (existing concepts use SE 25): 27 Oracle URLs re-fetched, 200 and every anchor present; JLS 5.1.7 and 14.20.2 text spot-checked in SE 25. Dropped as unverifiable (examples): "quicksort is not stable", "DFS is the basis for cycle detection", field injection "cannot be final", "any is useful when migrating JS". Known tradeoff: for single-fact theory questions (e.g. BFS data structure, typeof null, default bean scope, idempotent methods) the concept necessarily states the fact; examples never reuse the question's snippet or options. Gotcha: Windows `curl.exe` cannot write to Git Bash `/tmp` paths; use `cygpath -w`.
- L4 (2026-11-16): T4 inline. `baseSchema.concepts` is now `.min(1)` (questions and exercises); the exercise-only `.extend` was removed as redundant. RED: 4 failed (questions without or with empty `concepts` accepted). GREEN: 90 tests. Integrity fixture got a concept (a question without one is now invalid by S4). Negative check on real content (reverted): removing `concepts` from `algorithms/quicksort-worst-case.md` → `algorithms/quicksort-worst-case.md: concepts: Invalid input: expected array, received undefined`. Checks: format, lint, `astro check` 0 errors, 90 tests, build 60 pages; built question page links `/conceptos/quicksort/`. CONTRIBUTING: steps, frontmatter example and table, Conceptos section. Committed with this log entry.
- L5 (2026-11-16): T5 inline. Question page: a `nav.theory` ("¿No sabes cómo responder? Repasa la teoría:") with every concept link sits between the answer inputs and "Nueva pregunta", visible before and after answering; the "Conceptos" list inside the hidden explanation was removed (no duplicate). Retry button, its `r` key and status-bar entry removed; after answering, picks stay disabled, the textarea read-only and focus moves to "Nueva pregunta". README shortcuts: `r` replaced by `n` (it was missing since PR #18) plus a line on final answers and the theory link. Test-first exception: page script has no unit runner (no Playwright yet); checked in headless Chrome over CDP on the built site: theory link visible before answering (`/conceptos/quicksort/`), explanation hidden before; `a` answers (`✗ FAIL expected: c`), all picks disabled, explanation shown, focus on next; `r` and `b` afterwards change nothing; predict-output locks textarea and submit; `var-closure-in-loop` shows 2 links; theory link navigates to `/conceptos/binary-search/`; `n` still opens another question; no horizontal overflow at 390px. Checks: format, lint, `astro check` 0 errors/0 warnings, 90 tests, build 60 pages.
- L6 (2026-11-16): independent verifier on `e0b87bd` vs `HEAD~1`: S5 PASS, S6 PASS, no blockers, no regressions (shortcuts `i p e c t`, option letters, `n`, Ctrl+Enter, textarea typing). Advisories, pre-existing: 12–19px overflow at 390px from the long file path in the status bar on 2 questions; option `c` wins over the `c` tab shortcut on multiple-choice pages. Minor in new code: Ctrl+Enter after answering re-grades the same read-only text (same result).
