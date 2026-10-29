import { describe, expect, it } from "vitest";
import { checkIntegrity, type ContentEntry } from "./integrity";

const en = {
  title: "Find the bug",
  locale: "en",
  type: "spot-the-bug",
  category: "algorithms",
  stack: ["java"],
  seniority: ["jr"],
  fundamentals: true,
  language: "java",
  code: "int a = 1;\nint b = a / 0;\n",
  bugLine: 2,
};

const es = { ...en, title: "Encuentra el error", locale: "es" };

const mcEn = {
  title: "Default scope?",
  locale: "en",
  type: "multiple-choice",
  category: "backend",
  stack: ["spring"],
  seniority: ["jr"],
  fundamentals: true,
  options: [
    { id: "a", text: "singleton" },
    { id: "b", text: "prototype" },
  ],
  answer: "a",
};

const mcEs = {
  ...mcEn,
  title: "¿Scope por defecto?",
  locale: "es",
  options: [
    { id: "a", text: "singleton (uno)" },
    { id: "b", text: "prototype (varios)" },
  ],
};

const pair = (
  enData: object = en,
  esData: object = es,
  path = "algorithms/foo.md",
): ContentEntry[] => [
  { path: `en/${path}`, data: enData },
  { path: `es/${path}`, data: esData },
];

describe("checkIntegrity", () => {
  it("accepts consistent translations", () => {
    expect(checkIntegrity(pair())).toEqual([]);
  });

  it("accepts translated option text when ids match", () => {
    expect(checkIntegrity(pair(mcEn, mcEs, "backend/bar.md"))).toEqual([]);
  });

  it("accepts a question that exists in one locale only", () => {
    expect(
      checkIntegrity([{ path: "en/algorithms/foo.md", data: en }]),
    ).toEqual([]);
  });

  describe("path", () => {
    it("reports a locale that does not match the folder", () => {
      const problems = checkIntegrity(pair(en, { ...es, locale: "en" }));
      expect(problems).toContain(
        'es/algorithms/foo.md: locale "en" does not match folder "es"',
      );
    });

    it("reports a category that does not match the folder", () => {
      const problems = checkIntegrity([
        { path: "en/frontend/foo.md", data: en },
      ]);
      expect(problems).toContain(
        'en/frontend/foo.md: category "algorithms" does not match folder "frontend"',
      );
    });

    it.each(["Foo.md", "foo_bar.md", "foo--bar.md", "-foo.md"])(
      "reports an invalid slug %s",
      (file) => {
        const problems = checkIntegrity([
          { path: `en/algorithms/${file}`, data: en },
        ]);
        expect(problems.some((p) => p.includes("slug"))).toBe(true);
      },
    );

    it("reports a path without locale and category folders", () => {
      const problems = checkIntegrity([{ path: "foo.md", data: en }]);
      expect(problems).toEqual([
        "foo.md: expected <locale>/<category>/<slug>.md",
      ]);
    });
  });

  it("reports schema errors with the field path", () => {
    const problems = checkIntegrity([
      { path: "en/algorithms/foo.md", data: { ...en, bugLine: 0 } },
    ]);
    expect(
      problems.some((p) => p.startsWith("en/algorithms/foo.md: bugLine")),
    ).toBe(true);
  });

  describe("translation parity", () => {
    it.each([
      ["type", { type: "predict-output" }],
      ["stack", { stack: ["kotlin"] }],
      ["seniority", { seniority: ["sr"] }],
      ["fundamentals", { fundamentals: false }],
      ["code", { code: "int a = 2;\nint b = a / 0;\n" }],
      ["language", { language: "kotlin" }],
      ["bugLine", { bugLine: 1 }],
    ])("reports a different %s", (field, change) => {
      const problems = checkIntegrity(pair(en, { ...es, ...change }));
      expect(problems).toContain(
        `algorithms/foo.md: "${field}" differs between en and es`,
      );
    });

    it("reports different evidence", () => {
      const evidence = [
        { type: "job-posting", url: "https://example.com/a" },
        { type: "job-posting", url: "https://example.com/b" },
      ];
      const problems = checkIntegrity(
        pair(
          { ...en, evidence },
          { ...es, evidence: evidence.slice().reverse() },
        ),
      );
      expect(problems).toContain(
        'algorithms/foo.md: "evidence" differs between en and es',
      );
    });

    it("reports a different answer", () => {
      const problems = checkIntegrity(
        pair(mcEn, { ...mcEs, answer: "b" }, "backend/bar.md"),
      );
      expect(problems).toContain(
        'backend/bar.md: "answer" differs between en and es',
      );
    });

    it("reports option ids in a different order", () => {
      const options = mcEs.options.slice().reverse();
      const problems = checkIntegrity(
        pair(mcEn, { ...mcEs, options }, "backend/bar.md"),
      );
      expect(problems).toContain(
        'backend/bar.md: "options" ids differ between en and es',
      );
    });

    it("reports a different expectedOutput", () => {
      const po = {
        title: "What does it print?",
        locale: "en",
        type: "predict-output",
        category: "algorithms",
        stack: [],
        seniority: ["jr"],
        fundamentals: true,
        code: "console.log(1 + 2);\n",
        language: "javascript",
        expectedOutput: "3",
      };
      const problems = checkIntegrity(
        pair(po, { ...po, locale: "es", expectedOutput: "0" }),
      );
      expect(problems).toContain(
        'algorithms/foo.md: "expectedOutput" differs between en and es',
      );
    });
  });
});
