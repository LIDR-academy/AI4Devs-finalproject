import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadEnv = async () => {
  vi.resetModules();
  return import("./env");
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("env config", () => {
  it("does not require Azure fields when AZURE_OPENAI_ENABLED is false string", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/projectscope_ai?schema=public";
    process.env.AZURE_OPENAI_ENABLED = "false";
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;

    const { env } = await loadEnv();

    expect(env.AZURE_OPENAI_ENABLED).toBe(false);
  });

  it("requires Azure fields when AZURE_OPENAI_ENABLED is true string", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/projectscope_ai?schema=public";
    process.env.AZURE_OPENAI_ENABLED = "true";
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;

    await expect(loadEnv()).rejects.toThrow(
      "AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT must be provided when AZURE_OPENAI_ENABLED=true"
    );
  });
});
