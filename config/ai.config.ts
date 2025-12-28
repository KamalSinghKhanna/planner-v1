import { env } from "./env";

export const aiConfig = {
  model: env.OPENAI_MODEL,
  apiKey: env.OPENAI_API_KEY,
  maxResponseTokens: 1200,
  requestTimeoutMs: 60_000
};
