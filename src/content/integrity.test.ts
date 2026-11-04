import { describe, expect, it } from "vitest";
import { checkConcepts, checkExercises, checkIntegrity } from "./integrity";

const question = {
  title: "Encuentra el error",
  type: "spot-the-bug",
  category: "algorithms",
  stack: ["java"],
  seniority: ["jr"],
  fundamentals: true,
  language: "java",
  code: "int a = 1;\nint b = a / 0;\n",
  bugLine: 2,
};

describe("checkIntegrity", () => {
  it("accepts a valid question at <category>/<slug>.md", () => {
    expect(
      checkIntegrity([{ path: "algorithms/foo.md", data: question }]),
    ).toEqual([]);
  });

  describe("path", () => {
    it("reports a category that does not match the folder", () => {
      const problems = checkIntegrity([
        { path: "frontend/foo.md", data: question },
      ]);
      expect(problems).toContain(
        'frontend/foo.md: category "algorithms" does not match folder "frontend"',
      );
    });

    it.each(["Foo.md", "foo_bar.md", "foo--bar.md", "-foo.md"])(
      "reports an invalid slug %s",
      (file) => {
        const problems = checkIntegrity([
          { path: `algorithms/${file}`, data: question },
        ]);
        expect(problems.some((p) => p.includes("slug"))).toBe(true);
      },
    );

    it.each(["foo.md", "es/algorithms/foo.md"])(
      "reports a path that is not <category>/<slug>.md: %s",
      (path) => {
        expect(checkIntegrity([{ path, data: question }])).toEqual([
          `${path}: expected <category>/<slug>.md`,
        ]);
      },
    );
  });

  it("reports schema errors with the field path", () => {
    const problems = checkIntegrity([
      { path: "algorithms/foo.md", data: { ...question, bugLine: 0 } },
    ]);
    expect(
      problems.some((p) => p.startsWith("algorithms/foo.md: bugLine")),
    ).toBe(true);
  });

  it("reports the removed locale field", () => {
    const problems = checkIntegrity([
      { path: "algorithms/foo.md", data: { ...question, locale: "es" } },
    ]);
    expect(problems.some((p) => p.startsWith("algorithms/foo.md:"))).toBe(true);
  });
});

const concept = {
  title: "Contrato de equals y hashCode",
  stack: ["java"],
  references: [
    {
      title: "Object (Java SE 25)",
      url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html",
    },
  ],
};

const statement = {
  title: "Objeto de valor inmutable Money",
  category: "backend",
  stack: ["java"],
  seniority: ["jr"],
  fundamentals: true,
  concepts: ["equals-hashcode-contract"],
};

const known = new Set(["equals-hashcode-contract"]);

describe("checkConcepts", () => {
  it("accepts a valid concept at <slug>.md", () => {
    expect(
      checkConcepts([{ path: "equals-hashcode-contract.md", data: concept }]),
    ).toEqual([]);
  });

  it("reports a concept without references", () => {
    const problems = checkConcepts([
      { path: "foo.md", data: { ...concept, references: [] } },
    ]);
    expect(problems.some((p) => p.startsWith("foo.md: references"))).toBe(true);
  });

  it.each(["java/foo.md", "Foo.md"])("reports an invalid path %s", (path) => {
    expect(checkConcepts([{ path, data: concept }]).length).toBeGreaterThan(0);
  });
});

describe("concept references", () => {
  it("accepts a question that references a known concept", () => {
    const data = { ...question, concepts: ["equals-hashcode-contract"] };
    expect(
      checkIntegrity([{ path: "algorithms/foo.md", data }], known),
    ).toEqual([]);
  });

  it("reports a question that references an unknown concept", () => {
    const data = { ...question, concepts: ["nope"] };
    expect(
      checkIntegrity([{ path: "algorithms/foo.md", data }], known),
    ).toContain('algorithms/foo.md: unknown concept "nope"');
  });
});

describe("checkExercises", () => {
  const path = "backend/java-core/immutable-money/statement.md";

  it("accepts a valid statement", () => {
    expect(checkExercises([{ path, data: statement }], known)).toEqual([]);
  });

  it("reports an exercise without concepts", () => {
    const problems = checkExercises(
      [{ path, data: { ...statement, concepts: [] } }],
      known,
    );
    expect(problems.some((p) => p.startsWith(`${path}: concepts`))).toBe(true);
  });

  it("reports an exercise that references an unknown concept", () => {
    const problems = checkExercises(
      [{ path, data: { ...statement, concepts: ["nope"] } }],
      known,
    );
    expect(problems).toContain(`${path}: unknown concept "nope"`);
  });

  it.each([
    "backend/immutable-money/statement.md",
    "mobile/java-core/immutable-money/statement.md",
    "backend/java-core/Immutable_Money/statement.md",
  ])("reports an invalid path %s", (bad) => {
    expect(
      checkExercises([{ path: bad, data: statement }], known).length,
    ).toBeGreaterThan(0);
  });
});
