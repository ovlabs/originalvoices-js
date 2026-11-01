# OriginalVoices MCP Server

[![npm version](https://img.shields.io/npm/v/@originalvoices/mcp-server.svg)](https://www.npmjs.com/package/@originalvoices/mcp-server)

A local (stdio) MCP server for [OriginalVoices](https://originalvoices.ai): ask Digital Twins of real people from any MCP client.

Most clients can connect to the hosted server at `https://api.originalvoices.ai/mcp` instead, with no install. See [Connect your assistant](https://docs.originalvoices.ai/connect).

## Installation

```bash
npm install @originalvoices/mcp-server
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ORIGINALVOICES_API_KEY` | Your OriginalVoices API key | Yes |

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "originalvoices": {
      "command": "npx",
      "args": ["@originalvoices/mcp-server"],
      "env": {
        "ORIGINALVOICES_API_KEY": "your-api-key"
      }
    }
  }
}
```

### From Source

```json
{
  "mcpServers": {
    "originalvoices": {
      "command": "node",
      "args": ["/path/to/originalvoices-js/packages/mcp-server/dist/index.js"],
      "env": {
        "ORIGINALVOICES_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Tools

Same tools as the hosted server at `https://api.originalvoices.ai/mcp`, which is the recommended way to connect if your client supports HTTP.

### ask_twins

Ask up to 15 questions to Digital Twins. Pass exactly one of `audience`, `audienceId` or `studyId`.

| Name | Type | Description |
|------|------|-------------|
| `questions` | array, required | A string is an open question. `{ question, choices, multiple? }` is a choice question with 2-20 options. |
| `audience` | string | Who to ask, in plain words |
| `audienceId` | string | A saved audience from `list_audiences` |
| `studyId` | string | A study from `list_studies`; its participants answer |
| `filter` | string | Only with `studyId`: narrow participants in plain words |
| `sampleSize` | integer | How many participants to ask |

```json
{
  "audience": "UK, 18-30, fitness enthusiasts",
  "questions": [
    { "question": "Which matters most in a running shoe?", "choices": ["Price", "Comfort", "Style"] },
    "Why did you pick that?"
  ]
}
```

### list_audiences

Lists your saved audiences. Pass an `id` to `ask_twins` as `audienceId`.

### list_studies

Lists your finished studies. Pass an `id` to `ask_twins` as `studyId`.

## Development

See the [repo README](../../README.md).

## FAQ

### How do I get an API key?

You can create an API key on the [OriginalVoices Platform](https://platform.originalvoices.ai).

## License

MIT
