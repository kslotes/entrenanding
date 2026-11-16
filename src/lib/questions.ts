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

/** Picks a random item other than `current`, or undefined when none is left. */
export function pickRandomOther<T>(
  items: readonly T[],
  current: T,
  random: () => number = Math.random,
): T | undefined {
  const others = items.filter((item) => item !== current);
  return others[Math.floor(random() * others.length)];
}

/** Same line split the schema uses to validate `bugLine`. */
export const codeLines = (code: string) => code.replace(/\n$/, "").split("\n");
