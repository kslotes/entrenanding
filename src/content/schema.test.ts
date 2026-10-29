import { describe, expect, it } from "vitest";
import { questionSchema } from "./schema";

const evidence = [
  { type: "interview-report", url: "https://example.com/report" },
  { type: "job-posting", url: "https://example.com/job" },
];

const base = {
  title: "Sample question",
  locale: "en",
  category: "backend",
  stack: ["java"],
  seniority: ["ssr"],
  fundamentals: false,
  evidence,
};

const validByType = {
  "multiple-choice": {
    ...base,
    type: "multiple-choice",
    options: [
      { id: "a", text: "Singleton" },
      { id: "b", text: "Prototype" },
    ],
    answer: "a",
  },
  "predict-output": {
    ...base,
    type: "predict-output",
    code: "console.log(1 + '1');\n",
    language: "javascript",
    expectedOutput: "11",
  },
  "spot-the-bug": {
    ...base,
    type: "spot-the-bug",
    code: "int a = 1;\nint b = a / 0;\n",
    language: "java",
    bugLine: 2,
  },
};

const mc = validByType["multiple-choice"];

const parse = (input: unknown) => questionSchema.safeParse(input);

describe("questionSchema", () => {
  it.each(Object.entries(validByType))(
    "accepts a valid %s question",
    (_, input) => {
      expect(parse(input).success).toBe(true);
    },
  );

  describe("evidence rule", () => {
    it("rejects non-fundamentals questions with fewer than 2 evidence items", () => {
      expect(parse({ ...mc, evidence: [evidence[0]] }).success).toBe(false);
      expect(parse({ ...mc, evidence: undefined }).success).toBe(false);
    });

    it("accepts fundamentals questions without evidence", () => {
      expect(
        parse({ ...mc, fundamentals: true, evidence: undefined }).success,
      ).toBe(true);
    });

    it("rejects an unknown evidence type", () => {
      const bad = [{ type: "rumor", url: "https://example.com" }, evidence[1]];
      expect(parse({ ...mc, evidence: bad }).success).toBe(false);
    });
  });

  describe("seniority", () => {
    it("rejects an unknown level", () => {
      expect(parse({ ...mc, seniority: ["principal"] }).success).toBe(false);
    });

    it("rejects an empty list", () => {
      expect(parse({ ...mc, seniority: [] }).success).toBe(false);
    });
  });

  describe("multiple-choice", () => {
    it("rejects an answer that is not an option id", () => {
      expect(parse({ ...mc, answer: "z" }).success).toBe(false);
    });

    it("rejects duplicate option ids", () => {
      const options = [
        { id: "a", text: "One" },
        { id: "a", text: "Two" },
      ];
      expect(parse({ ...mc, options }).success).toBe(false);
    });

    it("rejects fewer than 2 options", () => {
      expect(
        parse({ ...mc, options: [{ id: "a", text: "Only" }] }).success,
      ).toBe(false);
    });

    it("rejects more than 6 options", () => {
      const options = ["a", "b", "c", "d", "e", "f", "g"].map((id) => ({
        id,
        text: id,
      }));
      expect(parse({ ...mc, options }).success).toBe(false);
    });
  });

  describe("spot-the-bug", () => {
    const stb = validByType["spot-the-bug"];

    it("rejects a bugLine beyond the code", () => {
      expect(parse({ ...stb, bugLine: 3 }).success).toBe(false);
    });

    it("rejects a bugLine below 1", () => {
      expect(parse({ ...stb, bugLine: 0 }).success).toBe(false);
    });
  });

  it("rejects an unknown type", () => {
    expect(parse({ ...base, type: "exercise" }).success).toBe(false);
  });

  // Self-assessed types are deferred until AI answer evaluation (Phase 3+).
  describe("deferred self-assessed content", () => {
    it.each([
      ["open", {}],
      ["behavioral", { checklist: ["Situation is clear"] }],
      [
        "system-design",
        { steps: ["Clarify requirements"], rubric: ["Identifies bottlenecks"] },
      ],
    ])("rejects the %s type", (type, fields) => {
      expect(parse({ ...base, type, ...fields }).success).toBe(false);
    });

    it("rejects the behavioral category", () => {
      expect(parse({ ...mc, category: "behavioral" }).success).toBe(false);
    });
  });

  it("rejects an invalid locale", () => {
    expect(parse({ ...mc, locale: "fr" }).success).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(parse({ ...mc, category: "devops" }).success).toBe(false);
  });

  it("rejects unknown fields so typos are caught", () => {
    expect(parse({ ...mc, fundamental: true }).success).toBe(false);
  });

  it("rejects unknown fields in type-specific variants", () => {
    expect(parse({ ...mc, anwser: "a" }).success).toBe(false);
  });
});
