// Pure grading for the auto-graded question types. No imports: it runs in the
// browser, so it must not pull the content schema into the client bundle.

export interface Grade {
  pass: boolean;
  /** The correct answer as shown to the learner. */
  expected: string;
}

export const gradeChoice = (selected: string, answer: string): Grade => ({
  pass: selected === answer,
  expected: answer,
});

/**
 * Output is compared as text after unifying line endings and dropping
 * trailing whitespace on each line and trailing blank lines, which are
 * invisible in a terminal. Everything else, including case and leading
 * spaces, must match.
 */
export const normalizeOutput = (output: string) =>
  output
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

export const gradeOutput = (output: string, expectedOutput: string): Grade => {
  const expected = normalizeOutput(expectedOutput);
  return { pass: normalizeOutput(output) === expected, expected };
};

export const gradeLine = (line: number, bugLine: number): Grade => ({
  pass: line === bugLine,
  expected: String(bugLine),
});
