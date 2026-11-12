# Interview Prep Webapp — MVP

Working name: **entrenanding** (provisional, may change before public launch).

## Objective

Build an open-source webapp that helps people learn, practice, and prepare for job interviews, with a job-oriented focus: content must be applicable to real work, and theoretical topics (beyond the fundamentals needed to understand tools/languages) must be backed by evidence that they recur in real interviews.

## Problem / Why

- Interview prep content is scattered, often outdated, or not grounded in what is actually asked.
- The project should be a community contribution: open source, contributions via Pull Requests.
- Initial budget is close to zero: infrastructure cost must be ~$0 for the MVP.

## Decisions (accepted)

| Decision                                                                                                                                                                                                                                                                                      | Rationale                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content-as-code**: questions and answers live in the repo as Markdown/MDX                                                                                                                                                                                                                   | No CMS, no DB for content; community contributes via PRs (same model as roadmap.sh)                                                                                                                                                                                                               |
| ~~**Progress stored in `localStorage` only** for the MVP~~ **Superseded 2026-11-12: no progress is stored**; answered questions start fresh so the learner can repeat them and check retention. Owner decision                                                                                | No backend needed; behind a `ProgressRepository` port so a cloud adapter can be added later                                                                                                                                                                                                       |
| **No code execution in the MVP**                                                                                                                                                                                                                                                              | Sandboxing, per-exercise tests, feedback, and contributor burden are high effort; deferred to a dedicated later phase                                                                                                                                                                             |
| **Question `type` discriminator** in the content schema                                                                                                                                                                                                                                       | Allows adding `type: exercise` later without breaking existing content                                                                                                                                                                                                                            |
| **Evidence required** for theoretical questions                                                                                                                                                                                                                                               | Enforces the "verified recurring in interviews" goal; CI rejects PRs without it                                                                                                                                                                                                                   |
| ~~**Bilingual: Spanish + English** (UI and content)~~ **Superseded 2026-11-04: Spanish only** (docs, content, UI, exercise statements, test display names, learner-facing comments). Technical terms, identifiers, commit messages and internal code comments stay in English. Owner decision | Wider community reach; Astro native i18n routing (`locales: ["es", "en"]`, `prefixDefaultLocale: true` → `/es/...`, `/en/...`), no extra i18n library                                                                                                                                             |
| **MVP ships only auto-graded types** (`multiple-choice`, `predict-output`, `spot-the-bug`)                                                                                                                                                                                                    | Questions the app cannot verify as correctly answered add no value yet. `open`, `behavioral`, `system-design` types and the `behavioral` category return with AI answer evaluation (BYOK) in Phase 3+. `system-design` stays as a category (asked as multiple-choice). Owner decision, 2026-10-29 |

| **Local-first, no hosting**: users clone the repo and run the app locally (`pnpm dev`); code exercises live in the repo and are validated by tests (backend: JDK 25 + JUnit via Maven Wrapper; frontend: Vitest) | Main goal is practicing real Java backend; browser execution cannot run Spring/Quarkus and CheerpJ is unclear. Supersedes the Cloudflare Pages hosting and the browser-execution research. Owner decision, 2026-11-03 |
| **Single visual direction: "technical and raw"** (IDE/terminal aesthetic) | One look only, no switchable skins; keeps components, copy, and visual QA single-variant. Reference mockup: https://claude.ai/artifact/W7vETgpT8EFBc6a5ypDh6a (panel C) |

### Visual direction (accepted, details pending)

- IDE/terminal look: file-like tabs, status bar, `[a]`–`[d]` options, terse feedback (`✓ PASS` / `✗ FAIL expected: b`).
- Keyboard-first: every action has a shortcut; mouse and touch still fully supported.
- No gamification (XP, streaks, lives) in the MVP.
- Light and dark modes, both designed (light based on light IDE themes, not an inverted dark). Default follows `prefers-color-scheme`; a persistent toggle overrides it.
- Open: whether long-form text (model answers, system design guides) uses a proportional face for readability while chrome stays monospace.

### i18n approach (superseded 2026-11-04: Spanish only, i18n removed)

- Content: one file per locale, `src/content/questions/<locale>/<category>/<slug>.md`; the same `slug` across locales identifies the same question.
- CI checks metadata parity between translations (type, category, stack, seniority, evidence) so translations cannot drift.
- A question may exist in one locale only; the UI shows a "not yet translated" notice with a link to the available locale and to contributing a translation.
- UI strings live in typed dictionaries (`src/i18n/{es,en}.ts`); a missing key fails typecheck.
- Root `/` redirects based on `Accept-Language`, with a persistent language switcher.

