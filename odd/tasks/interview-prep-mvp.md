# Interview Prep Webapp — MVP

Working name: **entrenanding** (provisional, may change before public launch).

## Objective

Build an open-source webapp that helps people learn, practice, and prepare for job interviews, with a job-oriented focus: content must be applicable to real work, and theoretical topics (beyond the fundamentals needed to understand tools/languages) must be backed by evidence that they recur in real interviews.

## Problem / Why

- Interview prep content is scattered, often outdated, or not grounded in what is actually asked.
- The project should be a community contribution: open source, contributions via Pull Requests.
- Initial budget is close to zero: infrastructure cost must be ~$0 for the MVP.

## Decisions (accepted)

| Decision | Rationale |
|---|---|
| **Content-as-code**: questions and answers live in the repo as Markdown/MDX | No CMS, no DB for content; community contributes via PRs (same model as roadmap.sh) |
| **Progress stored in `localStorage` only** for the MVP | No backend needed; behind a `ProgressRepository` port so a cloud adapter can be added later |
| **No code execution in the MVP** | Sandboxing, per-exercise tests, feedback, and contributor burden are high effort; deferred to a dedicated later phase |
| **Question `type` discriminator** in the content schema | Allows adding `type: exercise` later without breaking existing content |
| **Evidence required** for theoretical questions | Enforces the "verified recurring in interviews" goal; CI rejects PRs without it |
| **Bilingual: Spanish + English** (UI and content) | Wider community reach; Astro native i18n routing (`locales: ["es", "en"]`, `prefixDefaultLocale: true` → `/es/...`, `/en/...`), no extra i18n library |

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

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro + React islands + TypeScript | Content-heavy, mostly static output |
| Content | Astro Content Collections + Zod | Schema validation in CI |
| Tests | Vitest + Playwright | |
| Hosting | Cloudflare Pages (free) | Verify current free-tier limits before committing |
| CI | GitHub Actions | Free for public repos |
| Licenses | MIT (code) + CC BY-SA 4.0 (content) | Confirm before publishing |

## Content model

Categories: `algorithms`, `frontend` (React, Vue, Angular, ...), `backend` (focus: Java with Spring/Quarkus), `behavioral`, `system-design`.

Question types (no execution required):

| Type | Grading |
|---|---|
| `open` | Model answer + self-assessment (knew it / partially / didn't) |
| `multiple-choice` | Automatic |
| `predict-output` | Automatic (string comparison) |
| `spot-the-bug` | Automatic (selected line/option) |
| `behavioral` | STAR guide + self-assessment checklist |
| `system-design` | Step-by-step guide + rubric |

Frontmatter sketch:

```yaml
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [ssr, sr]
fundamentals: false      # true = no evidence required
evidence:                # required (min 2) when fundamentals is false
  - type: interview-report   # Glassdoor, Blind, public post
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

## Phase 0 checklist

- [x] T0.1 Initialize git repository, default branch `main`, `.gitignore`, `.editorconfig`. Route: inline (3 mechanical config files, no research). Also added `.gitattributes` (LF) for Windows contributors.
- [ ] T0.2 Add `LICENSE` (MIT) and content license (CC BY-SA 4.0), `README.md`, `CONTRIBUTING.md`, PR template.
- [ ] T0.3 Scaffold Astro + TypeScript + React integration; configure lint/format.
- [ ] T0.4 Define content collection schema with Zod (type discriminator, category, stack, seniority, fundamentals, evidence rule, locale) and configure Astro i18n (`es`, `en`).
- [ ] T0.5 Add one sample question per type to validate the schema.
- [ ] T0.6 Set up Vitest; add schema validation tests (valid/invalid fixtures, evidence rule).
- [ ] T0.7 GitHub Actions CI: install, lint, typecheck, test, build.
- [ ] T0.8 Deploy to Cloudflare Pages (verify free-tier limits first).

## Acceptance criteria (Phase 0)

- A PR with a theoretical question lacking evidence fails CI.
- A PR with valid content builds and deploys a preview.
- All six question types validate against the schema.

## Progress

- 2026-10-28: Planning completed. No code written yet. Working directory is not a git repository yet.
- 2026-10-28: Repo initialized; empty root commit on `main`; work happens on `feat/phase-0-foundations`. T0.1 done.

## Delivery

- Strategy: `ask-on-risk` (default). Forecast for Phase 0: roughly 600–900 authored lines (scaffold, schema, tests, CI, sample content), so a chain decision is expected before T0.4.

## Next step

T0.2: licenses, README, CONTRIBUTING, PR template.
