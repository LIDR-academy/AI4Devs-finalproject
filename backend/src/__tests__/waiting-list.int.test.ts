import { PrismaClient, type UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

function token(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("Waiting List API", () => {
  const prisma = new PrismaClient();

  const createdUserIds: string[] = [];
  const createdClassIds: string[] = [];

  let levelOkId: string;
  let levelFarId: string;
  let coachId: string;
  let coacheeA: string;
  let coacheeB: string;
  let coacheeNoLevel: string;
  let coacheeD: string;
  let coacheeE: string;

  let fullGroupId: string;
  let partialGroupId: string;
  let canceledGroupId: string;
  let farGroupId: string;
  let occupiedIndividualId: string;
  let freeIndividualId: string;
  let raceJoinGroupId: string;
  let leaveClassId: string;
  let notOnListClassId: string;
  let listFullGroupId: string;
  let listPartialGroupId: string;
  let listCanceledGroupId: string;

  async function makeLevel(name: string, sortOrder: number): Promise<string> {
    const level = await prisma.level.create({
      data: { name, color: "#123456", sort_order: sortOrder },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string, levelId: string | null): Promise<string> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 411",
        role: role as UserRole,
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(user.id);
    return user.id;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    levelId: string | null;
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled: string[];
    waitingList?: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coachId,
        level_id: options.levelId,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        description: null,
        created_by: coachId,
      },
    });
    createdClassIds.push(trainingClass.id);
    if (options.enrolled.length > 0) {
      await prisma.classEnrollment.createMany({
        data: options.enrolled.map((coacheeId) => ({
          class_id: trainingClass.id,
          coachee_id: coacheeId,
        })),
      });
    }
    for (const coacheeId of options.waitingList ?? []) {
      await prisma.waitingList.create({
        data: { class_id: trainingClass.id, coachee_id: coacheeId },
      });
    }
    return trainingClass.id;
  }

  const futureHour = (hoursFromNow: number): Date => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  };

  beforeAll(async () => {
    levelOkId = await makeLevel(`wl-int-ok-${Date.now()}`, 1);
    levelFarId = await makeLevel(`wl-int-far-${Date.now()}`, 5);

    coachId = await makeUser("WL Int Coach", "COACH", null);

    coacheeA = await makeUser("WL Int Coachee A", "COACHEE", levelOkId);
    coacheeB = await makeUser("WL Int Coachee B", "COACHEE", levelOkId);
    coacheeNoLevel = await makeUser("WL Int Coachee NoLevel", "COACHEE", null);
    coacheeD = await makeUser("WL Int Coachee D", "COACHEE", levelOkId);
    coacheeE = await makeUser("WL Int Coachee E", "COACHEE", levelOkId);

    fullGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(60),
      enrolled: [
        await makeUser("WL Int Full Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int Full Seat 2", "COACHEE", levelOkId),
        await makeUser("WL Int Full Seat 3", "COACHEE", levelOkId),
        await makeUser("WL Int Full Seat 4", "COACHEE", levelOkId),
      ],
    });

    partialGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(61),
      enrolled: [
        await makeUser("WL Int Partial Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int Partial Seat 2", "COACHEE", levelOkId),
      ],
    });

    canceledGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(62),
      status: "CANCELED",
      enrolled: [],
    });

    farGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelFarId,
      start: futureHour(63),
      enrolled: [
        await makeUser("WL Int Far Seat 1", "COACHEE", levelFarId),
        await makeUser("WL Int Far Seat 2", "COACHEE", levelFarId),
        await makeUser("WL Int Far Seat 3", "COACHEE", levelFarId),
        await makeUser("WL Int Far Seat 4", "COACHEE", levelFarId),
      ],
    });

    occupiedIndividualId = await makeClass({
      classType: "INDIVIDUAL",
      levelId: levelOkId,
      start: futureHour(64),
      enrolled: [await makeUser("WL Int Ind Seat", "COACHEE", levelOkId)],
    });

    freeIndividualId = await makeClass({
      classType: "INDIVIDUAL",
      levelId: levelOkId,
      start: futureHour(65),
      enrolled: [],
    });

    raceJoinGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(66),
      enrolled: [
        await makeUser("WL Int Race Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int Race Seat 2", "COACHEE", levelOkId),
        await makeUser("WL Int Race Seat 3", "COACHEE", levelOkId),
        await makeUser("WL Int Race Seat 4", "COACHEE", levelOkId),
      ],
      waitingList: [
        await makeUser("WL Int Race WL 1", "COACHEE", levelOkId),
        await makeUser("WL Int Race WL 2", "COACHEE", levelOkId),
        await makeUser("WL Int Race WL 3", "COACHEE", levelOkId),
      ],
    });

    leaveClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(67),
      enrolled: [
        await makeUser("WL Int Leave Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int Leave Seat 2", "COACHEE", levelOkId),
        await makeUser("WL Int Leave Seat 3", "COACHEE", levelOkId),
        await makeUser("WL Int Leave Seat 4", "COACHEE", levelOkId),
      ],
      waitingList: [coacheeA],
    });

    notOnListClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(68),
      enrolled: [
        await makeUser("WL Int NotOn Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int NotOn Seat 2", "COACHEE", levelOkId),
        await makeUser("WL Int NotOn Seat 3", "COACHEE", levelOkId),
        await makeUser("WL Int NotOn Seat 4", "COACHEE", levelOkId),
      ],
    });

    listFullGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(69),
      enrolled: [
        await makeUser("WL Int ListFull Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int ListFull Seat 2", "COACHEE", levelOkId),
        await makeUser("WL Int ListFull Seat 3", "COACHEE", levelOkId),
        await makeUser("WL Int ListFull Seat 4", "COACHEE", levelOkId),
      ],
      waitingList: [coacheeB],
    });

    listPartialGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(70),
      enrolled: [
        await makeUser("WL Int ListPartial Seat 1", "COACHEE", levelOkId),
        await makeUser("WL Int ListPartial Seat 2", "COACHEE", levelOkId),
      ],
      waitingList: [coacheeB],
    });

    listCanceledGroupId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(71),
      status: "CANCELED",
      enrolled: [],
      waitingList: [coacheeB],
    });
  }, 30000);

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({
      where: { id: { in: [levelOkId, levelFarId] } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/v1/classes/:id/waiting-list", () => {
    it("joins the waiting list of a full group class (happy path, 201)", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${fullGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        classId: fullGroupId,
        coacheeId: coacheeA,
      });
      expect(res.body.id).toBeTruthy();
      expect(res.body.joinedAt).toBeTruthy();

      const count = await prisma.waitingList.count({
        where: { class_id: fullGroupId, coachee_id: coacheeA },
      });
      expect(count).toBe(1);
    });

    it("joins the waiting list of an occupied individual class slot (happy path, 201)", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${occupiedIndividualId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeB, "COACHEE")}`);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        classId: occupiedIndividualId,
        coacheeId: coacheeB,
      });
    });

    it("rejects with VALIDATION_ERROR when the individual slot is unoccupied", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${freeIndividualId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("rejects with VALIDATION_ERROR when the group class is not full", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${partialGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("rejects with VALIDATION_ERROR for a canceled class", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${canceledGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("rejects with LEVEL_MISMATCH for a Coachee without a level", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${fullGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeNoLevel, "COACHEE")}`);
      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty("code", "LEVEL_MISMATCH");
    });

    it("rejects with LEVEL_MISMATCH for a Coachee out of reach", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${farGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty("code", "LEVEL_MISMATCH");
    });

    it("returns NOT_FOUND for a class that does not exist", async () => {
      const res = await request(app)
        .post("/api/v1/classes/00000000-0000-0000-0000-000000000000/waiting-list")
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("returns FORBIDDEN for a non-Coachee role", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${fullGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coachId, "COACH")}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
    });

    it("rejects with ALREADY_ON_WAITING_LIST on a second attempt", async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${fullGroupId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty("code", "ALREADY_ON_WAITING_LIST");
    });

    it("lets exactly one Coachee claim the last available waiting-list slot under concurrency", async () => {
      const join = (userId: string) =>
        request(app)
          .post(`/api/v1/classes/${raceJoinGroupId}/waiting-list`)
          .set("Authorization", `Bearer ${token(userId, "COACHEE")}`);

      const [resD, resE] = await Promise.all([join(coacheeD), join(coacheeE)]);

      const statuses = [resD.status, resE.status].sort();
      expect(statuses).toEqual([201, 409]);
      const refused = resD.status === 201 ? resE : resD;
      expect(refused.body.error).toHaveProperty("code", "WAITING_LIST_FULL");

      const count = await prisma.waitingList.count({
        where: { class_id: raceJoinGroupId },
      });
      expect(count).toBe(4);
    });
  });

  describe("DELETE /api/v1/classes/:id/waiting-list", () => {
    it("leaves the waiting list (happy path, 200)", async () => {
      const res = await request(app)
        .delete(`/api/v1/classes/${leaveClassId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Removed from waiting list." });

      const entry = await prisma.waitingList.findUnique({
        where: {
          class_id_coachee_id: { class_id: leaveClassId, coachee_id: coacheeA },
        },
      });
      expect(entry).toBeNull();

      const notification = await prisma.notification.findFirst({
        where: { notification_type: 10, recipient_id: coacheeA, class_id: leaveClassId },
      });
      expect(notification).not.toBeNull();
    });

    it("returns NOT_FOUND when the class does not exist", async () => {
      const res = await request(app)
        .delete("/api/v1/classes/00000000-0000-0000-0000-000000000000/waiting-list")
        .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("returns NOT_FOUND when the Coachee is not on the waiting list", async () => {
      const res = await request(app)
        .delete(`/api/v1/classes/${notOnListClassId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coacheeB, "COACHEE")}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    });

    it("returns FORBIDDEN for a non-Coachee role", async () => {
      const res = await request(app)
        .delete(`/api/v1/classes/${leaveClassId}/waiting-list`)
        .set("Authorization", `Bearer ${token(coachId, "COACH")}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
    });
  });

  describe("GET /api/v1/waiting-lists", () => {
    it("returns the Coachee's active waiting lists with hasOpenSpots (no position)", async () => {
      const res = await request(app)
        .get("/api/v1/waiting-lists")
        .set("Authorization", `Bearer ${token(coacheeB, "COACHEE")}`);
      expect(res.status).toBe(200);

      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 3, totalPages: 1 });

      const byClass = new Map(
        (
          res.body.data as Array<{
            class: {
              id: string;
              classType: string;
              level: { name: string; color: string } | null;
              assignedCoach: { name: string };
            };
            hasOpenSpots: boolean;
            joinedAt: string;
          }>
        ).map((item) => [item.class.id, item]),
      );
      expect(byClass.has(listFullGroupId)).toBe(true);
      expect(byClass.get(listFullGroupId)?.hasOpenSpots).toBe(false);
      expect(byClass.has(listPartialGroupId)).toBe(true);
      expect(byClass.get(listPartialGroupId)?.hasOpenSpots).toBe(true);
      expect(byClass.has(occupiedIndividualId)).toBe(true);
      expect(byClass.get(occupiedIndividualId)?.hasOpenSpots).toBe(false);

      const first = byClass.get(listFullGroupId);
      expect(first?.class).toMatchObject({ classType: "GROUP" });
      expect(first?.class.level).toMatchObject({
        name: expect.any(String),
        color: expect.any(String),
      });
      expect(first?.class.assignedCoach).toMatchObject({ name: expect.any(String) });
      expect(first?.joinedAt).toBeTruthy();

      for (const item of res.body.data) {
        expect(item).not.toHaveProperty("position");
      }
    });

    it("excludes waiting lists of canceled classes", async () => {
      const res = await request(app)
        .get("/api/v1/waiting-lists")
        .set("Authorization", `Bearer ${token(coacheeB, "COACHEE")}`);
      const ids = (res.body.data as Array<{ class: { id: string } }>).map((item) => item.class.id);
      expect(ids).not.toContain(listCanceledGroupId);
    });

    it("returns FORBIDDEN for a non-Coachee role", async () => {
      const res = await request(app)
        .get("/api/v1/waiting-lists")
        .set("Authorization", `Bearer ${token(coachId, "COACH")}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
    });
  });
});
