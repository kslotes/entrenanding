import { z } from "astro/zod";

export const locales = ["es", "en"] as const;
export const categories = [
  "algorithms",
  "frontend",
  "backend",
  "behavioral",
  "system-design",
] as const;
export const seniorities = ["jr", "ssr", "sr"] as const;
export const evidenceTypes = ["interview-report", "job-posting"] as const;

export const MIN_EVIDENCE = 2;

const evidenceSchema = z.strictObject({
  type: z.enum(evidenceTypes),
  url: z.url(),
});

// Strict so frontmatter typos fail validation instead of being dropped.
const baseSchema = z.strictObject({
  title: z.string().min(1),
  locale: z.enum(locales),
  category: z.enum(categories),
  stack: z.array(z.string().min(1)),
  seniority: z.array(z.enum(seniorities)).min(1),
  fundamentals: z.boolean(),
  evidence: z.array(evidenceSchema).default([]),
});

const codeFields = {
  code: z.string().min(1),
  language: z.string().min(1),
};

const countLines = (code: string) => code.replace(/\n$/, "").split("\n").length;

const openSchema = baseSchema.extend({ type: z.literal("open") });

const multipleChoiceSchema = baseSchema
  .extend({
    type: z.literal("multiple-choice"),
    options: z
      .array(z.strictObject({ id: z.string().min(1), text: z.string().min(1) }))
      .min(2)
      .max(6)
      .refine(
        (options) => new Set(options.map((o) => o.id)).size === options.length,
        {
          message: "Option ids must be unique",
        },
      ),
    answer: z.string().min(1),
  })
  .refine((q) => q.options.some((o) => o.id === q.answer), {
    message: "Answer must be one of the option ids",
    path: ["answer"],
  });

const predictOutputSchema = baseSchema.extend({
  type: z.literal("predict-output"),
  ...codeFields,
  expectedOutput: z.string(),
});

const spotTheBugSchema = baseSchema
  .extend({
    type: z.literal("spot-the-bug"),
    ...codeFields,
    bugLine: z.int().min(1),
  })
  .refine((q) => q.bugLine <= countLines(q.code), {
    message: "bugLine must point to a line within code",
    path: ["bugLine"],
  });

const behavioralSchema = baseSchema.extend({
  type: z.literal("behavioral"),
  checklist: z.array(z.string().min(1)).min(1),
});

const systemDesignSchema = baseSchema.extend({
  type: z.literal("system-design"),
  steps: z.array(z.string().min(1)).min(1),
  rubric: z.array(z.string().min(1)).min(1),
});

export const questionSchema = z
  .discriminatedUnion("type", [
    openSchema,
    multipleChoiceSchema,
    predictOutputSchema,
    spotTheBugSchema,
    behavioralSchema,
    systemDesignSchema,
  ])
  .refine((q) => q.fundamentals || q.evidence.length >= MIN_EVIDENCE, {
    message: `Questions with fundamentals: false need at least ${MIN_EVIDENCE} evidence items`,
    path: ["evidence"],
  });

export type Question = z.infer<typeof questionSchema>;
export type QuestionType = Question["type"];
export type Locale = (typeof locales)[number];
export type Evidence = z.infer<typeof evidenceSchema>;