### Known `localStorage` limitations (superseded 2026-11-12: no progress is stored)

- ~5 MB per origin (enough for ~100k progress records of ~50 bytes).
- Safari ITP deletes script-writable storage after 7 days without user interaction.
- Cleared in private mode, by the user, or under storage pressure; no cross-device sync.
- Mitigation: JSON export/import; cloud sync in a later phase.

## Tech stack (proposed)

| Layer     | Choice                                  | Notes                               |
| --------- | --------------------------------------- | ----------------------------------- |
| Framework | Astro + React islands + TypeScript      | Content-heavy, mostly static output |
| Content   | Astro Content Collections + Zod         | Schema validation in CI             |
| Tests     | Vitest + Playwright                     |                                     |
| Hosting   | None (local-first, decision 2026-11-03) | Users run `pnpm dev` locally        |
| CI        | GitHub Actions                          | Free for public repos               |
| Licenses  | MIT (code) + CC BY-SA 4.0 (content)     | Confirm before publishing           |

## Content model

Categories: `algorithms`, `frontend` (React, Vue, Angular, ...), `backend` (focus: Java with Spring/Quarkus), `system-design`. The `behavioral` category is deferred to Phase 3+ (AI evaluation).

Question types (no execution required):

| Type              | Grading                              |
| ----------------- | ------------------------------------ |
| `open`            | Deferred to Phase 3+ (AI evaluation) |
| `multiple-choice` | Automatic                            |
| `predict-output`  | Automatic (string comparison)        |
| `spot-the-bug`    | Automatic (selected line/option)     |
| `behavioral`      | Deferred to Phase 3+ (AI evaluation) |
| `system-design`   | Deferred to Phase 3+ (AI evaluation) |

Frontmatter sketch:

```yaml
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [ssr, sr]
fundamentals: false # true = no evidence required
evidence: # required (min 2) when fundamentals is false
  - type: interview-report # Glassdoor, Blind, public post
    url: https://...
  - type: job-posting
    url: https://...
```

## Roadmap

- **Phase 0 — Foundations:** repo, licenses, Astro + Zod schema, CI validating content and evidence, deploy to Cloudflare Pages.
- **Phase 1 — MVP:** browse by category/stack/seniority, the 3 auto-graded question types, seed content with evidence (~10 questions per category), code exercises validated by tests (backend: Maven multi-module + JUnit 6 on JDK 25 via `./mvnw`; frontend: Vitest).
- **Phase 2 — Study tools:** mock interview mode (N random questions + timer). Spaced repetition and progress export/import removed 2026-11-12: both need stored progress.
- **Phase 3+ — Later:** accounts + DB for sync and "I was asked this" votes, AI answer evaluation and mock interviews with BYOK (user-provided API key), which brings back the deferred self-assessed types `open`, `behavioral`, `system-design` and the `behavioral` category.

### Deferred research for executable practice (Phase 3+) — superseded 2026-11-03 by the local-first decision

- JS/TS and Python can run in the browser (Web Workers, Pyodide) at $0 infra cost; main cost is effort.
- Frontend frameworks: Sandpack — verify license and no-account usage.
- Pure Java: CheerpJ (WASM JVM) — license terms are ambiguous for commercial use and in-browser `javac` is unconfirmed; requires license review + PoC.
- Spring/Quarkus: cannot run in the browser realistically; options are non-execution question types plus template repos with tests run by GitHub Actions on the user's fork or GitHub Codespaces (user's own quota).
- Piston public API: rate limited, unclear auth, repo last pushed 2025-02; not suitable as a product dependency.

## T0.4 design (accepted 2026-10-29)

- Schema lives in a plain module (`src/content/schema.ts`) so it is unit-testable without `astro:content`; `src/content.config.ts` only wires it to the collection with the glob loader.
- Common fields: `title` (localized), `locale` (`es` | `en`, must match the path segment), `type`, `category`, `stack` (string[]), `seniority` (non-empty subset of `jr`, `ssr`, `sr`), `fundamentals` (boolean), `evidence` (min 2 when `fundamentals: false`; items `{ type: interview-report | job-posting, url }`).
- Discriminated union on `type`; type-specific fields:
  - `multiple-choice`: `options: { id, text }[]` (2–6, unique ids), `answer` = one option id.
  - `predict-output`: `code`, `language`, `expectedOutput`.
  - `spot-the-bug`: `code`, `language`, `bugLine` (1-based, within `code`).
  - Removed in T0.5b (deferred to Phase 3+): `open` (no fields), `behavioral` (`checklist`), `system-design` (`steps`, `rubric`).
