import { describe, expect, it } from "vitest";
import {
  conceptHref,
  exerciseHref,
  parseExerciseId,
  rewriteConceptLink,
  runInstructions,
} from "./exercises";

describe("parseExerciseId", () => {
  it("splits a collection id into area, group and slug", () => {
    expect(
      parseExerciseId("backend/java-core/immutable-money/statement"),
    ).toEqual({
      area: "backend",
      group: "java-core",
      slug: "immutable-money",
      path: "java-core/immutable-money",
    });
  });

  it("rejects an unknown area", () => {
    expect(() => parseExerciseId("mobile/kotlin/foo/statement")).toThrow(
      'Unexpected exercise id "mobile/kotlin/foo/statement"',
    );
  });

  it("rejects an id that is not a statement", () => {
    expect(() => parseExerciseId("frontend/js-core/debounce")).toThrow(
      'Unexpected exercise id "frontend/js-core/debounce"',
    );
  });
});

describe("runInstructions", () => {
  it("runs a backend exercise with the Maven Wrapper from exercises/backend", () => {
    expect(
      runInstructions(
        parseExerciseId("backend/java-core/immutable-money/statement"),
      ),
    ).toEqual({
      cwd: "exercises/backend",
      run: "./mvnw -pl java-core/immutable-money test",
      windowsRun: "mvnw.cmd -pl java-core/immutable-money test",
    });
  });

  it("runs a frontend exercise with pnpm from the repository root", () => {
    expect(
      runInstructions(parseExerciseId("frontend/js-core/debounce/statement")),
    ).toEqual({
      cwd: null,
      run: "pnpm exercise js-core/debounce",
      watch: "pnpm exercise:watch js-core/debounce",
    });
  });
});

describe("hrefs", () => {
  it("builds exercise and concept page paths", () => {
    expect(
      exerciseHref(parseExerciseId("frontend/js-core/debounce/statement")),
    ).toBe("/ejercicios/frontend/js-core/debounce/");
    expect(conceptHref("js-closures")).toBe("/conceptos/js-closures/");
  });
});

describe("rewriteConceptLink", () => {
  it("maps a relative link to a concept file to its page", () => {
    expect(
      rewriteConceptLink("../../../../src/content/concepts/js-closures.md"),
    ).toBe("/conceptos/js-closures/");
  });

  it("keeps the fragment", () => {
    expect(
      rewriteConceptLink("../src/content/concepts/value-objects.md#records"),
    ).toBe("/conceptos/value-objects/#records");
  });

  it("leaves other links untouched", () => {
    expect(rewriteConceptLink("https://developer.mozilla.org/")).toBe(
      "https://developer.mozilla.org/",
    );
    expect(rewriteConceptLink("./solution/src/debounce.ts")).toBe(
      "./solution/src/debounce.ts",
    );
  });
});
