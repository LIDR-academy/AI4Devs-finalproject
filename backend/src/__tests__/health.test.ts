import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../index.js";

describe("Health endpoint", () => {
  it("GET /api/v1/health returns 200 with status ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET /health (without prefix) returns 404", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(404);
  });

  it("GET /api/v1/nonexistent returns 404 with error envelope", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    expect(res.body.error).toHaveProperty("message");
    expect(res.body.error).toHaveProperty("ref");
  });
});

describe("Auth endpoint stubs", () => {
  it("POST /api/v1/auth/login returns 501", async () => {
    const res = await request(app).post("/api/v1/auth/login");
    expect(res.status).toBe(501);
  });
});

describe("Error envelope", () => {
  it("returns standard error format on 404", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: { code: expect.any(String), message: expect.any(String), ref: expect.any(String) },
    });
  });

  it("returns standard error format on 501 stub", async () => {
    const res = await request(app).get("/api/v1/classes/999");
    expect(res.status).toBe(501);
    expect(res.body).toMatchObject({
      error: { code: expect.any(String), message: expect.any(String), ref: expect.any(String) },
    });
  });
});
