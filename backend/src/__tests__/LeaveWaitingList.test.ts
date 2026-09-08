import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { LeaveWaitingList } from "../application/use-cases/LeaveWaitingList.js";
import { WaitingListPolicy } from "../domain/services/WaitingListPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

describe("LeaveWaitingList", () => {
  const prisma = new PrismaClient();
  const policy = new WaitingListPolicy();
  const auditLogger = new AuditLogger(prisma);
  const leave = new LeaveWaitingList(prisma, policy, auditLogger);

  let levelId: string;
  let coach: User;
  let owner: User;
  let actor: User;
  let outsider: User;
  let coachUser: User;
  const createdUserIds: string[] = [];
  const ids: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  async function makeLevel(): Promise<string> {
    const level = await prisma.level.create({
      data: { name: `leave-${Date.now()}`, color: "#445566", sort_order: 1 },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 511",
        role: role as "COACH" | "COACHEE",
        status: "ACTIVE",
        level_id: role === "COACHEE" ? levelId : null,
      },
    });
    createdUserIds.push(user.id);
    return user;
  }

  async function makeClass(options: {
    enrolled: string[];
    waitingList: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: "GROUP",
        assigned_coach_id: coach.id,
        level_id: levelId,
        start_time: future(24),
        duration_minutes: 60,
        status: "ACTIVE",
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
    for (const coacheeId of options.waitingList) {
      await prisma.waitingList.create({
        data: { class_id: trainingClass.id, coachee_id: coacheeId },
      });
    }
    return trainingClass.id;
  }

  beforeAll(async () => {
    levelId = await makeLevel();
    coach = await makeUser("Leave Coach", "COACH");
    owner = await makeUser("Leave Owner", "COACHEE");
    actor = await makeUser("Leave Actor", "COACHEE");
    outsider = await makeUser("Leave Outsider", "COACHEE");
    coachUser = await makeUser("Leave Coach User", "COACH");
  });

  beforeEach(async () => {
    await prisma.notification.deleteMany({ where: { recipient_id: { in: createdUserIds } } });
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
    await prisma.securityAuditLog.deleteMany({
      where: { action: "waiting-list.leave", actor_id: { in: createdUserIds } },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { recipient_id: { in: createdUserIds } } });
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.level.deleteMany({ where: { id: levelId } });
    await prisma.$disconnect();
  });

  it("removes the waiting-list entry and records a type-10 notification (happy path)", async () => {
    const classId = await makeClass({ enrolled: [], waitingList: [owner.id] });

    const result = await leave.execute({ classId, coacheeId: owner.id });

    expect(result).toEqual({ message: "Removed from waiting list." });

    const stored = await prisma.waitingList.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: owner.id } },
    });
    expect(stored).toBeNull();

    const remaining = await prisma.waitingList.count({ where: { class_id: classId } });
    expect(remaining).toBe(0);

    const notification = await prisma.notification.findFirst({
      where: { notification_type: 10, recipient_id: owner.id, class_id: classId },
    });
    expect(notification).not.toBeNull();

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "waiting-list.leave", outcome: "SUCCESS", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(owner.id);
  });

  it("removes only the actor's entry when multiple Coachees are waitlisted", async () => {
    const classId = await makeClass({ enrolled: [], waitingList: [owner.id, actor.id] });

    await leave.execute({ classId, coacheeId: owner.id });

    const ownerEntry = await prisma.waitingList.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: owner.id } },
    });
    expect(ownerEntry).toBeNull();

    const actorEntry = await prisma.waitingList.findUnique({
      where: { class_id_coachee_id: { class_id: classId, coachee_id: actor.id } },
    });
    expect(actorEntry).not.toBeNull();
  });

  it("returns 404 when the class does not exist", async () => {
    await expect(
      leave.execute({
        classId: "00000000-0000-0000-0000-000000000000",
        coacheeId: owner.id,
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("returns 404 when the Coachee is not on the waiting list", async () => {
    const classId = await makeClass({ enrolled: [], waitingList: [owner.id] });

    await expect(leave.execute({ classId, coacheeId: outsider.id })).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("returns 403 when the actor is not a Coachee", async () => {
    const classId = await makeClass({ enrolled: [], waitingList: [owner.id] });

    await expect(leave.execute({ classId, coacheeId: coachUser.id })).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("writes a DENIED audit log when leaving is refused", async () => {
    const classId = await makeClass({ enrolled: [], waitingList: [owner.id] });

    await expect(leave.execute({ classId, coacheeId: outsider.id })).rejects.toMatchObject({
      statusCode: 404,
    });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "waiting-list.leave", outcome: "DENIED", resource_id: classId },
    });
    expect(audit?.actor_id).toBe(outsider.id);
  });
});
