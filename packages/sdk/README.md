# originalvoices

TypeScript client for the [OriginalVoices API](https://docs.originalvoices.ai/api/reference/). Ask Digital Twins of real people open and choice questions.

```bash
npm install originalvoices
```

```ts
import { OriginalVoices } from "originalvoices";

const ov = new OriginalVoices(); // reads ORIGINALVOICES_API_KEY

const result = await ov.ask({
  target: { audience: "UK, 18-30, fitness enthusiasts" },
  questions: [
    { id: "pick", type: "choice", question: "Which matters most?", choices: ["Price", "Comfort", "Style"] },
    { id: "why", type: "open", question: "Why did you pick that?" },
  ],
});

result.questions[0].results;         // [{ choice, count, percentage }, …]
result.participants[0].answers.why;  // { answer, confidence }
```

Get an API key at [platform.originalvoices.ai](https://platform.originalvoices.ai) under **Developers → API Keys**.

## Methods

| Method | Endpoint |
| --- | --- |
| `ov.ask(params)` | `POST /v1/ask` |
| `ov.audiences.list()` | `GET /v1/audiences` |
| `ov.audiences.create({ title, prompt })` | `POST /v1/audiences` |
| `ov.audiences.update(id, { title })` | `PATCH /v1/audiences/{id}` |
| `ov.audiences.delete(id)` | `DELETE /v1/audiences/{id}` |
| `ov.studies.list()` | `GET /v1/studies` |
| `ov.studies.participants(studyId)` | `GET /v1/studies/{studyId}/participants` |

Each returns the response's `data`. Field-by-field docs are in the [API reference](https://docs.originalvoices.ai/api/reference/) and in your editor, since the types come straight from the API spec.

## Options

```ts
new OriginalVoices({
  apiKey: "…",                              // default: ORIGINALVOICES_API_KEY
  baseURL: "https://api.originalvoices.ai", // default
  timeout: 300_000,                         // ms; asks take tens of seconds
});
```

## Errors

Failed requests throw an `OriginalVoicesError` with the API's `status`, `code`, `message` and `requestId`:

```ts
import { OriginalVoicesError } from "originalvoices";

try {
  await ov.ask({ target: { audience: "…" }, questions: [{ type: "open", question: "…" }] });
} catch (e) {
  if (e instanceof OriginalVoicesError && e.code === "insufficient_twins") {
    // broaden the audience
  }
}
```

See [Errors & limits](https://docs.originalvoices.ai/api/errors) for every code.

## Upgrading from 0.x

1.0 replaces the generated 0.x client. `ask.open()` and `ask.choices()` are now one `ask()`, results come back unwrapped (no `.data`), and projects are gone (use studies).
