import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GetTrainingClass } from "../application/use-cases/GetTrainingClass.js";
import { toTrainingClassDTO } from "../infrastructure/dto/trainingClassDto.js";
import { NotFoundError } from "../infrastructure/errors.js";

describe("GetTrainingClass", () => {
  const prisma = new PrismaClient();
  const useCase = new GetTrainingClass(prisma);

  let admin: User;
  let coach: User;
  let enrolledCoachee: User;
  let otherCoachee: User;
  let levelId: string | null = null;
  let createdUserIds: string[] = [];
  const createdClassIds: string[] = [];
  let groupClassId: string;
  let individualClassId: string;

  const detailStart = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    const level = await prisma.level.findFirst();
    levelId = level?.id ?? null;

    admin = await prisma.user.create({
      data: {
        email: `get-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Get Admin",
        phone: "+34 600 000 401",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `get-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Get Coach",
        phone: "+34 600 000 402",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    enrolledCoachee = await prisma.user.create({
      data: {
        email: `get-enrolled-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Get Enrolled",
        phone: "+34 600 000 403",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    otherCoachee = await prisma.user.create({
      data: {
        email: `get-other-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Get Other",
        phone: "+34 600 000 404",
        role: "COACHEE",
        status: "ACTIVE",
        level_id: levelId,
      },
    });
    createdUserIds = [admin.id, coach.id, enrolledCoachee.id, otherCoachee.id];

    const group = await prisma.trainingClass.create({
      data: {
        class_type: "GROUP",
        assigned_coach_id: coach.id,
        level_id: levelId,
        start_time: detailStart,
        duration_minutes: 60,
        description: "Group detail",
        created_by: admin.id,
      },
    });
    groupClassId = group.id;
    createdClassIds.push(group.id);
    await prisma.classEnrollment.create({
      data: { class_id: group.id, coachee_id: enrolledCoachee.id },
    });

    const individual = await prisma.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: coach.id,
        level_id: null,
        start_time: new Date(detailStart.getTime() + 60 * 60 * 1000),
        duration_minutes: 60,
        description: null,
        created_by: admin.id,
      },
    });
    individualClassId = individual.id;
    createdClassIds.push(individual.id);
    await prisma.classEnrollment.create({
      data: { class_id: individual.id, coachee_id: enrolledCoachee.id },
    });
  }, 20000);

  afterAll(async () => {
    await prisma.classEnrollment.deleteMany({ where: { class_id: { in: createdClassIds } } });
    await prisma.trainingClass.deleteMany({ where: { id: { in: createdClassIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("returns the full detail row for an admin", async () => {
    const { row } = await useCase.execute({
      id: groupClassId,
      viewerRole: "ADMIN",
      viewerId: admin.id,
    });
    expect(row.id).toBe(groupClassId);
    expect(row.class_type).toBe("GROUP");
    expect(row.assignedCoach.id).toBe(coach.id);
    expect(row.level).not.toBeNull();
    expect(row.duration_minutes).toBe(60);
    expect(row.description).toBe("Group detail");
    expect(row.enrollments).toHaveLength(1);
    expect(row.waitingLists).toHaveLength(0);

    const dto = toTrainingClassDTO(row, { viewerRole: "ADMIN", viewerId: admin.id });
    expect(dto).toMatchObject({
      id: groupClassId,
      classType: "GROUP",
      assignedCoach: { id: coach.id, name: coach.name },
      durationMinutes: 60,
      description: "Group detail",
      enrollmentCount: 1,
      capacity: 4,
      hasWaitingList: false,
      waitingListCount: 0,
      isRecurring: false,
      recurrenceSeriesId: null,
    });
    expect(dto.level).not.toBeNull();
    expect(dto.level?.name).toBeDefined();
    expect(dto.enrolledCoachees).toEqual([{ id: enrolledCoachee.id, name: enrolledCoachee.name }]);
    expect(dto.coacheeStatus).toBeUndefined();
  });

  it("adds coacheeStatus for a coachee viewer", async () => {
    const { row, coacheeStatus } = await useCase.execute({
      id: groupClassId,
      viewerRole: "COACHEE",
      viewerId: otherCoachee.id,
    });
    expect(coacheeStatus).toEqual({
      isEnrolled: false,
      isOnWaitingList: false,
      isWithinReach: true,
    });
    expect(row.class_type).toBe("GROUP");
  });

  it("reports isEnrolled and reveals names for an enrolled coachee", async () => {
    const { row, coacheeStatus } = await useCase.execute({
      id: groupClassId,
      viewerRole: "COACHEE",
      viewerId: enrolledCoachee.id,
    });
    expect(coacheeStatus?.isEnrolled).toBe(true);
    const dto = toTrainingClassDTO(row, {
      viewerRole: "COACHEE",
      viewerId: enrolledCoachee.id,
      coacheeStatus,
    });
    expect(dto.enrolledCoachees).toEqual([{ id: enrolledCoachee.id, name: enrolledCoachee.name }]);
  });

  it("hides coachee names from a non-enrolled coachee but keeps the count", async () => {
    const { row, coacheeStatus } = await useCase.execute({
      id: groupClassId,
      viewerRole: "COACHEE",
      viewerId: otherCoachee.id,
    });
    const dto = toTrainingClassDTO(row, {
      viewerRole: "COACHEE",
      viewerId: otherCoachee.id,
      coacheeStatus,
    });
    expect(dto.enrolledCoachees).toEqual([]);
    expect(dto.enrollmentCount).toBe(1);
  });

  it("does not add coacheeStatus for admin or coach viewers", async () => {
    const adminResult = await useCase.execute({
      id: individualClassId,
      viewerRole: "ADMIN",
      viewerId: admin.id,
    });
    expect(adminResult.coacheeStatus).toBeUndefined();

    const coachResult = await useCase.execute({
      id: individualClassId,
      viewerRole: "COACH",
      viewerId: coach.id,
    });
    expect(coachResult.coacheeStatus).toBeUndefined();
  });

  it("throws NotFoundError for an unknown class", async () => {
    await expect(
      useCase.execute({
        id: "00000000-0000-0000-0000-000000000000",
        viewerRole: "ADMIN",
        viewerId: admin.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
