# Contributing to Entrenanding

English | [Español](CONTRIBUTING.es.md)

Content and code are both contributed through pull requests. Questions live in this repository as Markdown files, so adding a question is the same as adding code: fork, branch, commit, open a PR.

> **Phase 0.** The frontmatter below is enforced by the content schema in `src/content/schema.ts` when the site builds. Automated validation in CI is coming in Phase 0. Until then, reviewers check these rules by hand.

## Quick path

1. Fork the repository and create a branch from `main`.
2. Add or edit a question under `src/content/questions/<locale>/<category>/<slug>.md`.
3. If the question is theoretical, add at least two evidence links.
4. Commit with a [Conventional Commits](https://www.conventionalcommits.org/) message.
5. Open a pull request and complete the checklist in the template.

## File layout

```text
src/content/questions/
  en/
    backend/
      spring-bean-scopes.md
  es/
    backend/
      spring-bean-scopes.md
```

| Part         | Rule                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `<locale>`   | `en` or `es`                                                                                         |
| `<category>` | `algorithms`, `frontend`, `backend`, or `system-design`                                              |
| `<slug>`     | Lowercase, hyphen-separated, in English. The same slug in both locales identifies the same question. |

## Frontmatter

```yaml
title: Which bean scope does Spring use by default?
locale: en
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
options:
  - id: a
    text: singleton
  - id: b
    text: prototype
answer: a
```

| Field          | Values                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| `title`        | The question, in the file's locale.                                            |
| `locale`       | `en`, `es`. Must match the folder.                                             |
| `type`         | `multiple-choice`, `predict-output`, `spot-the-bug`                            |
| `category`     | `algorithms`, `frontend`, `backend`, `system-design`. Must match the folder.   |
| `stack`        | Technologies the question applies to. May be empty.                            |
| `seniority`    | One or more of `jr`, `ssr`, `sr`.                                              |
| `fundamentals` | `true` for basics needed to understand a tool or language.                     |
| `evidence`     | Sources showing the question recurs in real interviews. See the evidence rule. |

The Markdown body holds the model answer or explanation for every type.

Unknown fields are rejected, so a typo such as `anwser` fails validation instead of being silently ignored.

### Type-specific fields

| Type              | Fields                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `multiple-choice` | `options`: 2 to 6 items of `{ id, text }` with unique ids. `answer`: the id of the correct option. |
| `predict-output`  | `code`, `language`, `expectedOutput`: the exact output, compared as a string.                      |
| `spot-the-bug`    | `code`, `language`, `bugLine`: the 1-based line number of the bug, within `code`.                  |

> **Deferred types.** The site only accepts types it can grade automatically. Self-assessed types (open answers, behavioral, and system-design walkthroughs) and the `behavioral` category are deferred to the phase that adds AI answer evaluation, so contributions of those types are not accepted yet. System-design topics are welcome as any of the types above.

## Evidence rule

Entrenanding only includes theoretical questions that people are actually asked.

- When `fundamentals: false`, the question needs **at least 2** evidence entries.
- Each entry has a `type` and a public `url`.
- When `fundamentals: true`, evidence is optional. Use it only for basics required to understand a tool or language, not to skip the rule.

| Evidence type      | Examples                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| `interview-report` | A Glassdoor review, a Blind thread, a public blog post describing an interview |
| `job-posting`      | A job posting that lists the topic as a requirement                            |

Link to sources. Do not copy their text into the repository.

## Translations

- Each locale is a separate file with the same slug.
- Metadata must match across locales: `type`, `category`, `stack`, `seniority`, `fundamentals`, and `evidence`. Only `locale` and the prose change.
- A question may exist in one locale only. The site will show a "not yet translated" notice that links to the available version.
- Translating an existing question is a welcome contribution on its own.

## Code contributions

- Add or update tests with behavior changes.
- Keep pull requests focused on one change.
- Tooling, lint, and test commands will be documented here once the application scaffold lands.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/). The PR title follows the same format.

| Example                                                | When            |
| ------------------------------------------------------ | --------------- |
| `feat(content): add spring bean scopes question`       | New question    |
| `feat(content): translate spring bean scopes to es`    | New translation |
| `fix(content): correct expected output in js-closures` | Content fix     |
| `feat: add category filter`                            | New app feature |
| `docs: clarify evidence rule`                          | Documentation   |

## Licensing

By contributing, you agree that your code is licensed under [MIT](LICENSE) and your content under `src/content/` is licensed under [CC BY-SA 4.0](LICENSE-CONTENT.md).
