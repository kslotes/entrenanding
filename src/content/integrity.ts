import { questionSchema } from "./schema";

// One question file: `path` is relative to src/content/questions
// (`<locale>/<category>/<slug>.md`), `data` is its parsed frontmatter.
export type ContentEntry = { path: string; data: unknown };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Language-independent fields that every translation of a question must share.
const PARITY_FIELDS = [
  "type",
  "category",
  "stack",
  "seniority",
  "fundamentals",
  "evidence",
  "code",
  "language",
  "expectedOutput",
  "bugLine",
  "answer",
] as const;

type Frontmatter = Record<string, unknown>;

const asRecord = (data: unknown): Frontmatter =>
  typeof data === "object" && data !== null ? (data as Frontmatter) : {};

// Deep equality for parsed YAML (scalars, arrays, plain objects).
const equal = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => equal(item, b[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((k) => equal(asRecord(a)[k], asRecord(b)[k]))
  );
};

// Option text is translated; only the ids (and their order) must match.
const optionIds = (options: unknown) =>
  Array.isArray(options) ? options.map((o) => asRecord(o).id) : options;

// Checks what the schema cannot see from a single file: folder/frontmatter
// consistency and parity between translations. Returns readable problems.
export function checkIntegrity(entries: ContentEntry[]): string[] {
  const problems: string[] = [];
  const translations = new Map<
    string,
    { locale: string; data: Frontmatter }[]
  >();

  for (const { path, data } of entries) {
    const parts = path.split("/");
    if (parts.length !== 3 || !parts[2].endsWith(".md")) {
      problems.push(`${path}: expected <locale>/<category>/<slug>.md`);
      continue;
    }
    const [locale, category, file] = parts;
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
    if (fm.locale !== locale) {
      problems.push(
        `${path}: locale "${String(fm.locale)}" does not match folder "${locale}"`,
      );
    }
    if (fm.category !== category) {
      problems.push(
        `${path}: category "${String(fm.category)}" does not match folder "${category}"`,
      );
    }

    const key = `${category}/${file}`;
    translations.set(key, [
      ...(translations.get(key) ?? []),
      { locale, data: fm },
    ]);
  }

  for (const [key, group] of translations) {
    const [first, ...others] = group.toSorted((a, b) =>
      a.locale.localeCompare(b.locale),
    );
    for (const other of others) {
      const pair = `${first.locale} and ${other.locale}`;
      for (const field of PARITY_FIELDS) {
        // `evidence` defaults to [] in the schema, so omitted equals empty.
        const normalize = (fm: Frontmatter) =>
          field === "evidence" ? (fm.evidence ?? []) : fm[field];
        if (!equal(normalize(first.data), normalize(other.data))) {
          problems.push(`${key}: "${field}" differs between ${pair}`);
        }
      }
      if (
        !equal(optionIds(first.data.options), optionIds(other.data.options))
      ) {
        problems.push(`${key}: "options" ids differ between ${pair}`);
      }
    }
  }

  return problems;
}
