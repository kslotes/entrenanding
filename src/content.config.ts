import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { questionSchema } from "./content/schema";

const questions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/questions" }),
  schema: questionSchema,
});

export const collections = { questions };