- Body (Markdown) holds the explanation for every type.
- i18n: `locales: ["es", "en"]`, `defaultLocale: "es"` (assumption: Spanish-first audience; change is a one-line config edit), `prefixDefaultLocale: true`. Placeholder pages `/es/` and `/en/`; root `/` keeps a placeholder until the `Accept-Language` redirect lands.
- Typed UI dictionaries `src/i18n/{en,es}.ts`: `es` is typed against the keys of `en`, so a missing key fails `astro check`.
- Vitest moves from T0.6 into T0.4 so the schema is built test-first. T0.6 becomes content-integrity tests (locale matches path, metadata parity across translations).

## Phase 0 checklist

- [x] T0.1 Initialize git repository, default branch `main`, `.gitignore`, `.editorconfig`. Route: inline (3 mechanical config files, no research). Also added `.gitattributes` (LF) for Windows contributors. Commit `5e3dcac`. Checks: `git ls-files --eol` shows LF for all files. Review: assessed `medium`, `under_budget`; RDD off (global), no review.
- [x] T0.2 Add `LICENSE` (MIT) and content license (CC BY-SA 4.0), `README.md`, `CONTRIBUTING.md`, PR template. Route: delegated writer (7 non-trivial docs, incl. `README.es.md`, `CONTRIBUTING.es.md`). Checks: 15/15 relative links resolve, LF only, structural readback by parent. Licenses remain "confirm before publishing". Commit `ce3e318`. Review: assessed `high`, `review_due: true`; RDD off (global), no review started.
  - Open for T0.4: `title` and type-specific fields (options, expected output) are not in the frontmatter sketch yet; full `seniority` value set undefined (only `ssr`, `sr` shown).
  - Added conventions: slugs in English; commit messages in English.
