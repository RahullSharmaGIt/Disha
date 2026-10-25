import { z } from 'zod';

export const quizResponseSchema = z.object({
  versionId: z.string().min(1, 'Quiz version is required'),
  responses: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedValues: z.array(z.string()).min(1, 'Select at least one option'),
      })
    )
    .min(1, 'At least one response is required'),
});

export type QuizResponseInput = z.infer<typeof quizResponseSchema>;
