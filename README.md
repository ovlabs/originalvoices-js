# OriginalVoices for JavaScript

Ask Digital Twins of real people from your code, terminal or agent. Docs: [docs.originalvoices.ai](https://docs.originalvoices.ai)

| Package | What it is |
| --- | --- |
| [`originalvoices`](packages/sdk) | TypeScript client for the API |
| [`@originalvoices/cli`](packages/cli) | `ov` command-line tool |
| [`@originalvoices/ai-sdk`](packages/ai-sdk) | Tools for the Vercel AI SDK |
| [`@originalvoices/mcp-server`](packages/mcp-server) | Local (stdio) MCP server. Prefer the hosted one at `https://api.originalvoices.ai/mcp`. |

## Development

```bash
npm install
npm run build       # all packages, SDK first
npm run typecheck
npm test
```

The SDK's types are generated from the live API spec:

```bash
npm run generate    # rewrites packages/sdk/src/schema.d.ts
```

A daily workflow does this and opens a PR when the API changes, so a breaking API change shows up as a failing build here.

## Releasing

1. In your PR, run `npx changeset` and pick the packages and bump type.
2. Merge. The release workflow opens a "Version packages" PR.
3. Merge that to publish to npm. Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so there's no npm token in the repo.