- [x] T0.3 Scaffold Astro + TypeScript + React integration; configure lint/format. Route: delegated writer (10 config files + install). Stack: astro 7.4.4, @astrojs/react 7.1.2, react 19.3.1, TypeScript 6.0.3 (pinned: @astrojs/check requires <7), ESLint 10 flat + typescript-eslint + eslint-plugin-astro + react-hooks `flat.recommended`, Prettier 3 + prettier-plugin-astro, pnpm 10.28.2, Node >=24. Commits `e05b75f` (scaffold, 118 authored lines excl. lockfile) and `0f3bdaf` (Prettier pass on pre-existing Markdown, tables only). Checks (parent re-run): `pnpm check` 0 errors, `pnpm lint` clean, `pnpm format:check` pass, `pnpm build` 1 page. Test-first exception: scaffold has no behavior. Review: assessed `high`, `review_due: true`; RDD off (global), no review started.
- [x] T0.4 Define content collection schema with Zod (type discriminator, category, stack, seniority, fundamentals, evidence rule, locale) and configure Astro i18n (`es`, `en`). Route: delegated writer (schema, tests, i18n, pages, docs) + one inline parent correction (strict objects). Deps: vitest 5.0.5 (Vite 8.3.5 shared with Astro), Zod 4.6.7 via `astro/zod`. RED observed: `Failed to resolve import "./schema"`; later RED for 2 strict-object tests. GREEN: 22 tests. Checks (parent re-run): `pnpm check` 0 errors, lint clean, format:check pass, build 3 pages (`/`, `/es/`, `/en/`). Missing-key proof: deleting a key in `es.ts` fails `astro check` (ts2741). Known warning: glob loader warns until `src/content/questions/` exists (T0.5). Chosen minimums: `checklist`, `steps`, `rubric` need ≥1 item (fields removed in T0.5b); `stack` may be empty. Unknown frontmatter fields are rejected (strict objects).
- [x] T0.5 Add one sample question per type to validate the schema. Route: delegated writer (12 content files). Originally 6 slugs × `en`/`es` (12 files) covering all 5 categories; after T0.5b, 3 slugs × 2 locales = 6 files remain (var-closure-in-loop, spring-default-bean-scope, binary-search-off-by-one), and the evidence-backed samples were removed with their types. Fundamentals (`true`): var-closure-in-loop, spring-default-bean-scope, binary-search-off-by-one, http-idempotent-methods. Evidence-backed (`false`, 2 fetched `interview-report` URLs each): conflict-with-teammate, url-shortener. Weak spot: behavioral evidence comes from PracHub aggregator pages (Glassdoor/LeetCode return 403 to automated checks). No meaningful RED (content only); checks: build passes with 12 entries and no glob warning, check 0 errors, 22 tests, lint, format; negative check (`answer: z`) fails build with `InvalidContentEntryDataError`, then reverted. T0.4 delivered as PR #1 (merge a6d9d46).
- [x] T0.5b Remove self-assessed types from the MVP (owner decision: only auto-graded types). Route: delegated writer (schema, tests, docs, content removal). Schema drops `open`, `behavioral`, `system-design` variants and the `behavioral` category; `system-design` category stays. Removed samples (both locales): http-idempotent-methods, conflict-with-teammate, url-shortener. RED observed: 4 failed / 19 passed (deferred types and `behavioral` category still accepted). GREEN: 23 tests. Docs updated: CONTRIBUTING (en/es), README (en/es).
- [x] T0.6 Content-integrity tests: `locale` matches path segment, metadata parity across translations (same slug). (Vitest setup and schema unit tests moved into T0.4.) Route: delegated writer (pure module + 2 test files + docs). `src/content/integrity.ts` (no I/O) checks per file: `questionSchema`, `locale`/`category` vs folder, slug format; per `<category>/<slug>` across locales: `type`, `category`, `stack`, `seniority`, `fundamentals`, `evidence` (omitted = `[]`), `code`, `language`, `expectedOutput`, `bugLine`, `answer`, option ids in order. `src/content/questions.test.ts` loads real files via Vite `import.meta.glob` (`?raw`) instead of `node:fs`, because the project has no `@types/node` (adding it would change global types for the app); frontmatter split is strict and CRLF-safe. Dep: `yaml` 2.9.1 (exact, devDependency). RED observed: `Failed to resolve import "./integrity"`. GREEN: 47 tests (3 files). Negative checks on real content (reverted): `locale: en` in `es/frontend/var-closure-in-loop.md` → `es/frontend/var-closure-in-loop.md: locale "en" does not match folder "es"`; `bugLine: 4` in `es` binary-search only → `algorithms/binary-search-off-by-one.md: "bugLine" differs between en and es`. Checks: `pnpm check` 0 errors, lint clean, format:check pass, build 3 pages. Docs: CONTRIBUTING (en/es) Phase 0 note mentions `pnpm test`.
- [x] T0.7 GitHub Actions CI: install, lint, typecheck, test, build. Route: inline (one mechanical workflow file). `.github/workflows/ci.yml` runs on every PR and on push to `main`: `pnpm install --frozen-lockfile`, lint, format:check, check, test, build. Actions (latest majors, checked 2026-10-29): `actions/checkout@v7`, `pnpm/action-setup@v6` (pnpm version from `packageManager`; successor `pnpm/setup@v3` needs pnpm ≥11, project uses 10), `actions/setup-node@v7` (Node 24, pnpm cache). Read-only token, concurrency cancels superseded runs, 15 min timeout. Test-first exception: CI config has no runnable RED locally. Checks: same command sequence passes locally (exit 0, 3 pages built); workflow file passes Prettier. Commit `c00838b`, PR #4. First real run: `verify` passed in 28s (run 40886324588); only annotation is a notice that `ubuntu-latest` migrates to Ubuntu 26. Review: RDD off (global), no review.
- [x] ~~T0.8 Deploy to Cloudflare Pages (verify free-tier limits first).~~ Cancelled 2026-11-03: local-first pivot, no hosting.
- [x] T0.9 README (en/es): local-first positioning, prerequisites table (Git, Node 24+, pnpm 10, JDK 25 planned, Maven Wrapper planned), getting-started commands. Route: inline (docs only). Checks: `pnpm format:check`, relative links resolve.

## Phase 1 — Code exercises

Layout (accepted 2026-11-03): `exercises/backend` is a Maven multi-module project (one module per exercise, parent `pom.xml` with JDK 25, JUnit 6.1.3, AssertJ 3.27.7, Maven Wrapper 3.3.4 `only-script` pinned to Maven 3.10.0). Each exercise: `statement.md` (frontmatter: title, category, stack, seniority, fundamentals), starter code in `src/main/java`, tests in `src/test/java`, reference solution in `solution/src/main/java` (visible on purpose, also a learning aid). The `solution` profile swaps the source directory via the `exercise.sources` property (a profile cannot set `sourceDirectory` directly). `scripts/verify-exercises.mjs` (`pnpm verify:exercises`): starter must compile and fail ≥1 test per module; solutions must pass. Frontend exercises: `exercises/frontend`, Vitest project separate from `pnpm test`.

