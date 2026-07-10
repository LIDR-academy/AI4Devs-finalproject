import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
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

export const env = parsed.data;
