import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  AUTH_ENABLED: z.coerce.boolean().default(false),
  AUTH_LOGIN_PASSWORD: z.string().min(1).default("dev-pass-123"),
  AUTH_TOKEN_SECRET: z.string().min(16).default("dev-token-secret-change-me"),
  AUTH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(28_800),
  AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  AUTH_SUPERADMIN_ACTOR_IDS: z.string().default(""),
  AUTH_ADMIN_ACTOR_IDS: z.string().default(""),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  AZURE_OPENAI_ENABLED: z.coerce.boolean().default(false),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_API_KEY: z.string().min(1).optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().min(1).optional(),
  AZURE_OPENAI_API_VERSION: z.string().min(1).default("2024-10-21"),
  AZURE_OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
  AZURE_OPENAI_INPUT_COST_PER_1K: z.coerce.number().positive().default(0.005),
  AZURE_OPENAI_OUTPUT_COST_PER_1K: z.coerce.number().positive().default(0.015)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

const resolvedEnv = parsed.data;

if (resolvedEnv.AZURE_OPENAI_ENABLED) {
  const missingAzureFields = ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_DEPLOYMENT"].filter(
    (field) => !resolvedEnv[field as "AZURE_OPENAI_ENDPOINT" | "AZURE_OPENAI_API_KEY" | "AZURE_OPENAI_DEPLOYMENT"]
  );

  if (missingAzureFields.length > 0) {
    throw new Error(
      `Invalid environment variables: ${missingAzureFields.join(", ")} must be provided when AZURE_OPENAI_ENABLED=true`
    );
  }
}

export const env = resolvedEnv;