- [x] T1.E1 Backend exercise scaffold + first exercise `java-core/immutable-money` + verifier + CI job `backend-exercises` (`actions/setup-java@v6`, Temurin 25, Maven cache). Route: inline. Checks (local, portable Temurin 25.0.5): starter 14 tests, 13 fail; solution 14/14 pass; verifier exit 0; negative checks: solved starter → `java-core/immutable-money: starter code already passes all 14 tests`, HALF_UP in solution → `a reference solution fails its tests`; lint, format:check, 47 tests, build pass. Gotchas: in Git Bash, `./mvnw` fails when it picks Windows `curl.exe` (cannot open `/tmp` path), so Windows users use `mvnw.cmd`; Node `spawnSync` with `shell: true` needs the absolute `mvnw.cmd` path.
- [x] T1.L1 Spanish only: removed `en` content, `locale` field, translation parity checks, `src/i18n`, `/es/` and `/en/` pages, Astro i18n config; questions live at `src/content/questions/<category>/<slug>.md`; README, CONTRIBUTING, PR template and LICENSE-CONTENT summary in Spanish (LICENSE MIT text stays English, legal text); exercise has a single `statement.md`. Route: inline. RED observed: 10 failed (new path rule, removed `locale`). GREEN: 35 tests. Checks: format, lint, `astro check` 0 errors, build 1 page, `pnpm verify:exercises` exit 0 (starter 13/14 fail, solution 14/14).
- [x] T1.C1 Concepts collection (theory per concept, decision 2026-11-04): `src/content/concepts/<slug>.md` citing official docs; exercises and questions reference `concepts: [...]`; CI: each exercise needs ≥1 concept and every referenced slug exists. Theory explains concepts, never the exercise solution. Done: `conceptSchema` (title, stack, references ≥1 `{title,url}`), `exerciseSchema` (common fields + `concepts` ≥1 slug), optional `concepts` on questions; `checkConcepts`, `checkExercises`, unknown-concept check in `checkIntegrity`; `content.test.ts` (renamed from `questions.test.ts`) validates real questions, concepts and `exercises/**/statement.md`; Astro collections `concepts` and `exercises`. First concepts: `value-objects`, `equals-hashcode-contract`, `bigdecimal-money` (every code example verified on Temurin 25.0.5; all reference URLs and anchors return 200). Statement gets a `## Teoría` section with relative links. Route: inline. RED: 12 failed (missing functions), then 2 failed on real content (no concepts yet). GREEN: 49 tests. Negative checks on real content: removed concept → `statement.md: unknown concept "value-objects"`; `concepts: []` → `concepts: Too small: expected array to have >=1 items`. Gotcha: Vitest 5 `fsModuleCache` (default true, `node_modules/.vitest-cache`) kept a stale `import.meta.glob` file list after files were added/removed, giving false results; disabled in `vitest.config.ts`.
- [x] T1.E2 Frontend exercise scaffold + first exercise `js-core/debounce` (concepts `js-closures`, `debounce-throttle`; question `var-closure-in-loop` now references `js-closures`). `vitest.exercises.config.ts` (separate from `pnpm test`); `pnpm exercise <path>` / `pnpm exercise:watch <path>`; `--mode solution` adds a resolver plugin that maps an exercise's `src/` imports to `solution/src/`. Verifier split into `backend` / `frontend` areas (CI: backend job runs `backend`, verify job runs `frontend`); frontend parses the Vitest JSON report per exercise; both areas now fail when an exercise folder lacks `statement.md` (found because the first run silently counted 0 exercises). ESLint ignores unused args in `exercises/frontend/**/src/**` (stubs). Route: inline. Checks: starter 9/9 fail, solution 9/9 pass; `pnpm verify:exercises` exit 0 (backend 1, frontend 1, Temurin 25.0.5); negative checks: solved starter → `js-core/debounce: el código inicial ya pasa los 9 tests`, broken solution → `frontend: una solución de referencia falla sus tests`, broken import → `js-core/debounce: un archivo de tests no carga`, unknown area → exit 2; lint, format, `astro check` 0 errors, 49 tests, build. Also replaced voseo with neutral `tú` in concepts and statements.
- [x] T1.E3 (covered by T1.C1) Exercises content collection: schema for `statement.md` + integrity tests (frontmatter, referenced concepts).
- [x] T1.E4 App pages listing exercises with statement and run command. Scope: home, `/ejercicios/` (grouped by area), `/ejercicios/<area>/<group>/<slug>/` (statement, run commands with copy, concepts), `/conceptos/` and `/conceptos/<slug>/` (references, exercises that use it). Answering questions in the app is a separate roadmap item. Visual direction per mockup panel C: editor window (tab bar, status bar), system monospace stack (no web fonts, local-first), light and dark designed, persistent theme toggle (`system` → `light` → `dark`, `localStorage` wrapped in try/catch, applied before paint), single-key shortcuts `i` `e` `c` `t` and `y` (copy command) ignored with modifiers or inside inputs. Pure helpers in `src/lib/exercises.ts` (id parsing, run commands, hrefs, concept link rewrite). Statements keep relative concept links (work on GitHub); a Sätteri hast plugin (`src/lib/concept-links-plugin.ts`) rewrites them to concept pages. Gotcha: Astro 7 defaults to the Sätteri Markdown processor and rejects `markdown.rehypePlugins` unless `@astrojs/markdown-remark` is installed; added `@astrojs/markdown-satteri` 0.4.6 (exact, already a transitive dep) to pass `hastPlugins`. Shiki dual themes (`github-light` / `tokyo-night`) with `defaultColor: false`, switched by CSS. `--font-prose` token keeps the open long-form font decision to one line. Route: inline. RED: `Cannot find module './exercises'` / `'./rehype-concept-links'`, later `'./concept-links-plugin'`. GREEN: 61 tests. Checks: lint, format, `astro check` 0 errors, build 10 pages; built HTML has no `src/content/concepts` links left; screenshots (desktop light/dark, 390px in iframes) fixed a mobile overflow and whitespace inside `<pre>`; CDP run in headless Chrome confirmed shortcuts, theme persistence across reload, return to system theme, copy to clipboard, Ctrl ignored. README: status and shortcuts. Commit `6bf1429`; review: assessed `high` (escalated item 5, new dependency), consent granted, lenses risk/readability/reliability, approved and acknowledged (lineage `review-a9abb9990553bf16`), 7 advisory findings. Fixed from them in `b299444` (assessed `medium`, `under_budget`): Windows command is `.\mvnw.cmd` (bare `mvnw.cmd` is not found by PowerShell) and a comment ties the two dark palette blocks. Open advisories: copy button copies only the command (backend needs `exercises/backend` as cwd); no automated check that the Sätteri plugin is wired in the build; hero sample session is hand-written.
- [x] T1.E5 CONTRIBUTING: how to add an exercise (Spanish only; i18n dropped 2026-11-04). Route: inline (docs only). Added "Cómo agregar un ejercicio" (8 steps: path rules, copy a base exercise, concepts, statement links and evidence, tests + solution first, starter code, register module + README row, verify). Checks: prettier, `pnpm exercise js-core/debounce --mode solution` 9/9; backend `-Psolution` command not run locally (JDK 21 only, needs 25). Commit `c9769d9`, PR #13 (main `9870a5c` after #12 and #13 merged).

