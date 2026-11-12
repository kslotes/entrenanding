import { describe, expect, it } from "vitest";
import {
  gradeChoice,
  gradeLine,
  gradeOutput,
  normalizeOutput,
} from "./grading";
import { codeLines, parseQuestionId, questionHref } from "./questions";

describe("parseQuestionId", () => {
  it("splits a collection id into category and slug", () => {
    expect(parseQuestionId("backend/spring-default-bean-scope")).toEqual({
      category: "backend",
      slug: "spring-default-bean-scope",
    });
  });

  it("rejects ids that are not <category>/<slug>", () => {
    expect(() => parseQuestionId("backend")).toThrow(
      'Unexpected question id "backend"',
    );
    expect(() => parseQuestionId("behavioral/conflict")).toThrow(
      'Unexpected question id "behavioral/conflict"',
    );
  });
});

describe("questionHref", () => {
  it("points to the question page", () => {
    expect(questionHref({ category: "frontend", slug: "var-closure" })).toBe(
      "/preguntas/frontend/var-closure/",
    );
  });
});

describe("gradeChoice", () => {
  it("passes when the selected option is the answer", () => {
    expect(gradeChoice("a", "a")).toEqual({ pass: true, expected: "a" });
  });

  it("fails and reports the expected option otherwise", () => {
    expect(gradeChoice("c", "a")).toEqual({ pass: false, expected: "a" });
  });
});

describe("normalizeOutput", () => {
  it("unifies line endings and drops trailing whitespace and blank lines", () => {
    expect(normalizeOutput("3  \r\n3\t\r\n3\r\n\r\n")).toBe("3\n3\n3");
  });

  it("keeps leading whitespace and blank lines between output lines", () => {
    expect(normalizeOutput("  a\n\n  b")).toBe("  a\n\n  b");
  });
});

describe("gradeOutput", () => {
  it("passes when the normalized outputs match", () => {
    expect(gradeOutput("3\r\n3\r\n3\r\n", "3\n3\n3")).toEqual({
      pass: true,
      expected: "3\n3\n3",
    });
  });

  it("is case and leading-space sensitive", () => {
    expect(gradeOutput("True", "true").pass).toBe(false);
    expect(gradeOutput(" 3", "3").pass).toBe(false);
  });

  it("fails on an empty answer", () => {
    expect(gradeOutput("", "3").pass).toBe(false);
  });
});

describe("gradeLine", () => {
  it("passes on the bug line and reports it otherwise", () => {
    expect(gradeLine(3, 3)).toEqual({ pass: true, expected: "3" });
    expect(gradeLine(4, 3)).toEqual({ pass: false, expected: "3" });
  });
});

describe("codeLines", () => {
  it("splits code into lines, ignoring the final newline", () => {
    expect(codeLines("int a;\nint b;\n")).toEqual(["int a;", "int b;"]);
  });
});
