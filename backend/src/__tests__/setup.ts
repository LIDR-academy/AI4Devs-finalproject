import { beforeAll } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/coacher_test";
  process.env.COACH_FINANCIAL_ENCRYPTION_KEY = "abcdef1234567890abcdef1234567890";
});
