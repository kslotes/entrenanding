// Pure helpers for the question pages; no Astro imports so they stay
// unit-testable.

import { categories } from "../content/schema";

export type Category = (typeof categories)[number];

export interface QuestionLocation {
  category: Category;
  slug: string;
}

const isCategory = (value: string): value is Category =>
  (categories as readonly string[]).includes(value);

// Collection ids come from src/content/questions/<category>/<slug>.md.
export function parseQuestionId(id: string): QuestionLocation {
  const parts = id.split("/");
  const [category, slug] = parts;
  if (parts.length !== 2 || !isCategory(category)) {
    throw new Error(`Unexpected question id "${id}"`);
  }
  return { category, slug };
}

export const questionHref = ({ category, slug }: QuestionLocation) =>
  `/preguntas/${category}/${slug}/`;

/** Same line split the schema uses to validate `bugLine`. */
export const codeLines = (code: string) => code.replace(/\n$/, "").split("\n");