## Phase 1 — Questions

- [x] T1.Q1 Answer questions in the app: `/preguntas/` (grouped by category) and `/preguntas/<category>/<slug>/` for the 3 auto-graded types. `multiple-choice`: `[a]`–`[f]` options with single-key selection. `predict-output`: textarea, submit with a button or Ctrl+Enter. `spot-the-bug`: numbered code lines, pick one. Terse feedback (`✓ PASS` / `✗ FAIL expected: b`), then the explanation (body) and concepts; retry. Pure grading in `src/lib/grading.ts`. Assumption: `predict-output` compares after normalizing line endings and trailing whitespace (per line and trailing blank lines); documented in CONTRIBUTING. Page shortcuts inside `<main>` win over tab shortcuts and disabled elements are skipped. New tab `preguntas` (key `p`). Route: inline. Done: `src/lib/grading.ts` (no imports, so the client bundle does not pull Zod), `src/lib/questions.ts` (id parsing, href, `codeLines`), `getQuestions`, `/preguntas/` and `/preguntas/<category>/<slug>/`, home section; the answer ships in the page (local-first, content is public). Also: `font-variant-ligatures: none` for `pre`/`code`/`textarea` site-wide (the monospace stack drew `<=` as `≤`), and on ≤520px the tab bar wraps to two rows so the 4 tabs fit. Docs: README status and shortcuts, CONTRIBUTING output comparison rule. RED: `Cannot find module './questions'`. GREEN: 73 tests. Checks: lint, format, `astro check` 0 errors, build 14 pages; CDP in headless Chrome: each type pass/fail/retry, expected output shown on fail, option keys win over tabs and give way once answered (`c` → `/conceptos/`), typing in the textarea does not trigger shortcuts, Ctrl+Enter submits, no horizontal overflow at 390px; differential check of existing shortcuts (`i e c p`, `y` copies, `t`, Ctrl ignored); screenshots light/dark/mobile.
- [x] ~~T1.Q2 Progress in `localStorage` behind a `ProgressRepository` port: last result per question, shown on the list; storage failures degrade silently.~~ Cancelled 2026-11-12: owner decision, no progress is stored. README updated (status, "Local y privado", roadmap). The theme preference stays in `localStorage` (UI setting, not progress).
- [x] T1.Q3 Browse by category/stack/seniority on `/preguntas/` (client-side filters, state in the query string). Done: pure `src/lib/question-filters.ts` (parse/serialize the query string, OR within a group and AND across groups, unknown values and duplicates dropped so a stale link never hides everything); toggle buttons (`aria-pressed`) for all categories, the stacks present in the content and all seniorities; count `# N de M preguntas`, categories without matches hidden while filtering, empty message, `limpiar filtros`; URL updated with `history.replaceState` (`?categoria=backend,frontend&stack=java`). Without JavaScript the panel stays hidden and the full list shows. Meta line now includes stack. README status updated. Route: inline. RED: `Cannot find module './question-filters'`. GREEN: 83 tests. Checks: lint, format, `astro check` 0 errors, build 14 pages; CDP in headless Chrome: OR/AND combinations, empty state, clear (focus returns to the first toggle), deep link with an unknown value cleaned from the URL, reload keeps filters, no JS shows all 3 items with the panel hidden, no horizontal overflow at 390px; screenshots desktop and mobile.
- [x] T1.Q4 Seed content: ~10 questions per category, with evidence when `fundamentals: false`. Agree scope and topics with the user before writing. Done: 27 new questions (9 each in `algorithms`, `frontend`, `backend`; 10 per category with the existing ones); `system-design` stays empty (scope agreed on the three categories). 4 are `fundamentals: false` with 2 `interview-report` items each (LeetCode Discuss): `event-loop-microtasks`, `react-state-snapshot`, `equals-overload-hashset`, `concurrent-modification-foreach`. Verification: every snippet executed (Node 24.13, JDK 21) and its output matches `expectedOutput`; the TypeScript snippet compiled with `tsc` (only the expected TS18046 error); `@Override` on an overloaded `equals` rejected by `javac`; exception hierarchy checked with `javap`; framework and spec claims checked against official docs (Spring reference, react.dev, TypeScript handbook, Java SE 21 Javadoc, JLS 5.1.7, OpenJDK `HashMap.java`, RFC 9110); claims without a source were removed. Evidence: quotes confirmed through LeetCode's public GraphQL API (pages return 403 to automated fetches); the user opened all 8 URLs in a browser and confirmed them. `@Transactional` self-invocation stays `fundamentals: true`: only 1 qualifying report found. Route: inline (content only, no RED: schema and content tests cover it). Checks: 83 tests, lint, format, `astro check` 0 errors, build 31 question pages. Commits `38f5553`, `9ab3bf1`, `8f20ff4` + evidence commit.

