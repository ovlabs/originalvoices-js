import {
  OriginalVoices,
  OriginalVoicesError,
  type AskParams,
  type CreateAudienceParams,
} from "originalvoices";
import { getApiKey, getBaseUrl } from "./config.js";

export type { AskQuestion, AskResult } from "originalvoices";
export { OriginalVoicesError as OVApiError };

function ov(): OriginalVoices {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new OriginalVoicesError(
      "No API key configured. Run `ov auth login` or set OV_API_KEY.",
      401,
      "missing_api_key"
    );
  }
  return new OriginalVoices({ apiKey, baseURL: getBaseUrl() });
}

// Ask
export const ask = (params: AskParams) => ov().ask(params);

// Audiences
export const listAudiences = () => ov().audiences.list();
export const createAudience = (params: CreateAudienceParams) => ov().audiences.create(params);
export const updateAudienceTitle = (id: string, title: string) =>
  ov().audiences.update(id, { title });
export const deleteAudience = (id: string) => ov().audiences.delete(id);

// Studies
export const listStudies = () => ov().studies.list();

// Health (no auth needed)
export async function healthcheck(): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/v1/healthcheck`);
    return res.ok;
  } catch {
    return false;
  }
}
