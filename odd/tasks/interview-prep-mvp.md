# Interview Prep Webapp — MVP

Working name: **entrenanding** (provisional, may change before public launch).

## Objective

Build an open-source webapp that helps people learn, practice, and prepare for job interviews, with a job-oriented focus: content must be applicable to real work, and theoretical topics (beyond the fundamentals needed to understand tools/languages) must be backed by evidence that they recur in real interviews.

## Problem / Why

- Interview prep content is scattered, often outdated, or not grounded in what is actually asked.
- The project should be a community contribution: open source, contributions via Pull Requests.
- Initial budget is close to zero: infrastructure cost must be ~$0 for the MVP.

## Decisions (accepted)

| Decision                                                                    | Rationale                                                                                                                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content-as-code**: questions and answers live in the repo as Markdown/MDX | No CMS, no DB for content; community contributes via PRs (same model as roadmap.sh)                                                                   |
| **Progress stored in `localStorage` only** for the MVP                      | No backend needed; behind a `ProgressRepository` port so a cloud adapter can be added later                                                           |
| **No code execution in the MVP**                                            | Sandboxing, per-exercise tests, feedback, and contributor burden are high effort; deferred to a dedicated later phase                                 |
| **Question `type` discriminator** in the content schema                     | Allows adding `type: exercise` later without breaking existing content                                                                                |
| **Evidence required** for theoretical questions                             | Enforces the "verified recurring in interviews" goal; CI rejects PRs without it                                                                       |
| **Bilingual: Spanish + English** (UI and content)                           | Wider community reach; Astro native i18n routing (`locales: ["es", "en"]`, `prefixDefaultLocale: true` → `/es/...`, `/en/...`), no extra i18n library |

| **Single visual direction: "technical and raw"** (IDE/terminal aesthetic) | One look only, no switchable skins; keeps components, copy, and visual QA single-variant. Reference mockup: https://claude.ai/artifact/W7vETgpT8EFBc6a5ypDh6a (panel C) |

### Visual direction (accepted, details pending)

- IDE/terminal look: file-like tabs, status bar, `[a]`–`[d]` options, terse feedback (`✓ PASS` / `✗ FAIL expected: b`).
- Keyboard-first: every action has a shortcut; mouse and touch still fully supported.
- No gamification (XP, streaks, lives) in the MVP.
- Light and dark modes, both designed (light based on light IDE themes, not an inverted dark). Default follows `prefers-color-scheme`; a persistent toggle overrides it.
- Open: whether long-form text (model answers, system design guides) uses a proportional face for readability while chrome stays monospace.

### i18n approach (proposed)

- Content: one file per locale, `src/content/questions/<locale>/<category>/<slug>.md`; the same `slug` across locales identifies the same question.
- CI checks metadata parity between translations (type, category, stack, seniority, evidence) so translations cannot drift.
- A question may exist in one locale only; the UI shows a "not yet translated" notice with a link to the available locale and to contributing a translation.
- UI strings live in typed dictionaries (`src/i18n/{es,en}.ts`); a missing key fails typecheck.
- Root `/` redirects based on `Accept-Language`, with a persistent language switcher.

### Known `localStorage` limitations (accepted for MVP)

- ~5 MB per origin (enough for ~100k progress records of ~50 bytes).
- Safari ITP deletes script-writable storage after 7 days without user interaction.
- Cleared in private mode, by the user, or under storage pressure; no cross-device sync.
- Mitigation: JSON export/import; cloud sync in a later phase.

## Tech stack (proposed)

| Layer     | Choice                              | Notes                                             |
| --------- | ----------------------------------- | ------------------------------------------------- |
| Framework | Astro + React islands + TypeScript  | Content-heavy, mostly static output               |
| Content   | Astro Content Collections + Zod     | Schema validation in CI                           |
| Tests     | Vitest + Playwright                 |                                                   |
| Hosting   | Cloudflare Pages (free)             | Verify current free-tier limits before committing |
| CI        | GitHub Actions                      | Free for public repos                             |
| Licenses  | MIT (code) + CC BY-SA 4.0 (content) | Confirm before publishing                         |

## Content model