## Acceptance criteria (Phase 0)

- A PR with a theoretical question lacking evidence fails CI.
- A PR with valid content builds (no deploy: local-first).
- All three auto-graded question types validate against the schema; deferred types are rejected.

## Progress

- 2026-10-28: Planning completed. No code written yet. Working directory is not a git repository yet.
- 2026-10-28: Repo initialized; empty root commit on `main`; work happens on `feat/phase-0-foundations`. T0.1 done.
- 2026-10-28: T0.2 and T0.3 done. Branches restacked per delivery table (`feat/phase-0-foundations` renamed to `docs/project-docs`). Next: T0.4 on a new slice branch from `feat/astro-scaffold`.

- 2026-11-03: User request (verbatim): "quiero continuar con el tema de los ejercicios. Sigue sin conformarme esto de que sea en el navegador, ya que mi principal objetivo es practicar Java en backend. JS/TS solo para frontend. [...] no seria mejor simplemente clonar el proyecto, correrlo en una terminal y listo? que se levante un Front, explique de qué va el proyecto, tengamos a mano algunas preguntas teóricas multiple-choice, y luego pasar directmaente a ejercicios en código que estén validados con tests? tanto para front como back?" Follow-up (verbatim): "pivoteamos a 100% local. Todo lo que sea necesario instalar y pre-requisitos quiero que lo dejemos bien en claro en el readme." Decision recorded; T0.8 cancelled; T0.9 done. Assumptions: JDK 25 (current LTS), Maven Wrapper so Maven is not a prerequisite. Open: exercise layout and roadmap phase for code exercises.
- 2026-11-03: User (verbatim): "Si, van para el MVP. perfecto lo del JDK 25 y maven wrapper, es tal cual lo que queria". Code exercises move to Phase 1 (MVP); JDK 25 and Maven Wrapper confirmed (no longer assumptions). README roadmap (en/es) updated. Open: exercise layout.

