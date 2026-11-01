# OriginalVoices AI SDK

[![npm version](https://img.shields.io/npm/v/@originalvoices/ai-sdk.svg)](https://www.npmjs.com/package/@originalvoices/ai-sdk)

Vercel AI SDK tools that provide access to OriginalVoices' network of Digital Twins for real-time audience research.

## Installation

```bash
npm install @originalvoices/ai-sdk
```

**Peer Dependencies:** This package requires `ai` (^6.0.0) and `zod` (^4.0.0) as peer dependencies. If you're using the Vercel AI SDK, you likely already have these installed.

## Setup

1. Get your API key from [OriginalVoices](https://platform.originalvoices.ai)

2. Set your API key as an environment variable:
```env
ORIGINALVOICES_API_KEY=your_api_key_here
```

## Usage

```typescript
import { generateText, stepCountIs } from 'ai';
import { askTwins, listAudiences, listStudies } from '@originalvoices/ai-sdk';

const result = await generateText({
  model: YOUR_MODEL, // e.g. anthropic('claude-sonnet-5-5'), openai('gpt-5')
  tools: { askTwins, listAudiences, listStudies },
  stopWhen: stepCountIs(5),
  prompt: 'What do UK fitness enthusiasts aged 18-30 look for in running shoes?',
});

console.log(result.text);
```

## Tools

### askTwins

Asks Digital Twins of real people up to 15 open and choice questions, using `POST /v1/ask`. Pass exactly one of `audience`, `audienceId` or `studyId`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `questions` | array, required | A string is an open question. `{ question, choices, multiple? }` is a choice question with 2-20 options. |
| `audience` | `string` | Who to ask, in plain words, e.g. `"UK, 18-30, fitness enthusiasts"` |
| `audienceId` | `string` | A saved audience from `listAudiences` |
| `studyId` | `string` | A study from `listStudies`; its participants answer |
| `filter` | `string` | Only with `studyId`: narrow participants in plain words |
| `sampleSize` | `number` | How many participants to ask (default 25 for a described audience) |

Returns the `POST /v1/ask` response: each participant's demographics and answers (with `low`/`medium`/`high` confidence), plus per-option results for choice questions. See the [API reference](https://docs.originalvoices.ai/api/reference/ask.html).

### listAudiences

Lists your saved audiences, for `askTwins`' `audienceId`.

### listStudies

Lists your finished studies, for `askTwins`' `studyId`.

## Examples

See the [examples](./examples) directory for more usage examples.

```bash
# Run the example (requires ORIGINALVOICES_API_KEY to be set)
npx tsx examples/askTwins.example.ts
```

## Development

See the [repo README](../../README.md).

## Links

- [OriginalVoices](https://platform.originalvoices.ai) - Get your API key
- [Vercel AI SDK](https://ai-sdk.dev) - AI SDK documentation
- [GitHub Repository](https://github.com/ovlabs/originalvoices-js)

## License

MIT © [OriginalVoices](https://originalvoices.ai)
