import { describe, expect, it } from "vitest";
import { checkIntegrity } from "./integrity";

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
