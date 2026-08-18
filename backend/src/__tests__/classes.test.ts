import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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

describe("GET /api/v1/classes (date-range contract)", () => {
  const prisma = new PrismaClient();

  const windowStart = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
  windowStart.setUTCHours(0, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const outsideBefore = new Date(windowStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  let levelId: string | null = null;
  let coachId: string | null = null;
  let createdById: string;
  let viewerId: string;
  let viewerToken = "";
  let createdClassIds: string[] = [];

  async function createUser(email: string, name: string): Promise<string> {
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 001",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    return user.id;
  }

  async function createClass(options: {
    hour: number;
    classType: "INDIVIDUAL" | "GROUP";
    coacheeIds: string[];
    level?: string | null;
    assignedCoachId?: string;
  }): Promise<string> {
    const start = new Date(windowStart);
    start.setUTCHours(options.hour, 0, 0, 0);
    const created = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id:
          options.assignedCoachId ?? coachId ?? "00000000-0000-0000-0000-000000000000",
        level_id: options.level ?? null,
        start_time: start,
        duration_minutes: 60,
        description: null,
        created_by: createdById,
      },
    });
    for (const coacheeId of options.coacheeIds) {
      await prisma.classEnrollment.create({
        data: { class_id: created.id, coachee_id: coacheeId },
      });
    }
    return created.id;
  }

  beforeAll(async () => {
    const level = await prisma.level.findFirst();
    levelId = level?.id ?? null;
    let coach = await prisma.user.findFirst({ where: { role: "COACH", status: "ACTIVE" } });
    if (!coach) {
      coach = await prisma.user.create({
        data: {
          email: `list-coach-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: "List Coach",
          phone: "+34 600 000 002",
          role: "COACH",
          status: "ACTIVE",
        },
      });
    }
    coachId = coach.id;
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } });
    createdById = admin?.id ?? coachId;

    viewerId = await createUser(`list-viewer-${Date.now()}@example.com`, "List Viewer");
    viewerToken = jwt.sign({ id: viewerId, role: "COACHEE" }, env.JWT_SECRET, { expiresIn: "1h" });
    const c2 = await createUser(`list-c2-${Date.now()}@example.com`, "List C2");
    const c3 = await createUser(`list-c3-${Date.now()}@example.com`, "List C3");
    const c4 = await createUser(`list-c4-${Date.now()}@example.com`, "List C4");

    const clashIds = await Promise.all([
      createClass({ hour: 9, classType: "GROUP", coacheeIds: [c2, c3, c4], level: levelId }),
      createClass({ hour: 10, classType: "GROUP", coacheeIds: [viewerId, c2, c3], level: levelId }),
      createClass({ hour: 11, classType: "INDIVIDUAL", coacheeIds: [c2], level: null }),
      createClass({ hour: 12, classType: "INDIVIDUAL", coacheeIds: [c3], level: null }),
    ]);
    createdClassIds = clashIds;
  }, 20000);

  afterAll(async () => {
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    const createdUsers = await prisma.user.findMany({
      where: { email: { startsWith: "list-" } },
      select: { id: true },
    });
    await prisma.user.deleteMany({ where: { id: { in: createdUsers.map((u) => u.id) } } });
    await prisma.$disconnect();
  });

  const range = `start=${encodeURIComponent(windowStart.toISOString())}&end=${encodeURIComponent(windowEnd.toISOString())}`;

  it("returns 400 when the date range is missing", async () => {
    const res = await request(app)
      .get("/api/v1/classes")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 when start is after end", async () => {
    const res = await request(app)
      .get(
        `/api/v1/classes?start=${encodeURIComponent(windowEnd.toISOString())}&end=${encodeURIComponent(windowStart.toISOString())}`,
      )
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 400 for an invalid classType", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}&classType=bogus`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid coachId", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}&coachId=not-a-uuid`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it("returns 200 with only in-range classes and pagination meta for an admin", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty("page", 1);
    expect(res.body.meta).toHaveProperty("limit", 20);
    expect(res.body.meta).toHaveProperty("totalPages");
    const dbCount = await prisma.trainingClass.count({
      where: { start_time: { gte: windowStart, lte: windowEnd } },
    });
    expect(res.body.meta.total).toBe(dbCount);
    const ids = res.body.data.map((c: { id: string }) => c.id);
    for (const id of createdClassIds) {
      expect(ids).toContain(id);
    }
    for (const item of res.body.data) {
      expect(item).not.toHaveProperty("visibility");
    }
  });

  it("excludes classes outside the requested window", async () => {
    const outside = await createClass({
      hour: 14,
      classType: "INDIVIDUAL",
      coacheeIds: [viewerId],
      level: null,
    });
    const res = await request(app)
      .get(
        `/api/v1/classes?start=${encodeURIComponent(outsideBefore.toISOString())}&end=${encodeURIComponent(outsideBefore.toISOString())}`,
      )
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.map((c: { id: string }) => c.id)).not.toContain(outside);
    await prisma.classEnrollment.deleteMany({ where: { class_id: outside } });
    await prisma.trainingClass.deleteMany({ where: { id: outside } });
  });

  it("filters by classType", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}&classType=INDIVIDUAL`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const item of res.body.data) {
      expect(item.classType).toBe("INDIVIDUAL");
    }
  });

  it("scopes visibility for the coachee role", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}`)
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const byId = new Map(
      res.body.data.map((c: { id: string; visibility?: string }) => [c.id, c.visibility]),
    );
    expect(byId.get(createdClassIds[0])).toBe("green");
    expect(byId.get(createdClassIds[1])).toBe("blue");
    expect(byId.get(createdClassIds[2])).toBe("gray");
    expect(byId.get(createdClassIds[3])).toBe("gray");
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .get(`/api/v1/classes?${range}`)
      .set("Authorization", "Bearer not-a-valid-token");
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });
});

