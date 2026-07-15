import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

function token(role: string): string {
  return jwt.sign({ id: crypto.randomUUID(), role }, env.JWT_SECRET, { expiresIn: "1h" });
}

const adminToken = token("ADMIN");
const coachToken = token("COACH");
const coacheeToken = token("COACHEE");

let createdCoacheeId: string;
let levelId: string;

describe("Setup", () => {
  it("retrieves a valid level ID from the database", async () => {
    const prisma = new PrismaClient();
    const level = await prisma.level.findFirst();
    await prisma.$disconnect();
    expect(level).not.toBeNull();
    levelId = (level as { id: string }).id;
  });
});

describe("POST /api/v1/coachees", () => {
  it("returns 201 with coachee object on creation (happy path)", async () => {
    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Juan Pérez",
        email: `juan-${Date.now()}@example.com`,
        phone: "+34 600 000 000",
        classTypePreference: "INDIVIDUAL",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Juan Pérez");
    expect(res.body).not.toHaveProperty("bank_account");
    expect(res.body).not.toHaveProperty("ssn");
    expect(res.body).not.toHaveProperty("dni");
    createdCoacheeId = res.body.id;
  });

  it("returns 409 when email already exists", async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "First", email, phone: "+34 600 111 222", classTypePreference: "GROUP" });

    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Duplicate", email, phone: "+34 600 333 444", classTypePreference: "GROUP" });
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "CONFLICT");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ classTypePreference: "INDIVIDUAL" });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 403 when user is not Admin", async () => {
    const res = await request(app)
      .post("/api/v1/coachees")
      .set("Authorization", `Bearer ${coacheeToken}`)
      .send({
        name: "Test",
        email: `test-${Date.now()}@example.com`,
        classTypePreference: "INDIVIDUAL",
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });
});

describe("GET /api/v1/coachees", () => {
  it("returns 200 with paginated list (happy path)", async () => {
    const res = await request(app)
      .get("/api/v1/coachees")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("page");
    expect(res.body.meta).toHaveProperty("limit");
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("totalPages");
  });

  it("filters by status", async () => {
    const res = await request(app)
      .get("/api/v1/coachees?status=active")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});

describe("GET /api/v1/coachees/:id", () => {
  it("returns 200 with full profile", async () => {
    const res = await request(app)
      .get(`/api/v1/coachees/${createdCoacheeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdCoacheeId);
    expect(res.body).toHaveProperty("name", "Juan Pérez");
    expect(res.body).toHaveProperty("email");
    expect(res.body).toHaveProperty("additionalInfo");
    expect(res.body).not.toHaveProperty("bank_account");
    expect(res.body).not.toHaveProperty("ssn");
    expect(res.body).not.toHaveProperty("dni");
  });

  it("returns 404 when coachee does not exist", async () => {
    const res = await request(app)
      .get("/api/v1/coachees/00000000-0000-0000-0000-000000000001")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });
});

describe("PUT /api/v1/coachees/:id", () => {
  it("returns 200 with updated fields (partial update)", async () => {
    const res = await request(app)
      .put(`/api/v1/coachees/${createdCoacheeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Name");
  });
});

describe("PATCH /api/v1/coachees/:id/status", () => {
  it("returns 200 when deactivating", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "inactive" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "inactive");
  });

  it("returns 200 when reactivating", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "active" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "active");
  });

  it("returns 403 when user is not Admin", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/status`)
      .set("Authorization", `Bearer ${coacheeToken}`)
      .send({ status: "inactive" });
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/coachees/:id/level", () => {
  it("returns 200 with updated level (happy path)", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/level`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ levelId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("level");
    expect(res.body.level).toHaveProperty("id", levelId);
  });

  it("returns 400 with invalid levelId", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/level`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ levelId: "not-a-uuid" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when coachee does not exist", async () => {
    const res = await request(app)
      .patch("/api/v1/coachees/00000000-0000-0000-0000-000000000001/level")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ levelId });
    expect(res.status).toBe(404);
  });

  it("returns 200 when Coach changes level", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/level`)
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ levelId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("level");
    expect(res.body.level).toHaveProperty("id", levelId);
  });

  it("returns 403 when Coachee changes level", async () => {
    const res = await request(app)
      .patch(`/api/v1/coachees/${createdCoacheeId}/level`)
      .set("Authorization", `Bearer ${coacheeToken}`)
      .send({ levelId });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/levels", () => {
  it("returns 200 with all levels (happy path)", async () => {
    const res = await request(app)
      .get("/api/v1/levels")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0]).toHaveProperty("name");
    expect(res.body.data[0]).toHaveProperty("color");
    expect(res.body.data[0]).toHaveProperty("sort_order");
  });

  it("returns 200 with Coachee token", async () => {
    const res = await request(app)
      .get("/api/v1/levels")
      .set("Authorization", `Bearer ${coacheeToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });
});
