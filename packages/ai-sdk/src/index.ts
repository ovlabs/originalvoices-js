/**
 * OriginalVoices AI SDK Tools
 *
 * This package provides Vercel AI SDK tools for interacting with
 * OriginalVoices' network of Digital Twins for real-time audience research.
 *
 * @packageDocumentation
 */

export {
  askTwins,
  askTwinsInputSchema,
  type AskTwinsInput,
  type AskTwinsResponse,
} from './tools/askTwins.js';

export { listAudiences, listStudies } from './tools/lists.js';
