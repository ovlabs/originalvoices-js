import { tool } from 'ai';
import { z } from 'zod';
import { OriginalVoices, type Audience, type Study } from 'originalvoices';

/** Lists saved audiences, for askTwins' audienceId. */
export const listAudiences = tool({
  description:
    "List the saved audiences in the user's organization. Pass an entry's id to askTwins as audienceId.",
  inputSchema: z.object({}),
  execute: (): Promise<Audience[]> => new OriginalVoices().audiences.list(),
});

/** Lists finished studies, for askTwins' studyId. */
export const listStudies = tool({
  description:
    "List the organization's finished studies. HUMAN_INTERVIEW: real people interviewed one-to-one " +
    'by an AI moderator. TWIN_SURVEY: a questionnaire answered by Digital Twins. ' +
    "Pass an entry's id to askTwins as studyId.",
  inputSchema: z.object({}),
  execute: (): Promise<Study[]> => new OriginalVoices().studies.list(),
});
