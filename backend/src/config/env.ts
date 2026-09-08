import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  COACH_FINANCIAL_ENCRYPTION_KEY: z.string().length(32),
  GOOGLE_CALENDAR_SA_EMAIL: z.string().optional(),
  GOOGLE_CALENDAR_SA_KEY_PATH: z.string().optional(),
  GOOGLE_CALENDAR_ID_DEV: z.string().optional(),
  GOOGLE_CALENDAR_ID_STAGING: z.string().optional(),
  GOOGLE_CALENDAR_ID_PROD: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Environment validation failed:");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
  throw new Error(`Environment validation failed: ${result.error.message}`);
}

const env = result.data;

function resolveCalendarId(): string | undefined {
  const calendarMap: Record<string, string | undefined> = {
    development: env.GOOGLE_CALENDAR_ID_DEV,
    production: env.GOOGLE_CALENDAR_ID_PROD,
    test: env.GOOGLE_CALENDAR_ID_DEV,
  };
  return calendarMap[env.NODE_ENV];
}

export { env, resolveCalendarId };
