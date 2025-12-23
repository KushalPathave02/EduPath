import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2, { message: "Each question must have at least 2 options" }),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional()
}).refine(data => data.correctIndex < data.options.length, {
  message: "correctIndex must be a valid index for the options array",
  path: ["correctIndex"],
});

export const QuizSchema = z.object({
  subject: z.string(),
  level: z.string(),
  questions: z.array(QuestionSchema)
});

export type QuizPayload = z.infer<typeof QuizSchema>;

export const QuizSubmissionSchema = z.object({
  quiz: QuizSchema,
  answers: z.array(z.number().int().min(0).max(3))
});

export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;
