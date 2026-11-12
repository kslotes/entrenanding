import { describe, expect, it } from "vitest";
import {
  emptyFilters,
  matchesFilters,
  parseFilters,
  serializeFilters,
  type FilterOptions,
} from "./question-filters";

const options: FilterOptions = {
  categoria: ["algorithms", "frontend", "backend", "system-design"],
  stack: ["java", "javascript", "spring"],
  seniority: ["jr", "ssr", "sr"],
};

const springQuestion = {
  categoria: "backend",
  stack: ["java", "spring"],
  seniority: ["jr", "ssr"],
};

describe("parseFilters", () => {
  it("reads comma-separated values per group", () => {
    expect(
      parseFilters(
        "?categoria=backend,frontend&stack=java&seniority=sr",
        options,
      ),
    ).toEqual({
      categoria: ["backend", "frontend"],
      stack: ["java"],
      seniority: ["sr"],
    });
  });

  it("returns empty groups when the query string has no filters", () => {
    expect(parseFilters("", options)).toEqual(emptyFilters());
  });

  it("drops unknown values and duplicates so a stale link never hides everything", () => {
    expect(
      parseFilters(
        "?categoria=behavioral,backend,backend&stack=cobol",
        options,
      ),
    ).toEqual({ categoria: ["backend"], stack: [], seniority: [] });
  });
});

describe("serializeFilters", () => {
  it("writes only non-empty groups, in a stable order", () => {
    expect(
      serializeFilters({
        categoria: ["frontend", "backend"],
        stack: [],
        seniority: ["jr"],
      }),
    ).toBe("?categoria=frontend,backend&seniority=jr");
  });

  it("returns an empty string when nothing is selected", () => {
    expect(serializeFilters(emptyFilters())).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const filters = {
      categoria: ["system-design"],
      stack: ["java", "spring"],
      seniority: ["ssr", "sr"],
    };
    expect(parseFilters(serializeFilters(filters), options)).toEqual(filters);
  });
});

describe("matchesFilters", () => {
  it("matches everything when no filter is selected", () => {
    expect(matchesFilters(springQuestion, emptyFilters())).toBe(true);
  });

  it("matches any selected value within a group", () => {
    expect(
      matchesFilters(springQuestion, {
        ...emptyFilters(),
        categoria: ["frontend", "backend"],
      }),
    ).toBe(true);
    expect(
      matchesFilters(springQuestion, { ...emptyFilters(), seniority: ["sr"] }),
    ).toBe(false);
  });

  it("requires every group with a selection to match", () => {
    expect(
      matchesFilters(springQuestion, {
        categoria: ["backend"],
        stack: ["javascript"],
        seniority: [],
      }),
    ).toBe(false);
    expect(
      matchesFilters(springQuestion, {
        categoria: ["backend"],
        stack: ["spring"],
        seniority: ["ssr"],
      }),
    ).toBe(true);
  });

  it("never matches a stack filter for a question without stack", () => {
    expect(
      matchesFilters(
        { categoria: "algorithms", stack: [], seniority: ["jr"] },
        { ...emptyFilters(), stack: ["java"] },
      ),
    ).toBe(false);
  });
});
