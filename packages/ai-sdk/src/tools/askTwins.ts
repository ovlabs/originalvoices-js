import { tool } from 'ai';
import { z } from 'zod';
import { OriginalVoices, type AskQuestion, type AskResult } from 'originalvoices';

const questionSchema = z.union([
  z.string().min(1).max(2048),
  z.object({
    question: z.string().min(1).max(2048),
    choices: z
      .array(z.string().min(1).max(255))
      .min(2)
      .max(20)
      .optional()
      .describe('2-20 distinct options. Omit for an open question.'),
    multiple: z.boolean().optional().describe('Allow several picks. Defaults to false.'),
  }),
]);

/**
 * Input schema for the askTwins tool.
 * Defines the structure of inputs that LLMs will provide when calling this tool.
 */
export const askTwinsInputSchema = z.object({
  audience: z
    .string()
    .min(1)
    .max(2048)
    .optional()
    .describe(
      'Who to ask, in plain words, passed through as the user describes it. Use this unless the user ' +
        'refers to a saved audience or a study. Typically demographics such as age range, gender and ' +
        'location. It describes WHO to ask, not WHAT they care about. ' +
        'Examples: "UK, 18-30, fitness enthusiasts", "Parents aged 30-45 in Germany".'
    ),
  audienceId: z
    .string()
    .min(1)
    .max(256)
    .optional()
    .describe('A saved audience id from listAudiences, instead of audience.'),
  studyId: z
    .string()
    .uuid()
    .optional()
    .describe('A study id from listStudies, instead of audience: its participants answer.'),
  questions: z
    .array(questionSchema)
    .min(1)
    .max(15)
    .describe(
      'The questions to ask, 1-15, in order. An open question is a plain string. A choice question is ' +
        'an object { question, choices: 2-20 distinct options, multiple?: true to allow several picks }. ' +
        'Each Twin answers all questions in one conversation, so an open question after a choice question ' +
        'can ask why they picked it. Use choice questions when you need numbers or a preference between options.'
    ),
  filter: z
    .string()
    .min(1)
    .max(1024)
    .optional()
    .describe(
      'Only with studyId. Narrows participants in plain words, e.g. "said price was the main barrier".'
    ),
  sampleSize: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .describe('How many participants to ask. Defaults to 25 for a described audience. Audiences take at most 100.'),
});

/**
 * Type for the input parameters of askTwins tool.
 */
export type AskTwinsInput = z.infer<typeof askTwinsInputSchema>;

/**
 * Response from askTwins: the `data` of POST /v1/ask.
 */
export type AskTwinsResponse = AskResult;

/** Tool questions to POST /v1/ask questions, with ids q1, q2, … in order. */
function toAskQuestions(questions: AskTwinsInput['questions']): AskQuestion[] {
  return questions.map((q, i): AskQuestion => {
    const id = `q${i + 1}`;
    if (typeof q === 'string') return { id, type: 'open', question: q };
    if (!q.choices) return { id, type: 'open', question: q.question };
    return {
      id,
      type: 'choice',
      question: q.question,
      choices: q.choices,
      isMultipleChoice: q.multiple ?? false,
    };
  });
}

/**
 * askTwins tool for Vercel AI SDK.
 *
 * Lets the model ask Digital Twins of real people open and choice questions,
 * using POST /v1/ask.
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai';
 * import { askTwins } from '@originalvoices/ai-sdk';
 *
 * const result = await generateText({
 *   model: YOUR_MODEL,
 *   tools: { askTwins },
 *   prompt: 'What do UK fitness enthusiasts aged 18-30 look for in running shoes?',
 * });
 * ```
 */
export const askTwins = tool({
  description:
    "Ask questions to Digital Twins and get each Twin's individual answers. Each Digital Twin " +
    'represents a real person: it is built from their data, experiences and opinions, and owned and ' +
    'trained by that person. Pass exactly one of audience (who to ask, in words — the default), ' +
    'audienceId (from listAudiences) or studyId (from listStudies). Questions can be open (a string) ' +
    'or choice (an object with choices). Every answer carries a low, medium or high confidence. ' +
    'Billed per Twin answer (Twins × questions).',
  inputSchema: askTwinsInputSchema,
  execute: async ({
    audience,
    audienceId,
    studyId,
    questions,
    filter,
    sampleSize,
  }: AskTwinsInput): Promise<AskTwinsResponse> => {
    return new OriginalVoices().ask({
      target: { audience, audienceId, studyId },
      questions: toAskQuestions(questions),
      filter,
      sampleSize,
    });
  },
});
