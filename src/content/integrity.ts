import type { z } from "astro/zod";
import { SLUG, conceptSchema, exerciseSchema, questionSchema } from "./schema";

// One content file: `path` is relative to its root folder, `data` is its
// parsed frontmatter.
export type ContentEntry = { path: string; data: unknown };

const EXERCISE_AREAS = ["backend", "frontend"];

type Frontmatter = Record<string, unknown>;

const asRecord = (data: unknown): Frontmatter =>
  typeof data === "object" && data !== null ? (data as Frontmatter) : {};

function schemaProblems(
  schema: z.ZodType,
  path: string,
  data: unknown,
): string[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const field = issue.path.join(".") || "(root)";
    return `${path}: ${field}: ${issue.message}`;
  });
}

function slugProblems(path: string, slug: string): string[] {
  return SLUG.test(slug)
    ? []
    : [`${path}: slug "${slug}" must be lowercase and hyphen-separated`];
}

function referenceProblems(
  path: string,
  data: unknown,
  conceptSlugs: ReadonlySet<string>,
): string[] {
  const concepts = asRecord(data).concepts;
  if (!Array.isArray(concepts)) return [];
  return concepts
    .filter((slug) => typeof slug === "string" && !conceptSlugs.has(slug))
    .map((slug) => `${path}: unknown concept "${slug}"`);
}

// Questions live at src/content/questions/<category>/<slug>.md. Checks what
// the schema cannot see from a single file: that the path and the frontmatter
// agree, and that referenced concepts exist.
export function checkIntegrity(
  entries: ContentEntry[],
  conceptSlugs: ReadonlySet<string> = new Set(),
): string[] {
  const problems: string[] = [];

  for (const { path, data } of entries) {
    const parts = path.split("/");
    if (parts.length !== 2 || !parts[1].endsWith(".md")) {
      problems.push(`${path}: expected <category>/<slug>.md`);
      continue;
    }
    const [category, file] = parts;
    const fm = asRecord(data);

    problems.push(...schemaProblems(questionSchema, path, data));
    problems.push(...slugProblems(path, file.slice(0, -".md".length)));
    if (fm.category !== category) {
      problems.push(
        `${path}: category "${String(fm.category)}" does not match folder "${category}"`,
      );
    }
    problems.push(...referenceProblems(path, data, conceptSlugs));
  }

  return problems;
}

// Concepts live at src/content/concepts/<slug>.md.
export function checkConcepts(entries: ContentEntry[]): string[] {
  const problems: string[] = [];

  for (const { path, data } of entries) {
    const parts = path.split("/");
    if (parts.length !== 1 || !parts[0].endsWith(".md")) {
      problems.push(`${path}: expected <slug>.md`);
      continue;
    }
    problems.push(...schemaProblems(conceptSchema, path, data));
    problems.push(...slugProblems(path, parts[0].slice(0, -".md".length)));
  }

  return problems;
}

// Exercise statements live at exercises/<area>/<group>/<slug>/statement.md.
export function checkExercises(
  entries: ContentEntry[],
  conceptSlugs: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];

  for (const { path, data } of entries) {
    const parts = path.split("/");
    if (parts.length !== 4 || parts[3] !== "statement.md") {
      problems.push(`${path}: expected <area>/<group>/<slug>/statement.md`);
      continue;
    }
    const [area, group, slug] = parts;
    if (!EXERCISE_AREAS.includes(area)) {
      problems.push(
        `${path}: area "${area}" must be one of ${EXERCISE_AREAS.join(", ")}`,
      );
    }
    problems.push(...schemaProblems(exerciseSchema, path, data));
    problems.push(...slugProblems(path, group), ...slugProblems(path, slug));
    problems.push(...referenceProblems(path, data, conceptSlugs));
  }

  return problems;
}
