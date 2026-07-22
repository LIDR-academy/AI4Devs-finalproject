import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envBoolean = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off", ""].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  AUTH_ENABLED: envBoolean.default(false),
  AUTH_TOKEN_SECRET: z.string().min(16).default("local-dev-token-secret-1234"),
  AUTH_LOGIN_PASSWORD: z.string().min(1).default("dev-password"),
  AUTH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  AUTH_SUPERADMIN_ACTOR_IDS: z.string().default("local-dev-actor"),
  AUTH_ADMIN_ACTOR_IDS: z.string().default(""),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  AZURE_OPENAI_ENABLED: envBoolean.default(false),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_API_KEY: z.string().min(1).optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().min(1).optional(),
  AZURE_OPENAI_API_VERSION: z.string().min(1).default("2024-10-21"),
  AZURE_OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
  AZURE_OPENAI_INPUT_COST_PER_1K: z.coerce.number().positive().default(0.005),
  AZURE_OPENAI_OUTPUT_COST_PER_1K: z.coerce.number().positive().default(0.015)
}).superRefine((value, ctx) => {
  if (!value.AUTH_ENABLED) {
    return;
  }

  if (value.AUTH_LOGIN_PASSWORD === "dev-password") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["AUTH_LOGIN_PASSWORD"],
      message: "AUTH_LOGIN_PASSWORD must be changed when AUTH_ENABLED=true"
    });
  }

  if (value.AUTH_TOKEN_SECRET === "local-dev-token-secret-1234") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["AUTH_TOKEN_SECRET"],
      message: "AUTH_TOKEN_SECRET must be changed when AUTH_ENABLED=true"
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsed.data;
