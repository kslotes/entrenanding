import { questionSchema } from "./schema";

// One question file: `path` is relative to src/content/questions
// (`<category>/<slug>.md`), `data` is its parsed frontmatter.
export type ContentEntry = { path: string; data: unknown };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Frontmatter = Record<string, unknown>;

const asRecord = (data: unknown): Frontmatter =>
  typeof data === "object" && data !== null ? (data as Frontmatter) : {};

// Checks what the schema cannot see from a single file: that the path and the
// frontmatter agree. Returns readable problems.
export function checkIntegrity(entries: ContentEntry[]): string[] {
  const problems: string[] = [];

  for (const { path, data } of entries) {
    const parts = path.split("/");
    if (parts.length !== 2 || !parts[1].endsWith(".md")) {
      problems.push(`${path}: expected <category>/<slug>.md`);
      continue;
    }
    const [category, file] = parts;
    const slug = file.slice(0, -".md".length);
    const fm = asRecord(data);

    const result = questionSchema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "(root)";
        problems.push(`${path}: ${field}: ${issue.message}`);
      }
    }
    if (!SLUG.test(slug)) {
      problems.push(
        `${path}: slug "${slug}" must be lowercase and hyphen-separated`,
      );
    }
    if (fm.category !== category) {
      problems.push(
        `${path}: category "${String(fm.category)}" does not match folder "${category}"`,
      );
    }
  }

  return problems;
}
