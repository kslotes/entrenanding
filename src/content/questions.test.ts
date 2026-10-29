import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { checkIntegrity, type ContentEntry } from "./integrity";

// Vite inlines every question file as a raw string, so the test needs no
// filesystem access (and no Node type definitions).
const files = import.meta.glob<string>("./questions/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Strict on purpose: frontmatter must open the file and be closed by `---`.
function frontmatter(source: string, path: string): unknown {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(
    source.replace(/\r\n/g, "\n"),
  );
  if (!match) throw new Error(`${path}: missing or unclosed frontmatter`);
  return parse(match[1]);
}

const entries: ContentEntry[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, source]) => {
    const path = file.slice("./questions/".length);
    return { path, data: frontmatter(source, path) };
  });

describe("question content", () => {
  it("has questions to check", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("passes schema, path and translation integrity checks", () => {
    const problems = checkIntegrity(entries);
    expect(problems, `\n${problems.join("\n")}\n`).toEqual([]);
  });
});
