import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { env, resolveCalendarId } from "../config/env.js";
import { app } from "../index.js";

function token(role: string): string {
  return jwt.sign({ id: crypto.randomUUID(), role }, env.JWT_SECRET, { expiresIn: "1h" });
}

const adminToken = token("ADMIN");
const coacheeToken = token("COACHEE");

const realKeyPath = env.GOOGLE_CALENDAR_SA_KEY_PATH
  ? resolve(process.cwd(), env.GOOGLE_CALENDAR_SA_KEY_PATH)
  : null;
const hasCredentials = !!(
  env.GOOGLE_CALENDAR_SA_EMAIL &&
  env.GOOGLE_CALENDAR_SA_KEY_PATH &&
  resolveCalendarId() &&
  realKeyPath &&
  existsSync(realKeyPath)
);

describe("GET /api/v1/classes", () => {
  it("returns 200 with a list of classes and meta for an admin", async () => {
    const res = await request(app)
      .get("/api/v1/classes")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("meta.total");
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/classes")
      .set("Authorization", "Bearer not-a-valid-token");
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });

  it("returns 403 when the user is not Admin or Coach", async () => {
    const res = await request(app)
      .get("/api/v1/classes")
      .set("Authorization", `Bearer ${coacheeToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });
});

describe("GET /api/v1/classes/:id", () => {
  it("returns 404 for a non-existent class", async () => {
    const res = await request(app)
      .get("/api/v1/classes/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });
});

describe("GET /api/v1/classes/assignable-coaches", () => {
  it("returns active admins and coaches", async () => {
    const res = await request(app)
      .get("/api/v1/classes/assignable-coaches")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const coach of res.body.data) {
      expect(coach).toHaveProperty("id");
      expect(coach).toHaveProperty("name");
    }
  });

  it("returns 403 when the user is a Coachee", async () => {
    const res = await request(app)
      .get("/api/v1/classes/assignable-coaches")
      .set("Authorization", `Bearer ${coacheeToken}`);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/v1/classes", () => {
  it("returns 403 when the user is a Coachee", async () => {
    const res = await request(app)
      .post("/api/v1/classes")
      .set("Authorization", `Bearer ${coacheeToken}`)
      .send({
        classType: "INDIVIDUAL",
        coacheeIds: [crypto.randomUUID()],
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "missing most fields" });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 when startDateTime is not ISO 8601", async () => {
    const res = await request(app)
      .post("/api/v1/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        classType: "INDIVIDUAL",
        coacheeIds: [crypto.randomUUID()],
        startDateTime: "not-a-date",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 when the body contains unknown fields (strict schema)", async () => {
    const res = await request(app)
      .post("/api/v1/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        classType: "INDIVIDUAL",
        coacheeIds: [crypto.randomUUID()],
        startDateTime: new Date().toISOString(),
        unexpectedField: "should be rejected",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  describe.runIf(!hasCredentials)("without calendar credentials", () => {
    it("returns 503 when the calendar service is not configured", async () => {
      const res = await request(app)
        .post("/api/v1/classes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          classType: "INDIVIDUAL",
          coacheeIds: [crypto.randomUUID()],
          startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      expect(res.status).toBe(503);
      expect(res.body.error).toHaveProperty("code", "SERVICE_UNAVAILABLE");
    });
  });
});

describe.runIf(hasCredentials)("POST /api/v1/classes with calendar credentials", () => {
  const prisma = new PrismaClient();

  it("creates an individual class end-to-end over HTTP", async () => {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const coach = await prisma.user.findFirst({ where: { role: "COACH" } });
    let coachee = await prisma.user.findFirst({ where: { role: "COACHEE" } });
    if (!coachee) {
      coachee = await prisma.user.create({
        data: {
          email: `http-create-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: "HTTP Coachee",
          phone: "+34 600 000 111",
          role: "COACHEE",
          status: "ACTIVE",
        },
      });
    }
    const adminId = adminUser?.id ?? crypto.randomUUID();

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() + 21);
    startDate.setUTCHours(11, 0, 0, 0);

    const res = await request(app)
      .post("/api/v1/classes")
      .set("Authorization", `Bearer ${token("ADMIN")}`)
      .send({
        classType: "INDIVIDUAL",
        assignedCoachId: coach?.id,
        coacheeIds: [coachee.id],
        startDateTime: startDate.toISOString(),
        description: "HTTP integration test class — safe to delete",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("seriesId", null);
    expect(res.body.recurrence).toEqual({ enabled: false });
    expect(res.body.instances).toHaveLength(1);
    const instance = res.body.instances[0];
    expect(instance).toHaveProperty("id");
    expect(instance).toHaveProperty("classType", "INDIVIDUAL");
    expect(instance).toHaveProperty("durationMinutes", 60);
    expect(instance).toHaveProperty("google_event_id") ?? undefined;
    expect(instance.assignedCoach.id).toBe(coach?.id ?? adminId);

    await prisma.classEnrollment.deleteMany({ where: { class_id: instance.id } });
    if (res.body.instances[0].google_event_id) {
      await request(app)
        .delete(`/api/v1/classes/${instance.id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    }
    await prisma.trainingClass.deleteMany({ where: { id: instance.id } });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