describe("GET /api/v1/classes/:id (detail contract)", () => {
  const prisma3 = new PrismaClient();
  const createdClassIds: string[] = [];
  const createdUserIds: string[] = [];
  let levelId: string | null = null;
  let coachId: string;
  let adminId: string;
  let enrolledCoacheeId: string;
  let waitlistedCoacheeId: string;
  let viewerId: string;
  let viewerToken = "";

  const detailStart = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  async function makeUser(name: string): Promise<string> {
    const user = await prisma3.user.create({
      data: {
        email: `detail-${name}-${Date.now()}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 301",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(user.id);
    return user.id;
  }

  beforeAll(async () => {
    const level = await prisma3.level.findFirst();
    levelId = level?.id ?? null;
    let coach = await prisma3.user.findFirst({ where: { role: "COACH", status: "ACTIVE" } });
    if (!coach) {
      coach = await prisma3.user.create({
        data: {
          email: `detail-coach-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: "Detail Coach",
          phone: "+34 600 000 302",
          role: "COACH",
          status: "ACTIVE",
        },
      });
      createdUserIds.push(coach.id);
    }
    coachId = coach.id;
    const admin = await prisma3.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } });
    adminId = admin?.id ?? coachId;

    enrolledCoacheeId = await makeUser("Enrolled Coachee");
    waitlistedCoacheeId = await makeUser("Waitlisted Coachee");
    viewerId = await makeUser("Detail Viewer");
    viewerToken = jwt.sign({ id: viewerId, role: "COACHEE" }, env.JWT_SECRET, { expiresIn: "1h" });

    const groupClass = await prisma3.trainingClass.create({
      data: {
        class_type: "GROUP",
        assigned_coach_id: coachId,
        level_id: levelId,
        start_time: detailStart,
        duration_minutes: 60,
        description: "Detail group class",
        created_by: adminId,
      },
    });
    createdClassIds.push(groupClass.id);
    await prisma3.classEnrollment.create({
      data: { class_id: groupClass.id, coachee_id: enrolledCoacheeId },
    });
    await prisma3.waitingList.create({
      data: { class_id: groupClass.id, coachee_id: waitlistedCoacheeId },
    });
  }, 20000);

  afterAll(async () => {
    await prisma3.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma3.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma3.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma3.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma3.$disconnect();
  });

  it("returns 200 with enrollment and waiting-list counts for an admin", async () => {
    const classId = createdClassIds[0];
    const res = await request(app)
      .get(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(classId);
    expect(res.body.classType).toBe("GROUP");
    expect(res.body.assignedCoach.id).toBe(coachId);
    expect(res.body.level).not.toBeNull();
    expect(res.body.durationMinutes).toBe(60);
    expect(res.body.description).toBe("Detail group class");
    expect(res.body.enrolledCoachees).toHaveLength(1);
    expect(res.body.enrolledCoachees[0].name).toBe("Enrolled Coachee");
    expect(res.body.enrollmentCount).toBe(1);
    expect(res.body.capacity).toBe(4);
    expect(res.body.hasWaitingList).toBe(true);
    expect(res.body.waitingListCount).toBe(1);
    expect(res.body.isRecurring).toBe(false);
    expect(res.body).not.toHaveProperty("coacheeStatus");
  });

  it("returns 404 for a non-existent class", async () => {
    const res = await request(app)
      .get("/api/v1/classes/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("includes coacheeStatus for the coachee role", async () => {
    const classId = createdClassIds[0];
    const res = await request(app)
      .get(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.coacheeStatus).toEqual({
      isEnrolled: false,
      isOnWaitingList: false,
      isWithinReach: true,
    });
  });

  it("reports isOnWaitingList for a coachee on the waiting list", async () => {
    const waitlistedToken = jwt.sign({ id: waitlistedCoacheeId, role: "COACHEE" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const classId = createdClassIds[0];
    const res = await request(app)
      .get(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${waitlistedToken}`);
    expect(res.status).toBe(200);
    expect(res.body.coacheeStatus.isOnWaitingList).toBe(true);
  });

  it("reports isEnrolled for an enrolled coachee and reveals names only on own classes", async () => {
    const enrolledToken = jwt.sign({ id: enrolledCoacheeId, role: "COACHEE" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const classId = createdClassIds[0];
    const res = await request(app)
      .get(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${enrolledToken}`);
    expect(res.status).toBe(200);
    expect(res.body.coacheeStatus.isEnrolled).toBe(true);
    expect(res.body.enrolledCoachees).toHaveLength(1);
    expect(res.body.enrolledCoachees[0].name).toBe("Enrolled Coachee");

    const viewerRes = await request(app)
      .get(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(viewerRes.body.enrolledCoachees).toEqual([]);
    expect(viewerRes.body.enrollmentCount).toBe(1);
  });
});

describe("DELETE /api/v1/classes/:id and DELETE /api/v1/recurring-series/:id", () => {
  const prisma2 = new PrismaClient();

  let coach: { id: string; name: string };
  let otherCoachId: string;
  let adminId: string;
  let createdUserIds: string[] = [];
  const createdClassIds: string[] = [];
  const createdSeriesIds: string[] = [];
  let coacheeId: string;

  const futureDay = (daysFromNow: number): Date => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + daysFromNow);
    d.setUTCHours(10, 0, 0, 0);
    return d;
  };

  const makeClass = async (overrides: {
    day: number;
    status?: "ACTIVE" | "CANCELED";
    seriesId?: string | null;
    assignedCoachId?: string;
  }): Promise<string> => {
    const created = await prisma2.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: overrides.assignedCoachId ?? coach.id,
        level_id: null,
        start_time: futureDay(overrides.day),
        duration_minutes: 60,
        status: overrides.status ?? "ACTIVE",
        description: null,
        recurrence_series_id: overrides.seriesId ?? null,
        google_event_id: null,
        created_by: adminId,
      },
    });
    createdClassIds.push(created.id);
    return created.id;
  };

  beforeAll(async () => {
    const coachUser = await prisma2.user.create({
      data: {
        email: `delete-api-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Delete API Coach",
        phone: "+34 600 000 121",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coach = { id: coachUser.id, name: coachUser.name };
    const otherCoach = await prisma2.user.create({
      data: {
        email: `delete-api-coach2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Delete API Coach 2",
        phone: "+34 600 000 122",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    otherCoachId = otherCoach.id;
    const adminUser = await prisma2.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
      throw new Error("No admin user available for API tests.");
    }
    adminId = adminUser.id;
    const coachee = await prisma2.user.create({
      data: {
        email: `delete-api-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Delete API Coachee",
        phone: "+34 600 000 123",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    coacheeId = coachee.id;
    createdUserIds = [coach.id, otherCoachId, coacheeId];
  }, 20000);

  afterAll(async () => {
    const classes = createdClassIds;
    await prisma2.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma2.classEnrollment.deleteMany({ where: { coachee_id: coacheeId } });
    await prisma2.notification.deleteMany({ where: { class_id: { in: classes } } });
    await prisma2.trainingClass.deleteMany({ where: { id: { in: classes } } });
    await prisma2.recurrenceSeries.deleteMany({ where: { id: { in: createdSeriesIds } } });
    await prisma2.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma2.$disconnect();
  });

  const adminTokenFor = (id: string): string =>
    jwt.sign({ id, role: "ADMIN" }, env.JWT_SECRET, { expiresIn: "1h" });

  it("soft-cancels a single class for the assigned coach", async () => {
    const classId = await makeClass({ day: 30 });
    const coachToken = jwt.sign({ id: coach.id, role: "COACH" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .delete(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${coachToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: classId,
      status: "CANCELED",
      canceledInstances: null,
    });

    const stored = await prisma2.trainingClass.findUnique({
      where: { id: classId },
      select: { status: true },
    });
    expect(stored?.status).toBe("CANCELED");
  });

  it("returns 409 when the class is already canceled", async () => {
    const classId = await makeClass({ day: 31, status: "CANCELED" });
    const res = await request(app)
      .delete(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${adminTokenFor(adminId)}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "CONFLICT");
  });

  it("returns 404 for a non-existent class", async () => {
    const res = await request(app)
      .delete("/api/v1/classes/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminTokenFor(adminId)}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("returns 403 for a coach not assigned to the class", async () => {
    const classId = await makeClass({ day: 33 });
    const otherCoachToken = jwt.sign({ id: otherCoachId, role: "COACH" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const res = await request(app)
      .delete(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${otherCoachToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("returns 403 for a coachee", async () => {
    const classId = await makeClass({ day: 34 });
    const coacheeToken = jwt.sign({ id: coacheeId, role: "COACHEE" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const res = await request(app)
      .delete(`/api/v1/classes/${classId}`)
      .set("Authorization", `Bearer ${coacheeToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("cancels future instances with scope=series and preserves past ones", async () => {
    const series = await prisma2.recurrenceSeries.create({
      data: {
        class_type: "INDIVIDUAL",
        level_id: null,
        coach_id: coach.id,
        day_of_week: 1,
        start_time: futureDay(40),
        start_date: futureDay(40),
        created_by: coach.id,
      },
    });
    createdSeriesIds.push(series.id);

    const pastId = await makeClass({ day: 39, seriesId: series.id });
    const pastTarget = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    pastTarget.setUTCMinutes(0, 0, 0);
    await prisma2.trainingClass.update({
      where: { id: pastId },
      data: { start_time: pastTarget },
    });
    const future1 = await makeClass({ day: 40, seriesId: series.id });
    const future2 = await makeClass({ day: 47, seriesId: series.id });

    const res = await request(app)
      .delete(`/api/v1/classes/${future1}?scope=series`)
      .set("Authorization", `Bearer ${adminTokenFor(adminId)}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CANCELED");
    expect(res.body.canceledInstances).toBe(2);
    expect(res.body.id).toBe(future1);

    const pastStoredAfter = await prisma2.trainingClass.findUnique({
      where: { id: pastId },
      select: { status: true },
    });
    expect(pastStoredAfter?.status).toBe("ACTIVE");
    const future1Stored = await prisma2.trainingClass.findUnique({
      where: { id: future1 },
      select: { status: true },
    });
    const future2Stored = await prisma2.trainingClass.findUnique({
      where: { id: future2 },
      select: { status: true },
    });
    expect(future1Stored?.status).toBe("CANCELED");
    expect(future2Stored?.status).toBe("CANCELED");
  });

  it("cancels a whole recurring series at its root", async () => {
    const series = await prisma2.recurrenceSeries.create({
      data: {
        class_type: "INDIVIDUAL",
        level_id: null,
        coach_id: coach.id,
        day_of_week: 3,
        start_time: futureDay(60),
        start_date: futureDay(60),
        created_by: coach.id,
      },
    });
    createdSeriesIds.push(series.id);

    const inst1 = await makeClass({ day: 60, seriesId: series.id });
    const inst2 = await makeClass({ day: 67, seriesId: series.id });

    const res = await request(app)
      .delete(`/api/v1/recurring-series/${series.id}`)
      .set("Authorization", `Bearer ${adminTokenFor(adminId)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      seriesId: series.id,
      canceledInstanceCount: 2,
      status: "CANCELED",
    });

    const inst1Stored = await prisma2.trainingClass.findUnique({
      where: { id: inst1 },
      select: { status: true },
    });
    const inst2Stored = await prisma2.trainingClass.findUnique({
      where: { id: inst2 },
      select: { status: true },
    });
    expect(inst1Stored?.status).toBe("CANCELED");
    expect(inst2Stored?.status).toBe("CANCELED");
  });

  it("returns 404 for a non-existent series", async () => {
    const res = await request(app)
      .delete("/api/v1/recurring-series/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminTokenFor(adminId)}`);
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
