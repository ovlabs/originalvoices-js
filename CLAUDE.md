# Project Rules

- Always write "OriginalVoices" as one word (no space)
- `packages/sdk/src/schema.d.ts` is generated from the live API spec with `npm run generate`. Never edit it by hand.
- The SDK (`packages/sdk`) is the only place that talks HTTP. The CLI, AI SDK and MCP server use it.
