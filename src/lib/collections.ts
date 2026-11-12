import { getCollection } from "astro:content";
import { parseExerciseId } from "./exercises";

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