- 2026-11-03: User (verbatim): "si, con riesgo a spoiler sin problema. De paso, la gente tambien puede ir consultando las soluciones para aprender por si no saben como hacer las cosas". Reference solutions live in the repo under `solution/`. T1.E1 done. Local machine has JDK 17 and 21 only; verification used a portable Temurin 25 in the session scratchpad.

- 2026-11-04: User (verbatim): "quiero que todos los ejercicios practicos, en algun lado tengan la teoria que los respaldan." Then: "Me gusta por concepto." Then: "no, esta bien. Saquemos todo lo que sea en ingles y dejemos full español. Eso si, los terminos tecnicos y demas que consideres por supuesto que quedan en ingles. Pero lenguaje principal español". T1.L1 done; T1.C1 added.

- 2026-11-04: PRs #6 and #7 were merged into stale stacked bases after #5 landed; recovered with PR #8 (merge 5662dd5). User: "verifica y continuemso". T1.C1 and T1.E3 done on `feat/concepts`.

- 2026-11-04: PR #9 merged (31657bd). User: "continuemos". T1.E2 done on `feat/frontend-exercises`.

- 2026-11-06: PR #11 merged (9798407). User: "continuemos por t1.e4". T1.E4 done on `feat/app-pages`.

- 2026-11-12: PRs #12 and #13 merged (`9870a5c`). User: "perfecto, continuemos". Questions work split into T1.Q1–T1.Q4; T1.Q1 starts on `feat/questions`.

- 2026-11-12: PR #14 merged (T1.Q1). User (verbatim): "quiero que saquemos lo del progreso. No me interesa que guardemos nada, ya que la idea es volver a repetir las preguntas ya contestadas en algun momento para reforzar conocimiento y verificar que el aprendizaje quedo guardado en mi memoria". T1.Q2 cancelled; spaced repetition and progress export/import dropped from Phase 2 (they need stored progress).

- 2026-11-12: PR #15 merged. User: "continuemos". T1.Q3 done on `feat/question-filters`.

- 2026-11-12: PR #16 merged (`9b33f43`). T1.Q4 scope agreed: mostly `fundamentals: true` questions; a few `fundamentals: false` only with verifiable evidence. User (verbatim): "me gusta este enfoque. Por favor, insisto en que no te inventes nada. Si no encuentras informacion verificable no las agregues. Prefiero que tengamos menos pero verificado antes que empezar a inventar cosas". T1.Q4 starts on `feat/seed-questions`.

- 2026-11-12: Evidence URLs confirmed by the user in a browser (verbatim): "abren todos los posts". T1.Q4 done.

## Delivery

- Strategy: `ask-on-risk` (default). Forecast for Phase 0: roughly 600–900 authored lines (scaffold, schema, tests, CI, sample content), so a chain decision is expected before T0.4.
- Running count after T0.2: ~610 authored lines (T0.1 ~180, T0.2 ~430). Over the ~400 budget: chain strategy asked to the user before the T0.3 commit.
- Chain strategy: **stacked-to-main** (user choice, 2026-10-28). Each slice targets the previous slice's branch while it is open, then `main` once the parent merges.

| PR  | Branch                | Commits                    | Scope                                | Size                                                                                          |
| --- | --------------------- | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1   | `chore/repo-setup`    | `5e3dcac`                  | T0.1 repo config + plan              | ~180                                                                                          |
| 2   | `docs/project-docs`   | `ce3e318` + progress notes | T0.2 licenses and contributor docs   | ~440 (docs only; slightly over budget, cannot split cohesively, `size:exception` recommended) |
| 3   | `feat/astro-scaffold` | `e05b75f`, `0f3bdaf`       | Astro + React scaffold, lint, format | ~120 authored + Markdown table reformat (lockfile excluded)                                   |

- Remote: `origin` = https://github.com/kslotes/entrenanding (public). `main` pushed 2026-10-28 at `f0471b0`. From T0.4 on, each slice is a real PR to `main`.
- 2026-10-28: user asked to land PR 1–3 on `main` before continuing. With no remote, slices were fast-forwarded locally into `main` in order (linear history, no merge commits). Later slices still branch from `main`.

## Next step

T1.Q4 done on `feat/seed-questions`; push and PR are the user's decision. Questions block (T1.Q1–T1.Q4) closed.