Categories: `algorithms`, `frontend` (React, Vue, Angular, ...), `backend` (focus: Java with Spring/Quarkus), `behavioral`, `system-design`.

Question types (no execution required):

| Type              | Grading                                                       |
| ----------------- | ------------------------------------------------------------- |
| `open`            | Model answer + self-assessment (knew it / partially / didn't) |
| `multiple-choice` | Automatic                                                     |
| `predict-output`  | Automatic (string comparison)                                 |
| `spot-the-bug`    | Automatic (selected line/option)                              |
| `behavioral`      | STAR guide + self-assessment checklist                        |
| `system-design`   | Step-by-step guide + rubric                                   |

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
- **Phase 1 — MVP:** browse by category/stack/seniority, all 6 question types, progress in `localStorage`, seed content with evidence (~10 questions per category).
- **Phase 2 — Study tools:** spaced repetition (self-assessment based), mock interview mode (N random questions + timer), progress export/import.
- **Phase 3+ — Later:** design executable practice properly, accounts + DB for sync and "I was asked this" votes, AI mock interviews with BYOK (user-provided API key).

### Deferred research for executable practice (Phase 3+)

- JS/TS and Python can run in the browser (Web Workers, Pyodide) at $0 infra cost; main cost is effort.
- Frontend frameworks: Sandpack — verify license and no-account usage.
- Pure Java: CheerpJ (WASM JVM) — license terms are ambiguous for commercial use and in-browser `javac` is unconfirmed; requires license review + PoC.
- Spring/Quarkus: cannot run in the browser realistically; options are non-execution question types plus template repos with tests run by GitHub Actions on the user's fork or GitHub Codespaces (user's own quota).
- Piston public API: rate limited, unclear auth, repo last pushed 2025-02; not suitable as a product dependency.

## T0.4 design (accepted 2026-10-29)

- Schema lives in a plain module (`src/content/schema.ts`) so it is unit-testable without `astro:content`; `src/content.config.ts` only wires it to the collection with the glob loader.
- Common fields: `title` (localized), `locale` (`es` | `en`, must match the path segment), `type`, `category`, `stack` (string[]), `seniority` (non-empty subset of `jr`, `ssr`, `sr`), `fundamentals` (boolean), `evidence` (min 2 when `fundamentals: false`; items `{ type: interview-report | job-posting, url }`).
- Discriminated union on `type`; type-specific fields:
  - `open`: none (body = model answer).
  - `multiple-choice`: `options: { id, text }[]` (2–6, unique ids), `answer` = one option id.
  - `predict-output`: `code`, `language`, `expectedOutput`.
  - `spot-the-bug`: `code`, `language`, `bugLine` (1-based, within `code`).
  - `behavioral`: `checklist: string[]` (STAR self-assessment items).
  - `system-design`: `steps: string[]`, `rubric: string[]`.
- Body (Markdown) holds the model answer / explanation for every type.
- i18n: `locales: ["es", "en"]`, `defaultLocale: "es"` (assumption: Spanish-first audience; change is a one-line config edit), `prefixDefaultLocale: true`. Placeholder pages `/es/` and `/en/`; root `/` keeps a placeholder until the `Accept-Language` redirect lands.
- Typed UI dictionaries `src/i18n/{en,es}.ts`: `es` is typed against the keys of `en`, so a missing key fails `astro check`.
- Vitest moves from T0.6 into T0.4 so the schema is built test-first. T0.6 becomes content-integrity tests (locale matches path, metadata parity across translations).

## Phase 0 checklist

- [x] T0.1 Initialize git repository, default branch `main`, `.gitignore`, `.editorconfig`. Route: inline (3 mechanical config files, no research). Also added `.gitattributes` (LF) for Windows contributors. Commit `5e3dcac`. Checks: `git ls-files --eol` shows LF for all files. Review: assessed `medium`, `under_budget`; RDD off (global), no review.
- [x] T0.2 Add `LICENSE` (MIT) and content license (CC BY-SA 4.0), `README.md`, `CONTRIBUTING.md`, PR template. Route: delegated writer (7 non-trivial docs, incl. `README.es.md`, `CONTRIBUTING.es.md`). Checks: 15/15 relative links resolve, LF only, structural readback by parent. Licenses remain "confirm before publishing". Commit `ce3e318`. Review: assessed `high`, `review_due: true`; RDD off (global), no review started.
  - Open for T0.4: `title` and type-specific fields (options, expected output) are not in the frontmatter sketch yet; full `seniority` value set undefined (only `ssr`, `sr` shown).
  - Added conventions: slugs in English; commit messages in English.
