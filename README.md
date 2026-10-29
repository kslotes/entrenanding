# Entrenanding

English | [Español](README.es.md)

Entrenanding is an open-source web app to learn, practice, and prepare for technical job interviews. It focuses on what is useful on the job and on what interviewers actually ask.

> Working name. It may change before the public launch.

## Status

**Phase 0, pre-alpha. Nothing is runnable yet.**

The repository currently holds licenses and contributor docs. Install, run, and test commands will be added here when the application scaffold lands.

## What makes it different

| Principle | What it means |
|---|---|
| Job-oriented | Content must apply to real work, not trivia. |
| Evidence-backed | Theoretical questions must cite at least two sources showing they recur in real interviews. Fundamentals needed to understand a tool or language are exempt. |
| Bilingual | UI and content in Spanish and English. A question can exist in one language until someone translates it. |
| Private by default | Your progress stays in your browser (`localStorage`). No account, no backend. |
| Content as code | Questions are Markdown files in this repository, contributed through pull requests. |

## Question types

None of the types require running code.

| Type | How it is graded |
|---|---|
| `open` | Model answer plus self-assessment (knew it / partially / didn't) |
| `multiple-choice` | Automatic |
| `predict-output` | Automatic (string comparison) |
| `spot-the-bug` | Automatic (selected line or option) |
| `behavioral` | STAR guide plus self-assessment checklist |
| `system-design` | Step-by-step guide plus rubric |

## Categories

| Category | Scope |
|---|---|
| `algorithms` | Data structures and algorithms |
| `frontend` | React, Vue, Angular, and the web platform |
| `backend` | Initial focus on Java with Spring and Quarkus |
| `behavioral` | Experience, collaboration, and conflict questions |
| `system-design` | Architecture and design exercises |

## Roadmap

| Phase | Scope |
|---|---|
| 0. Foundations | Repository, licenses, content schema, CI that validates content and evidence, first deploy |
| 1. MVP | Browse by category, stack, and seniority; all six question types; progress in the browser; seed content |
| 2. Study tools | Spaced repetition, mock interview mode, progress export and import |
| 3+. Later | Executable practice, optional accounts and sync, AI mock interviews with your own API key |

## Contributing

Contributions are welcome, especially questions with evidence and translations. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Licenses

| What | License |
|---|---|
| Code | [MIT](LICENSE) |
| Content under `src/content/` | [CC BY-SA 4.0](LICENSE-CONTENT.md) |
