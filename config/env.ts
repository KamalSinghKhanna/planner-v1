type EnvMode = "development" | "production" | "test";

const ensureEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`[config/env] Missing required environment variable: ${key}`);
  }
  return value;
};

const normalizeNodeEnv = (mode: string | undefined): EnvMode => {
  if (mode === "production" || mode === "test") {
    return mode;
  }
  return "development";
};

export const env = {
  NODE_ENV: normalizeNodeEnv(process.env.NODE_ENV),
  APP_NAME: ensureEnv("APP_NAME"),
  DATABASE_URL: ensureEnv("DATABASE_URL"),
  NEXT_PUBLIC_BASE_URL: ensureEnv("NEXT_PUBLIC_BASE_URL"),
  OPENAI_API_KEY: ensureEnv("OPENAI_API_KEY"),
  OPENAI_MODEL: ensureEnv("OPENAI_MODEL", "gpt-4o-mini")
} as const;
