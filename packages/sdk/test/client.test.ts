import { test } from "node:test";
import assert from "node:assert/strict";
import { OriginalVoices, OriginalVoicesError } from "../src/index.ts";

function mockFetch(status: number, body: unknown) {
  const calls: Request[] = [];
  globalThis.fetch = (async (req: Request) => {
    calls.push(req);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

test("ask posts to /v1/ask with the key and returns data", async () => {
  const calls = mockFetch(200, { requestId: "r1", data: { asked: 2 }, error: null });
  const ov = new OriginalVoices({ apiKey: "k" });
  const result = await ov.ask({
    target: { audience: "UK adults" },
    questions: [{ type: "open", question: "Why?" }],
  });
  assert.deepEqual(result, { asked: 2 });
  assert.equal(calls[0].url, "https://api.originalvoices.ai/v1/ask");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].headers.get("authorization"), "Bearer k");
  assert.deepEqual(await calls[0].json(), {
    target: { audience: "UK adults" },
    questions: [{ type: "open", question: "Why?" }],
  });
});

test("errors throw OriginalVoicesError with the API's code and message", async () => {
  mockFetch(422, {
    requestId: "r2",
    data: null,
    error: { message: "Insufficient twins", code: "insufficient_twins" },
  });
  const ov = new OriginalVoices({ apiKey: "k" });
  await assert.rejects(
    ov.ask({ target: { audience: "x" }, questions: [{ type: "open", question: "?" }] }),
    (e: unknown) =>
      e instanceof OriginalVoicesError &&
      e.status === 422 &&
      e.code === "insufficient_twins" &&
      e.message === "Insufficient twins" &&
      e.requestId === "r2",
  );
});

test("audiences.list unwraps the array and update uses the path param", async () => {
  const calls = mockFetch(200, { requestId: "r", data: { audiences: [{ id: "a" }] }, error: null });
  const ov = new OriginalVoices({ apiKey: "k", baseURL: "https://example.test/" });
  assert.deepEqual(await ov.audiences.list(), [{ id: "a" }]);
  assert.equal(calls[0].url, "https://example.test/v1/audiences");
  const patch = mockFetch(200, { requestId: "r", data: { id: "a", title: "t" }, error: null });
  await ov.audiences.update("a b", { title: "t" });
  assert.equal(patch[0].method, "PATCH");
  assert.equal(patch[0].url, "https://example.test/v1/audiences/a%20b");
});

test("throws without an API key", () => {
  delete process.env.ORIGINALVOICES_API_KEY;
  assert.throws(() => new OriginalVoices(), /Missing API key/);
});
