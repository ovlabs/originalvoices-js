import createClient from "openapi-fetch";
import type { operations, paths } from "./schema.js";

type Body<Op extends keyof operations> = operations[Op] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

type Data<Op extends keyof operations> = operations[Op] extends {
  responses: { 200: { content: { "application/json": { data: infer D } } } };
}
  ? D
  : never;

export type AskParams = Body<"ask">;
export type AskQuestion = AskParams["questions"][number];
export type AskResult = Data<"ask">;
export type Participant = AskResult["participants"][number];
export type Audience = Data<"listAudiences">["audiences"][number];
export type CreateAudienceParams = Body<"createAudience">;
export type Study = Data<"listStudies">[number];
export type StudyParticipants = Data<"listStudyParticipants">;
export type { paths, operations };

export interface ClientOptions {
  /** Defaults to the ORIGINALVOICES_API_KEY environment variable. */
  apiKey?: string;
  /** Defaults to https://api.originalvoices.ai */
  baseURL?: string;
  /** Request timeout in ms. Asks take tens of seconds, so the default is 5 minutes. */
  timeout?: number;
}

/** An error response from the API, with its status, `code` and `requestId`. */
export class OriginalVoicesError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code: string, requestId?: string, details?: unknown) {
    super(message);
    this.name = "OriginalVoicesError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

interface ErrorBody {
  requestId?: string;
  error?: { message?: string; code?: string; details?: unknown } | null;
}

export class OriginalVoices {
  private readonly http;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ORIGINALVOICES_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing API key. Pass { apiKey } or set ORIGINALVOICES_API_KEY. " +
          "Create one at https://platform.originalvoices.ai under Developers → API Keys.",
      );
    }
    const timeout = options.timeout ?? 5 * 60 * 1000;

    this.http = createClient<paths>({
      baseUrl: (options.baseURL ?? "https://api.originalvoices.ai").replace(/\/$/, ""),
      headers: { Authorization: `Bearer ${apiKey}` },
      fetch: (request) => fetch(request, { signal: AbortSignal.timeout(timeout) }),
    });
  }

  /** Unwraps `data`, or throws an OriginalVoicesError. */
  private async unwrap<T>(
    call: Promise<{ data?: { data: T }; error?: unknown; response: Response }>,
  ): Promise<T> {
    const { data, error, response } = await call;
    if (data) return data.data;
    const body = (error ?? {}) as ErrorBody;
    throw new OriginalVoicesError(
      body.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body.error?.code ?? "unknown_error",
      body.requestId,
      body.error?.details,
    );
  }

  /**
   * Ask a described audience, a saved audience or a study's participants up to
   * 15 open and choice questions. Billed per answer: participants × questions.
   */
  ask(params: AskParams): Promise<AskResult> {
    return this.unwrap(this.http.POST("/v1/ask", { body: params }));
  }

  readonly audiences = {
    /** Your organisation's saved audiences. */
    list: () => this.unwrap(this.http.GET("/v1/audiences")).then((d) => d.audiences),
    /** Save an audience; its matching Twins are fixed at this moment. */
    create: (params: CreateAudienceParams) =>
      this.unwrap(this.http.POST("/v1/audiences", { body: params })),
    /** Rename an audience. */
    update: (id: string, params: { title: string }) =>
      this.unwrap(
        this.http.PATCH("/v1/audiences/{id}", { params: { path: { id } }, body: params }),
      ),
    /** Delete an audience. */
    delete: (id: string) =>
      this.unwrap(this.http.DELETE("/v1/audiences/{id}", { params: { path: { id } } })),
  };

  readonly studies = {
    /** Your organisation's studies with a finished run. */
    list: () => this.unwrap(this.http.GET("/v1/studies")),
    /** A study's participants; pass their `twinId`s as `twinIds` on ask(). */
    participants: (studyId: string) =>
      this.unwrap(
        this.http.GET("/v1/studies/{studyId}/participants", {
          params: { path: { studyId } },
        }),
      ),
  };
}

export default OriginalVoices;
