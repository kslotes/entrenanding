import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  checkConcepts,
  checkExercises,
  checkIntegrity,
  type ContentEntry,
} from "./integrity";

// Vite inlines every file as a raw string, so the test needs no filesystem
// access (and no Node type definitions). Vite requires literal glob options.
const questionFiles = import.meta.glob<string>("./questions/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const conceptFiles = import.meta.glob<string>("./concepts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const exerciseFiles = import.meta.glob<string>(
  "../../exercises/**/statement.md",
  { query: "?raw", import: "default", eager: true },
);

// Strict on purpose: frontmatter must open the file and be closed by `---`.
function frontmatter(source: string, path: string): unknown {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(
    source.replace(/\r\n/g, "\n"),
  );
  if (!match) throw new Error(`${path}: missing or unclosed frontmatter`);
  return parse(match[1]);
}

function toEntries(
  files: Record<string, string>,
  prefix: string,
): ContentEntry[] {
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([file, source]) => {
      const path = file.slice(prefix.length);
      return { path, data: frontmatter(source, path) };
    });
}

const questions = toEntries(questionFiles, "./questions/");
const concepts = toEntries(conceptFiles, "./concepts/");
const exercises = toEntries(exerciseFiles, "../../exercises/");
const conceptSlugs = new Set(concepts.map((c) => c.path.replace(/\.md$/, "")));

const report = (problems: string[]) => `\n${problems.join("\n")}\n`;

describe("content", () => {
  it("has questions, concepts and exercises to check", () => {
    expect(questions.length).toBeGreaterThan(0);
    expect(concepts.length).toBeGreaterThan(0);
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("questions pass schema, path and concept checks", () => {
    const problems = checkIntegrity(questions, conceptSlugs);
    expect(problems, report(problems)).toEqual([]);
  });

  it("concepts pass schema and path checks", () => {
    const problems = checkConcepts(concepts);
    expect(problems, report(problems)).toEqual([]);
  });

  it("exercises pass schema, path and concept checks", () => {
    const problems = checkExercises(exercises, conceptSlugs);
    expect(problems, report(problems)).toEqual([]);
  });
});
