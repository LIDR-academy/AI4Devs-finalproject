import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ListWaitingLists } from "../application/use-cases/ListWaitingLists.js";
import { WaitingListPolicy } from "../domain/services/WaitingListPolicy.js";

describe("ListWaitingLists", () => {
  const prisma = new PrismaClient();
  const policy = new WaitingListPolicy();
  const list = new ListWaitingLists(prisma, policy);

  let levelId: string;
  let coach: User;
  let coachee: User;
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
      data: { name: `list-${Date.now()}`, color: "#778899", sort_order: 2 },
    });
    return level.id;
  }

  async function makeUser(name: string, role: string): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`,
        password_hash: "not-used",
        name,
        phone: "+34 600 000 611",
        role: role as "COACH" | "COACHEE",
        status: "ACTIVE",
        level_id: role === "COACHEE" ? levelId : null,
      },
    });
    createdUserIds.push(user.id);
    return user;
  }

  async function makeClass(options: {
    classType: "INDIVIDUAL" | "GROUP";
    start: Date;
    status?: "ACTIVE" | "CANCELED";
    enrolled: number;
    waitingList: string[];
  }): Promise<string> {
    const trainingClass = await prisma.trainingClass.create({
      data: {
        class_type: options.classType,
        assigned_coach_id: coach.id,
        level_id: options.classType === "GROUP" ? levelId : null,
        start_time: options.start,
        duration_minutes: 60,
        status: options.status ?? "ACTIVE",
        created_by: coach.id,
      },
    });
    ids.push(trainingClass.id);
    for (let i = 0; i < options.enrolled; i++) {
      await prisma.classEnrollment.create({
        data: {
          class_id: trainingClass.id,
          coachee_id: (await makeUser("List Seat", "COACHEE")).id,
        },
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
    coach = await makeUser("List Coach", "COACH");
    coachee = await makeUser("List Coachee", "COACHEE");
  });

  beforeEach(async () => {
    await prisma.waitingList.deleteMany();
    await prisma.classEnrollment.deleteMany();
    if (ids.length) {
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
  });

  afterAll(async () => {
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

  it("returns only the Coachee's active waiting lists with class details (no position)", async () => {
    const fullGroup = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: 4,
      waitingList: [coachee.id],
    });
    const partialGroup = await makeClass({
      classType: "GROUP",
      start: future(30),
      enrolled: 2,
      waitingList: [coachee.id],
    });

    const result = await list.execute({ coacheeId: coachee.id, page: 1, limit: 20 });

    expect(result.meta).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
    expect(result.data).toHaveLength(2);

    const byClass = new Map(result.data.map((item) => [item.class.id, item]));
    expect(byClass.get(fullGroup)).toMatchObject({
      class: {
        id: fullGroup,
        classType: "GROUP",
        assignedCoach: { name: coach.name },
      },
      hasOpenSpots: false,
    });
    expect(byClass.get(partialGroup)).toMatchObject({
      class: {
        id: partialGroup,
        classType: "GROUP",
      },
      hasOpenSpots: true,
    });
    expect(byClass.get(fullGroup)?.class.level).toMatchObject({
      name: expect.any(String),
      color: expect.any(String),
    });

    for (const item of result.data) {
      expect(item).not.toHaveProperty("position");
    }
  });

  it("excludes entries whose class is canceled", async () => {
    await makeClass({
      classType: "GROUP",
      start: future(24),
      status: "CANCELED",
      enrolled: 4,
      waitingList: [coachee.id],
    });

    const result = await list.execute({ coacheeId: coachee.id, page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it("computes hasOpenSpots correctly for an occupied individual slot (false)", async () => {
    const individual = await makeClass({
      classType: "INDIVIDUAL",
      start: future(26),
      enrolled: 1,
      waitingList: [coachee.id],
    });

    const result = await list.execute({ coacheeId: coachee.id, page: 1, limit: 20 });

    const item = result.data.find((entry) => entry.class.id === individual);
    expect(item?.hasOpenSpots).toBe(false);
  });

  it("paginates results", async () => {
    await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: 4,
      waitingList: [coachee.id],
    });
    await makeClass({
      classType: "GROUP",
      start: future(25),
      enrolled: 4,
      waitingList: [coachee.id],
    });
    await makeClass({
      classType: "GROUP",
      start: future(26),
      enrolled: 4,
      waitingList: [coachee.id],
    });

    const page1 = await list.execute({ coacheeId: coachee.id, page: 1, limit: 2 });
    expect(page1.data).toHaveLength(2);
    expect(page1.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });

    const page2 = await list.execute({ coacheeId: coachee.id, page: 2, limit: 2 });
    expect(page2.data).toHaveLength(1);
  });

  it("orders entries by joined_at ascending", async () => {
    const first = await makeClass({
      classType: "GROUP",
      start: future(24),
      enrolled: 4,
      waitingList: [],
    });
    const second = await makeClass({
      classType: "GROUP",
      start: future(25),
      enrolled: 4,
      waitingList: [],
    });

    await prisma.waitingList.create({
      data: { class_id: second, coachee_id: coachee.id, joined_at: new Date() },
    });
    await prisma.waitingList.create({
      data: { class_id: first, coachee_id: coachee.id, joined_at: new Date(Date.now() - 60000) },
    });

    const result = await list.execute({ coacheeId: coachee.id, page: 1, limit: 20 });
    expect(result.data.map((item) => item.class.id)).toEqual([first, second]);
  });
});