- [x] T0.3 Scaffold Astro + TypeScript + React integration; configure lint/format. Route: delegated writer (10 config files + install). Stack: astro 7.4.4, @astrojs/react 7.1.2, react 19.3.1, TypeScript 6.0.3 (pinned: @astrojs/check requires <7), ESLint 10 flat + typescript-eslint + eslint-plugin-astro + react-hooks `flat.recommended`, Prettier 3 + prettier-plugin-astro, pnpm 10.28.2, Node >=24. Commits `e05b75f` (scaffold, 118 authored lines excl. lockfile) and `0f3bdaf` (Prettier pass on pre-existing Markdown, tables only). Checks (parent re-run): `pnpm check` 0 errors, `pnpm lint` clean, `pnpm format:check` pass, `pnpm build` 1 page. Test-first exception: scaffold has no behavior. Review: assessed `high`, `review_due: true`; RDD off (global), no review started.
- [x] T0.4 Define content collection schema with Zod (type discriminator, category, stack, seniority, fundamentals, evidence rule, locale) and configure Astro i18n (`es`, `en`). Route: delegated writer (schema, tests, i18n, pages, docs) + one inline parent correction (strict objects). Deps: vitest 5.0.5 (Vite 8.3.5 shared with Astro), Zod 4.6.7 via `astro/zod`. RED observed: `Failed to resolve import "./schema"`; later RED for 2 strict-object tests. GREEN: 22 tests. Checks (parent re-run): `pnpm check` 0 errors, lint clean, format:check pass, build 3 pages (`/`, `/es/`, `/en/`). Missing-key proof: deleting a key in `es.ts` fails `astro check` (ts2741). Known warning: glob loader warns until `src/content/questions/` exists (T0.5). Chosen minimums: `checklist`, `steps`, `rubric` need ≥1 item; `stack` may be empty. Unknown frontmatter fields are rejected (strict objects).
- [x] T0.5 Add one sample question per type to validate the schema. Route: delegated writer (12 content files). 6 slugs × `en`/`es`, covering all 5 categories. Fundamentals (`true`): var-closure-in-loop, spring-default-bean-scope, binary-search-off-by-one, http-idempotent-methods. Evidence-backed (`false`, 2 fetched `interview-report` URLs each): conflict-with-teammate, url-shortener. Weak spot: behavioral evidence comes from PracHub aggregator pages (Glassdoor/LeetCode return 403 to automated checks). No meaningful RED (content only); checks: build passes with 12 entries and no glob warning, check 0 errors, 22 tests, lint, format; negative check (`answer: z`) fails build with `InvalidContentEntryDataError`, then reverted. T0.4 delivered as PR #1 (merge a6d9d46).
- [ ] T0.6 Content-integrity tests: `locale` matches path segment, metadata parity across translations (same slug). (Vitest setup and schema unit tests moved into T0.4.)
- [ ] T0.7 GitHub Actions CI: install, lint, typecheck, test, build.
- [ ] T0.8 Deploy to Cloudflare Pages (verify free-tier limits first).

## Acceptance criteria (Phase 0)

- A PR with a theoretical question lacking evidence fails CI.
- A PR with valid content builds and deploys a preview.
- All six question types validate against the schema.

## Progress

- 2026-10-28: Planning completed. No code written yet. Working directory is not a git repository yet.
- 2026-10-28: Repo initialized; empty root commit on `main`; work happens on `feat/phase-0-foundations`. T0.1 done.
- 2026-10-28: T0.2 and T0.3 done. Branches restacked per delivery table (`feat/phase-0-foundations` renamed to `docs/project-docs`). Next: T0.4 on a new slice branch from `feat/astro-scaffold`.

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

T0.4: content schema + Astro i18n. Resolve first: `title` and type-specific frontmatter fields. `seniority` values decided: `jr`, `ssr`, `sr` (user, 2026-10-28; more levels may come later).
