import { env } from "./env";

export const appConfig = {
  name: env.APP_NAME,
  baseUrl: env.NEXT_PUBLIC_BASE_URL,
  maxDailyPriorities: 3,
  dayStartHour: 6,
  isDev: env.NODE_ENV === "development"
};
