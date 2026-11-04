import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  conceptSchema,
  exerciseSchema,
  questionSchema,
} from "./content/schema";

const questions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/questions" }),
  schema: questionSchema,
});

const concepts = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/concepts" }),
  schema: conceptSchema,
});

// Statements only; starter code, tests and solutions stay in the exercise folder.
const exercises = defineCollection({
  loader: glob({ pattern: "*/*/*/statement.md", base: "./exercises" }),
  schema: exerciseSchema,
});

export const collections = { questions, concepts, exercises };
