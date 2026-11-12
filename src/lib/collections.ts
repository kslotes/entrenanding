import { getCollection } from "astro:content";
import { parseExerciseId } from "./exercises";
import { parseQuestionId } from "./questions";

/** Exercises with their location, sorted by area and path. */
export async function getExercises() {
  const entries = await getCollection("exercises");
  return entries
    .map((entry) => ({ entry, location: parseExerciseId(entry.id) }))
    .sort((a, b) => a.entry.id.localeCompare(b.entry.id));
}

/** Concepts sorted by title. */
export async function getConcepts() {
  const entries = await getCollection("concepts");
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title, "es"));
}

/** Questions with their location, sorted by category and slug. */
export async function getQuestions() {
  const entries = await getCollection("questions");
  return entries
    .map((entry) => ({ entry, location: parseQuestionId(entry.id) }))
    .sort((a, b) => a.entry.id.localeCompare(b.entry.id));
}
