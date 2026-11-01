#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OriginalVoices, OriginalVoicesError, type AskQuestion } from "originalvoices";

const server = new McpServer({
  name: "originalvoices",
  version: "2.0.0",
});

// Created on first use, so a missing key shows up as a tool error rather than a crash.
let client: OriginalVoices | undefined;
const ov = () => (client ??= new OriginalVoices());

// Same tools and descriptions as the hosted server at https://api.originalvoices.ai/mcp.

const QuestionSchema = z.union([
  z.string().min(1).max(2048),
  z.object({
    question: z.string().min(1).max(2048),
    choices: z
      .array(z.string().min(1).max(255))
      .min(2)
      .max(20)
      .optional()
      .describe("2-20 distinct options. Omit for an open question."),
    multiple: z.boolean().optional().describe("Allow several picks. Defaults to false."),
  }),
]);

type Question = z.infer<typeof QuestionSchema>;

/** MCP questions to POST /v1/ask questions, with ids q1, q2, … in order. */
function toAskQuestions(questions: Question[]): AskQuestion[] {
  return questions.map((q, i): AskQuestion => {
    const id = `q${i + 1}`;
    if (typeof q === "string") return { id, type: "open", question: q };
    if (!q.choices) return { id, type: "open", question: q.question };
    return {
      id,
      type: "choice",
      question: q.question,
      choices: q.choices,
      isMultipleChoice: q.multiple ?? false,
    };
  });
}

function result(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(error: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          error: error instanceof OriginalVoicesError ? error.code : "error",
          message: error instanceof Error ? error.message : String(error),
        }),
      },
    ],
    isError: true,
  };
}

server.tool(
  "ask_twins",
  [
    "Ask questions to Digital Twins and get each Twin's individual answers.",
    "Each Digital Twin represents a real person: it is built from their data, experiences and opinions, and owned and trained by that person.",
    "Pass exactly one of: audience (who to ask, described in words — the default), audienceId (a saved or network audience from list_audiences) or studyId (a study from list_studies; each participant's Digital Twin answers with that person's whole study conversation in context).",
    "Questions can be open (a plain string, answered in the Twin's own words) or choice (an object with choices, returning the share of Twins that picked each option). Each Twin answers all questions in order in one conversation, so an open question after a choice question can ask why they picked it. Every answer carries a low, medium or high confidence.",
    "Answers are billed per Twin answer (Twins × questions).",
  ].join(" "),
  {
    audience: z
      .string()
      .min(1)
      .max(2048)
      .optional()
      .describe(
        "The target audience to query, passed through exactly as the user describes it. Use this unless the user refers to a saved audience or a study. Typically includes demographics such as age range, gender, and location/country. Keep it separate from the questions: the audience describes WHO to ask, not WHAT they care about. Examples: 'Women aged 35-55 in the US and UK', 'Gen Z men (18-25) in urban areas'."
      ),
    audienceId: z
      .string()
      .min(1)
      .max(256)
      .optional()
      .describe(
        "A saved or network audience to ask, instead of audience. Obtain IDs from list_audiences: a UUID for a saved audience, or '{networkId}:{audienceSlug}' for a network audience."
      ),
    studyId: z
      .string()
      .uuid()
      .optional()
      .describe("A study id from list_studies, instead of audience: its participants answer."),
    questions: z
      .array(QuestionSchema)
      .min(1)
      .max(15)
      .describe(
        "The questions to ask, 1-15, in order. An open question is a plain string. A choice question is an object { question, choices: 2-20 distinct options, multiple?: true to allow several picks }. Open questions work best for qualitative insights; use choice questions for numbers, shares or a preference between options."
      ),
    filter: z
      .string()
      .min(1)
      .max(1024)
      .optional()
      .describe(
        "Only with studyId. Free-text criteria matched against each participant's profile and what they said in the study, e.g. 'said price was the main barrier'. Omit to ask everyone."
      ),
    sampleSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe(
        "How many participants to ask. Defaults: described audiences 25; saved audiences everyone up to 100; interview studies everyone; twin-survey studies 25. Audiences take at most 100."
      ),
  },
  async ({ audience, audienceId, studyId, questions, filter, sampleSize }) => {
    try {
      return result(
        await ov().ask({
          target: { audience, audienceId, studyId },
          questions: toAskQuestions(questions),
          filter,
          sampleSize,
        })
      );
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "list_audiences",
  "List the saved audiences in the user's organization. Pass an entry's `id` to ask_twins as audienceId.",
  {},
  async () => {
    try {
      return result(await ov().audiences.list());
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "list_studies",
  [
    "List the organization's finished studies.",
    "kind HUMAN_INTERVIEW: real people interviewed one-to-one by an AI moderator.",
    "kind TWIN_SURVEY: a questionnaire answered by Digital Twins.",
    "Each entry has the participant count and the study's questions. Pass the returned `id` to ask_twins as studyId.",
  ].join(" "),
  {},
  async () => {
    try {
      return result(await ov().studies.list());
    } catch (error) {
      return errorResult(error);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
