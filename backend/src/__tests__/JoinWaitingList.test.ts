import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { JoinWaitingList } from "../application/use-cases/JoinWaitingList.js";
import { WaitingListPolicy } from "../domain/services/WaitingListPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

describe("JoinWaitingList", () => {
  const prisma = new PrismaClient();
  const policy = new WaitingListPolicy();
  const auditLogger = new AuditLogger(prisma);
  const join = new JoinWaitingList(prisma, policy, auditLogger);

  let levelOkId: string;
  let levelFarId: string;
  let coach: User;
  let coachee: User;
  let coacheeNoLevel: User;
  let otherCoachee: User;
  let coachUser: User;
  const createdUserIds: string[] = [];
  const ids: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  async function makeLevel(name: string, sortOrder: number): Promise<string> {
    const level = await prisma.level.create({
      data: { name, color: "#112233", sort_order: sortOrder },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string, levelId: string | null): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 031",
        role: role as "COACH" | "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds.push(user.id);
    return user;
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
        assigned_coach_id: coach.id,
        level_id: options.levelId,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        created_by: coach.id,
      },
    });
    ids.push(trainingClass.id);
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

  async function onWaitingList(classId: string, coacheeIds: string[]): Promise<void> {
    if (coacheeIds.length > 0) {
      await prisma.waitingList.createMany({
        data: coacheeIds.map((coacheeId) => ({ class_id: classId, coachee_id: coacheeId })),
      });
    }
  }

  beforeAll(async () => {
    levelOkId = await makeLevel(`wl-ok-${Date.now()}`, 1);
    levelFarId = await makeLevel(`wl-far-${Date.now()}`, 5);
    coach = await makeUser("WL Coach", "COACH", null);
    coachee = await makeUser("WL Coachee", "COACHEE", levelOkId);
    coacheeNoLevel = await makeUser("WL Coachee NoLevel", "COACHEE", null);
    otherCoachee = await makeUser("WL Other Coachee", "COACHEE", levelOkId);
    coachUser = await makeUser("WL Coach User", "COACH", null);
  });

  beforeEach(async () => {
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
    await prisma.securityAuditLog.deleteMany({
      where: { action: "waiting-list.join", actor_id: { in: createdUserIds } },
    });
    await prisma.notification.deleteMany({
      where: { notification_type: 9, recipient_id: { in: createdUserIds } },
    });
  });

  afterAll(async () => {
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.notification.deleteMany({ where: { recipient_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({
      where: { id: { in: [levelOkId, levelFarId] } },
    });
    await prisma.$disconnect();
  });

  it("joins a Coachee to a full ACTIVE group class waiting list (happy path) and persists the entry", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 4", "COACHEE", levelOkId)).id,
      },
    });

    // Bystander joins the waiting list of the now-full class.
    const bystander = await makeUser("WL Bystander", "COACHEE", levelOkId);
    const result = await join.execute({ classId, coacheeId: bystander.id });

    expect(result).toMatchObject({ classId, coacheeId: bystander.id });
    expect(result.id).toBeTruthy();
    expect(new Date(result.joinedAt).getTime()).not.toBeNaN();

    const stored = await prisma.waitingList.findUnique({
      where: {
        class_id_coachee_id: { class_id: classId, coachee_id: bystander.id },
      },
    });
    expect(stored).not.toBeNull();

    const notification = await prisma.notification.findFirst({
      where: { notification_type: 9, recipient_id: bystander.id, class_id: classId },
    });
    expect(notification).not.toBeNull();

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "waiting-list.join", outcome: "SUCCESS", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(bystander.id);
  });

  it("rejects with 409 ALREADY_ON_WAITING_LIST when the Coachee is already on the list", async () => {
    const seatA = await makeUser("WL OnList Seat A", "COACHEE", levelOkId);
    const seatB = await makeUser("WL OnList Seat B", "COACHEE", levelOkId);
    const seatC = await makeUser("WL OnList Seat C", "COACHEE", levelOkId);
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [otherCoachee.id, seatA.id, seatB.id, seatC.id],
    });
    await onWaitingList(classId, [coachee.id]);

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "ALREADY_ON_WAITING_LIST",
    });
  });

  it("rejects with 409 ALREADY_ENROLLED when the Coachee is already enrolled in the class", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 4", "COACHEE", levelOkId)).id,
      },
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "ALREADY_ENROLLED",
    });
  });

  it("rejects with 409 WAITING_LIST_FULL when the waiting list has 4 members", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 4", "COACHEE", levelOkId)).id,
      },
    });
    await onWaitingList(classId, [
      (await makeUser("WL OnList 1", "COACHEE", levelOkId)).id,
      (await makeUser("WL OnList 2", "COACHEE", levelOkId)).id,
      (await makeUser("WL OnList 3", "COACHEE", levelOkId)).id,
      (await makeUser("WL OnList 4", "COACHEE", levelOkId)).id,
    ]);
    const bystander = await makeUser("WL Bystander Full", "COACHEE", levelOkId);

    await expect(join.execute({ classId, coacheeId: bystander.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "WAITING_LIST_FULL",
    });
  });

  it("rejects with 409 LEVEL_MISMATCH when the Coachee has no level", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 4", "COACHEE", levelOkId)).id,
      },
    });

    await expect(join.execute({ classId, coacheeId: coacheeNoLevel.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "LEVEL_MISMATCH",
    });
  });

  it("rejects with 409 LEVEL_MISMATCH when the class is out of reach", async () => {
    const seat3 = await makeUser("WL Far Seat 3", "COACHEE", levelFarId);
    const seat4 = await makeUser("WL Far Seat 4", "COACHEE", levelFarId);
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelFarId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id, seat3.id, seat4.id],
    });
    const bystander = await makeUser("WL Far Bystander", "COACHEE", levelOkId);

    await expect(join.execute({ classId, coacheeId: bystander.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "LEVEL_MISMATCH",
    });
  });

  it("rejects with 400 VALIDATION_ERROR when the group class is not full", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("rejects with 400 VALIDATION_ERROR for a canceled class", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      status: "CANCELED",
      enrolled: [],
    });

    await expect(join.execute({ classId, coacheeId: coachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("returns 404 for a non-existent class", async () => {
    await expect(
      join.execute({
        classId: "00000000-0000-0000-0000-000000000000",
        coacheeId: coachee.id,
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("rejects with 403 when the actor is not a Coachee", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 3", "COACHEE", levelOkId)).id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        class_id: classId,
        coachee_id: (await makeUser("WL Seat 4", "COACHEE", levelOkId)).id,
      },
    });

    await expect(join.execute({ classId, coacheeId: coachUser.id })).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("writes a DENIED audit log when the join is refused", async () => {
    const seatA = await makeUser("WL Denied Seat A", "COACHEE", levelOkId);
    const seatB = await makeUser("WL Denied Seat B", "COACHEE", levelOkId);
    const seatC = await makeUser("WL Denied Seat C", "COACHEE", levelOkId);
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, seatA.id, seatB.id, seatC.id],
    });

    await expect(join.execute({ classId, coacheeId: coacheeNoLevel.id })).rejects.toMatchObject({
      statusCode: 409,
      code: "LEVEL_MISMATCH",
    });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "waiting-list.join", outcome: "DENIED", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(coacheeNoLevel.id);
  });

  it("does not create a waiting-list entry when the join is refused", async () => {
    const classId = await makeClass({
      classType: "GROUP",
      levelId: levelOkId,
      start: future(24),
      enrolled: [coachee.id, otherCoachee.id],
    });

    await expect(join.execute({ classId, coacheeId: otherCoachee.id })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });

    const count = await prisma.waitingList.count({ where: { class_id: classId } });
    expect(count).toBe(0);
  });
});
