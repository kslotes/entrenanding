# Entrenanding

English | [Español](README.es.md)

Entrenanding is an open-source project to learn, practice, and prepare for technical job interviews. You clone it and run it on your own machine: no hosted site, no account. It focuses on what is useful on the job and on what interviewers actually ask.

> Working name. It may change.

## How it works

1. Clone the repository and start the app locally.
2. The app explains the project and serves theory questions (multiple choice and other auto-graded types).
3. Then you move to code exercises in your own editor, validated by tests: Java with JUnit for backend, TypeScript with Vitest for frontend.

## Status

**Phase 0, pre-alpha.** The app starts and builds, but it only shows placeholder pages and a few sample questions. Code exercises are part of the MVP and do not exist yet.

## Prerequisites

Install these before you start. The **Check** column shows the command that confirms the installed version.

| Tool                                                       | Version     | Needed for                  | Check            |
| ---------------------------------------------------------- | ----------- | --------------------------- | ---------------- |
| [Git](https://git-scm.com/)                                | Any recent  | Cloning the repository      | `git --version`  |
| [Node.js](https://nodejs.org/)                             | 24 or newer | The app, frontend exercises | `node --version` |
| [pnpm](https://pnpm.io/)                                   | 10          | Installing dependencies     | `pnpm --version` |
| JDK (for example [Eclipse Temurin](https://adoptium.net/)) | 25 (LTS)    | Backend exercises (planned) | `java -version`  |

- **pnpm**: if you do not have it, run `npm install -g pnpm@10`.
- **JDK**: not needed until the backend exercises land. Any OpenJDK 25 distribution works.
- **Maven**: you will not need to install it. The backend exercises will ship with the Maven Wrapper (`./mvnw`), which downloads the right Maven version on first use.
- **Editor**: any. An IDE with Java support (IntelliJ IDEA, VS Code with the Java extensions) makes the backend exercises easier.

## Getting started

```sh
git clone https://github.com/kslotes/entrenanding.git
cd entrenanding
pnpm install
pnpm dev
```

Open http://localhost:4321/ in your browser.

| Command      | What it does                                       |
| ------------ | -------------------------------------------------- |
| `pnpm dev`   | Starts the app locally with live reload            |
| `pnpm test`  | Runs the test suite (schema and content integrity) |
| `pnpm build` | Builds the app and validates all content           |

## What makes it different

| Principle         | What it means                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Job-oriented      | Content must apply to real work, not trivia.                                                                                                                 |
| Evidence-backed   | Theoretical questions must cite at least two sources showing they recur in real interviews. Fundamentals needed to understand a tool or language are exempt. |
| Bilingual         | UI and content in Spanish and English. A question can exist in one language until someone translates it.                                                     |
| Local and private | Everything runs on your machine. Your progress stays in your browser (`localStorage`). No account, no server.                                                |
| Content as code   | Questions are Markdown files in this repository, contributed through pull requests.                                                                          |
| Real tooling      | Code exercises use the real JDK, JUnit, and Vitest, the same tools you use at work.                                                                          |

## Question types

All theory question types are graded automatically in the app.

| Type              | How it is graded                    |
| ----------------- | ----------------------------------- |
| `multiple-choice` | Automatic                           |
| `predict-output`  | Automatic (string comparison)       |
| `spot-the-bug`    | Automatic (selected line or option) |

Self-assessed types (open answers, behavioral questions, and system-design walkthroughs) return in a later phase, together with AI answer evaluation.

## Categories

| Category        | Scope                                         |
| --------------- | --------------------------------------------- |
| `algorithms`    | Data structures and algorithms                |
| `frontend`      | React, Vue, Angular, and the web platform     |
| `backend`       | Initial focus on Java with Spring and Quarkus |
| `system-design` | Architecture and design exercises             |

## Roadmap

| Phase          | Scope                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Foundations | Repository, licenses, content schema, CI that validates content and evidence                                                                                               |
| 1. MVP         | Browse by category, stack, and seniority; all question types; progress in the browser; seed content; code exercises validated by tests (Java + JUnit, TypeScript + Vitest) |
| 2. Study tools | Spaced repetition, mock interview mode, progress export and import                                                                                                         |
| 3+. Later      | AI answer evaluation and mock interviews with your own API key (brings back open, behavioral, and system-design walkthrough questions)                                     |

## Contributing

Contributions are welcome, especially questions with evidence and translations. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Licenses

| What                         | License                            |
| ---------------------------- | ---------------------------------- |
| Code                         | [MIT](LICENSE)                     |
| Content under `src/content/` | [CC BY-SA 4.0](LICENSE-CONTENT.md) |
