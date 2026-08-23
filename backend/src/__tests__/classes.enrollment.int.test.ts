import { PrismaClient, type UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { app } from "../index.js";

function token(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: "1h" });
}

describe("POST /api/v1/classes/:id/enrollment", () => {
  const prisma = new PrismaClient();

  const createdUserIds: string[] = [];
  const createdClassIds: string[] = [];

  let levelOkId: string;
  let levelFarId: string;
  let coachId: string;
  let coacheeA: string;
  let coacheeB: string;
  let coacheeNoLevel: string;
  let coacheeLevel1: string;
  let coacheeD: string;
  let coacheeE: string;

  let targetClassId: string;
  let fullClassId: string;
  let raceClassId: string;
  let canceledClassId: string;
  let individualClassId: string;
  let farClassId: string;

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
        phone: "+34 600 000 111",
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
    return trainingClass.id;
  }

  const futureHour = (hoursFromNow: number): Date => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  };

  beforeAll(async () => {
    levelOkId = await makeLevel(`join-ok-${Date.now()}`, 1);
    levelFarId = await makeLevel(`join-far-${Date.now()}`, 5);

    coachId = await makeUser("Join Coach", "COACH", null);

    coacheeA = await makeUser("Join Coachee A", "COACHEE", levelOkId);
    coacheeB = await makeUser("Join Coachee B", "COACHEE", levelOkId);
    coacheeLevel1 = await makeUser("Join Coachee Level1", "COACHEE", levelOkId);
    coacheeNoLevel = await makeUser("Join Coachee NoLevel", "COACHEE", null);
    coacheeD = await makeUser("Join Coachee D", "COACHEE", levelOkId);
    coacheeE = await makeUser("Join Coachee E", "COACHEE", levelOkId);

    const slot1 = futureHour(40);
    const slot2 = futureHour(41);
    const slot3 = futureHour(42);

    // 2/4 enrolled, free spots remaining
    targetClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: slot1,
      enrolled: [
        await makeUser("Join Seat 1", "COACHEE", levelOkId),
        await makeUser("Join Seat 2", "COACHEE", levelOkId),
      ],
    });

    // 4/4 enrolled, full
    fullClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: slot3,
      enrolled: [
        await makeUser("Full Seat 1", "COACHEE", levelOkId),
        await makeUser("Full Seat 2", "COACHEE", levelOkId),
        await makeUser("Full Seat 3", "COACHEE", levelOkId),
        await makeUser("Full Seat 4", "COACHEE", levelOkId),
      ],
    });

    // 3/4 enrolled, one spot left — race target
    raceClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: slot2,
      enrolled: [
        await makeUser("Race Seat 1", "COACHEE", levelOkId),
        await makeUser("Race Seat 2", "COACHEE", levelOkId),
        await makeUser("Race Seat 3", "COACHEE", levelOkId),
      ],
    });

    // canceled group class
    canceledClassId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: futureHour(43),
      status: "CANCELED",
      enrolled: [],
    });

    // individual class (assignment only)
    individualClassId = await makeClass({
      classType: "INDIVIDUAL",
      levelId: null,
      start: futureHour(44),
      enrolled: [await makeUser("Ind Seat", "COACHEE", levelOkId)],
    });

    // group class far beyond reach (level 5 vs coachees on level 1)
    farClassId = await makeClass({
      classType: "GROUP",
      levelId: levelFarId,
      start: futureHour(45),
      enrolled: [
        await makeUser("Far Seat 1", "COACHEE", levelFarId),
        await makeUser("Far Seat 2", "COACHEE", levelFarId),
      ],
    });

    // coachee B is enrolled in an overlapping class at the same time as targetClassId
    await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: slot1,
      enrolled: [
        coacheeB,
        await makeUser("Ov Seat 1", "COACHEE", levelOkId),
        await makeUser("Ov Seat 2", "COACHEE", levelOkId),
      ],
    });
  }, 30000);

  afterAll(async () => {
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({
      where: {
        id: { in: [levelOkId, levelFarId] },
      },
    });
    await prisma.$disconnect();
  });

  it("joins a Coachee to an ACTIVE group class (happy path)", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${targetClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      classId: targetClassId,
      coacheeId: coacheeA,
    });
    expect(res.body.id).toBeTruthy();
    expect(res.body.joinedAt).toBeTruthy();

    const count = await prisma.classEnrollment.count({
      where: { class_id: targetClassId, coachee_id: coacheeA },
    });
    expect(count).toBe(1);
  });

  it("rejects with ALREADY_ENROLLED when the Coachee is already enrolled", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${targetClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "ALREADY_ENROLLED");
  });

  it("rejects with CLASS_FULL when the class has no free spots", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${fullClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeD, "COACHEE")}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "CLASS_FULL");
  });

  it("rejects with LEVEL_MISMATCH for a Coachee with no level", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${targetClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeNoLevel, "COACHEE")}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "LEVEL_MISMATCH");
  });

  it("rejects with LEVEL_MISMATCH for a Coachee whose level is out of reach", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${farClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeLevel1, "COACHEE")}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "LEVEL_MISMATCH");
  });

  it("rejects with OVERLAP_DETECTED when the Coachee has another class at the same time", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${targetClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeB, "COACHEE")}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toHaveProperty("code", "OVERLAP_DETECTED");
  });

  it("rejects with VALIDATION_ERROR for an individual class", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${individualClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("rejects with VALIDATION_ERROR for a canceled class", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${canceledClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns NOT_FOUND for a class that does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/classes/00000000-0000-0000-0000-000000000000/enrollment")
      .set("Authorization", `Bearer ${token(coacheeA, "COACHEE")}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("returns FORBIDDEN for a non-Coachee role", async () => {
    const res = await request(app)
      .post(`/api/v1/classes/${targetClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coachId, "COACH")}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("lets exactly one Coachee take the last free spot under concurrency", async () => {
    const join = (userId: string) =>
      request(app)
        .post(`/api/v1/classes/${raceClassId}/enrollment`)
        .set("Authorization", `Bearer ${token(userId, "COACHEE")}`);

    const [resD, resE] = await Promise.all([join(coacheeD), join(coacheeE)]);

    const statuses = [resD.status, resE.status].sort();
    expect(statuses).toEqual([201, 409]);
    const successful = resD.status === 201 ? resD : resE;
    const refused = resD.status === 201 ? resE : resD;
    expect(refused.body.error).toHaveProperty("code", "CLASS_FULL");

    const count = await prisma.classEnrollment.count({
      where: { class_id: raceClassId },
    });
    expect(count).toBe(4);
    expect(successful.body.classId).toBe(raceClassId);
  });
});

describe("DELETE /api/v1/classes/:id/enrollment", () => {
  const prisma = new PrismaClient();

  const createdUserIds: string[] = [];
  const createdClassIds: string[] = [];

  let levelId: string;
  let coachId: string;
  let coacheeGroupNoWl: string;
  let coacheeGroupWl: string;
  let coacheeIndividual: string;
  let coacheeCanceled: string;
  let waitlistedCoachee: string;

  let groupNoWlClassId: string;
  let groupWlClassId: string;
  let individualClassId: string;
  let canceledClassId: string;
  let notEnrolledClassId: string;

  const futureHour = (hoursFromNow: number): Date => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  };

  async function makeUser(
    name: string,
    role: string,
    levelIdValue: string | null,
  ): Promise<string> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 222",
        role: role as UserRole,
        status: "ACTIVE",
        level_id: levelIdValue,
      },
    });
    createdUserIds.push(user.id);
    return user.id;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    levelIdValue: string | null;
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled: string[];
    waitingList?: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coachId,
        level_id: options.levelIdValue,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        description: null,
        created_by: coachId,
      },
    });
    createdClassIds.push(trainingClass.id);
    for (const coacheeId of options.enrolled) {
      await prisma.classEnrollment.create({
        data: { class_id: trainingClass.id, coachee_id: coacheeId },
      });
    }
    for (const coacheeId of options.waitingList ?? []) {
      await prisma.waitingList.create({
        data: { class_id: trainingClass.id, coachee_id: coacheeId },
      });
    }
    return trainingClass.id;
  }

  beforeAll(async () => {
    const existingLevel = await prisma.level.findFirst();
    levelId =
      existingLevel?.id ??
      (
        await prisma.level.create({
          data: { name: `cancel-level-${Date.now()}`, color: "#654321", sort_order: 2 },
        })
      ).id;

    coachId = await makeUser("Cancel Coach", "COACH", null);

    coacheeGroupNoWl = await makeUser("Cancel Group NoWL", "COACHEE", levelId);
    coacheeGroupWl = await makeUser("Cancel Group WL", "COACHEE", levelId);
    coacheeIndividual = await makeUser("Cancel Individual", "COACHEE", levelId);
    coacheeCanceled = await makeUser("Cancel CanceledClass", "COACHEE", levelId);
    waitlistedCoachee = await makeUser("Waiting List Member", "COACHEE", levelId);

    groupNoWlClassId = await makeClass({
      classType: "GROUP",
      levelIdValue: levelId,
      start: futureHour(50),
      enrolled: [coacheeGroupNoWl],
    });
    groupWlClassId = await makeClass({
      classType: "GROUP",
      levelIdValue: levelId,
      start: futureHour(51),
      enrolled: [coacheeGroupWl],
      waitingList: [waitlistedCoachee],
    });
    individualClassId = await makeClass({
      classType: "INDIVIDUAL",
      levelIdValue: null,
      start: futureHour(52),
      enrolled: [coacheeIndividual],
    });
    canceledClassId = await makeClass({
      classType: "GROUP",
      levelIdValue: levelId,
      start: futureHour(53),
      status: "CANCELED",
      enrolled: [coacheeCanceled],
    });
    notEnrolledClassId = await makeClass({
      classType: "GROUP",
      levelIdValue: levelId,
      start: futureHour(54),
      enrolled: [],
    });
  }, 30000);

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.waitingList.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("cancels a group enrollment with no waiting list (notification type 5)", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${groupNoWlClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeGroupNoWl, "COACHEE")}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Enrollment canceled.",
      waitingListProcessed: false,
      claimedByCoachee: null,
    });

    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        class_id_coachee_id: { class_id: groupNoWlClassId, coachee_id: coacheeGroupNoWl },
      },
    });
    expect(enrollment).toBeNull();

    const notification = await prisma.notification.findFirst({
      where: { class_id: groupNoWlClassId, recipient_id: coachId },
    });
    expect(notification?.notification_type).toBe(5);
  });

  it("cancels a group enrollment with a waiting list (notification type 4, opened spot)", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${groupWlClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeGroupWl, "COACHEE")}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Enrollment canceled.",
      waitingListProcessed: true,
      claimedByCoachee: null,
    });

    const notification = await prisma.notification.findFirst({
      where: { class_id: groupWlClassId, recipient_id: coachId },
    });
    expect(notification?.notification_type).toBe(4);
  });

  it("cancels an assigned individual enrollment (notification type 3)", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${individualClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeIndividual, "COACHEE")}`);
    expect(res.status).toBe(200);
    expect(res.body.waitingListProcessed).toBe(false);

    const notification = await prisma.notification.findFirst({
      where: { class_id: individualClassId, recipient_id: coachId },
    });
    expect(notification?.notification_type).toBe(3);
  });

  it("returns NOT_FOUND when the Coachee is not enrolled", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${notEnrolledClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeGroupNoWl, "COACHEE")}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("returns VALIDATION_ERROR when the class is canceled", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${canceledClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coacheeCanceled, "COACHEE")}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns FORBIDDEN for a non-Coachee role", async () => {
    const res = await request(app)
      .delete(`/api/v1/classes/${groupNoWlClassId}/enrollment`)
      .set("Authorization", `Bearer ${token(coachId, "COACH")}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });
});
