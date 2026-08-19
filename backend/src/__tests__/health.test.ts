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

describe("Auth endpoints", () => {
  it("POST /api/v1/auth/login returns 400 when body is missing", async () => {
    const res = await request(app).post("/api/v1/auth/login");
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("POST /api/v1/auth/login returns 401 for invalid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nonexistent@test.com",
      password: "wrong",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });

  it("POST /api/v1/auth/login returns 200 with tokens for valid admin", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@coacher.com",
      password: "Admin123!",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user).toHaveProperty("role", "ADMIN");
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

  it("returns the standard error format when a non-Coachee hits the dashboard", async () => {
    const res = await request(app).get("/api/v1/coachee/dashboard");
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      error: { code: "FORBIDDEN", message: expect.any(String), ref: expect.any(String) },
    });
  });
});
