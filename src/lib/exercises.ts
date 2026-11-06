// Pure helpers shared by the exercise and concept pages; no Astro imports so
// they stay unit-testable.

export const exerciseAreas = ["backend", "frontend"] as const;
export type ExerciseArea = (typeof exerciseAreas)[number];

export interface ExerciseLocation {
  area: ExerciseArea;
  group: string;
  slug: string;
  /** `<group>/<slug>`: what the run commands take. */
  path: string;
}

const isArea = (value: string): value is ExerciseArea =>
  (exerciseAreas as readonly string[]).includes(value);

// Collection ids come from exercises/<area>/<group>/<slug>/statement.md.
export function parseExerciseId(id: string): ExerciseLocation {
  const parts = id.split("/");
  const [area, group, slug, file] = parts;
  if (parts.length !== 4 || file !== "statement" || !isArea(area)) {
    throw new Error(`Unexpected exercise id "${id}"`);
  }
  return { area, group, slug, path: `${group}/${slug}` };
}

export interface RunInstructions {
  /** Directory to run from, relative to the repository root; null = root. */
  cwd: string | null;
  run: string;
  watch?: string;
  windowsRun?: string;
}

export function runInstructions({
  area,
  path,
}: ExerciseLocation): RunInstructions {
  if (area === "backend") {
    return {
      cwd: "exercises/backend",
      run: `./mvnw -pl ${path} test`,
      windowsRun: `mvnw.cmd -pl ${path} test`,
    };
  }
  return {
    cwd: null,
    run: `pnpm exercise ${path}`,
    watch: `pnpm exercise:watch ${path}`,
  };
}

export const exerciseHref = ({ area, path }: ExerciseLocation) =>
  `/ejercicios/${area}/${path}/`;

export const conceptHref = (slug: string) => `/conceptos/${slug}/`;

// Statements link concepts by relative file path so they also work on GitHub;
// in the app those links must point to the concept page instead.
const CONCEPT_FILE =
  /^(?:\.{1,2}\/)*src\/content\/concepts\/([a-z0-9-]+)\.md(#.*)?$/;

export function rewriteConceptLink(href: string): string {
  const match = CONCEPT_FILE.exec(href);
  return match ? `${conceptHref(match[1])}${match[2] ?? ""}` : href;
}
