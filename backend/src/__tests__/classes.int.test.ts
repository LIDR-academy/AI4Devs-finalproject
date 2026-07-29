import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CreateTrainingClass } from "../application/use-cases/CreateTrainingClass.js";
import { DeleteTrainingClass } from "../application/use-cases/DeleteTrainingClass.js";
import { ListTrainingClasses } from "../application/use-cases/ListTrainingClasses.js";
import { env, resolveCalendarId } from "../config/env.js";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";

const keyPath = env.GOOGLE_CALENDAR_SA_KEY_PATH
  ? resolve(process.cwd(), env.GOOGLE_CALENDAR_SA_KEY_PATH)
  : null;

const hasCredentials = !!(
  env.GOOGLE_CALENDAR_SA_EMAIL &&
  env.GOOGLE_CALENDAR_SA_KEY_PATH &&
  resolveCalendarId() &&
  keyPath &&
  existsSync(keyPath)
);

describe.runIf(hasCredentials)("TrainingClass Calendar Sync Integration", () => {
  const prisma = new PrismaClient();
  let adapter: GoogleCalendarAdapter;
  let createTrainingClass: CreateTrainingClass;
  let deleteTrainingClass: DeleteTrainingClass;
  let listTrainingClasses: ListTrainingClasses;
  let createdClassId: string | null = null;

  beforeAll(() => {
    const calendarId = resolveCalendarId();
    if (!calendarId || !env.GOOGLE_CALENDAR_SA_EMAIL || !env.GOOGLE_CALENDAR_SA_KEY_PATH) {
      throw new Error("Missing Google Calendar credentials in env");
    }
    adapter = new GoogleCalendarAdapter(
      env.GOOGLE_CALENDAR_SA_EMAIL,
      env.GOOGLE_CALENDAR_SA_KEY_PATH,
      calendarId,
    );
    createTrainingClass = new CreateTrainingClass(prisma, adapter);
    deleteTrainingClass = new DeleteTrainingClass(prisma, adapter);
    listTrainingClasses = new ListTrainingClasses(prisma);
  });

  it("should create a class and persist google_event_id", async () => {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const coach = await prisma.user.findFirst({ where: { role: "COACH" } });

    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 14);
    startTime.setHours(10, 0, 0, 0);

    const trainingClass = await createTrainingClass.execute({
      classType: "GROUP",
      assignedCoachId: coach?.id ?? "00000000-0000-0000-0000-000000000000",
      startTime,
      description: "Integration test class — safe to delete",
      createdBy: adminUser?.id ?? "00000000-0000-0000-0000-000000000000",
    });

    expect(trainingClass.id).toBeTruthy();
    expect(trainingClass.google_event_id).toBeTruthy();
    expect(typeof trainingClass.google_event_id).toBe("string");
    createdClassId = trainingClass.id;
  }, 30000);

  it("should list training classes", async () => {
    const classes = await listTrainingClasses.execute();
    expect(Array.isArray(classes)).toBe(true);
  });

  it("should delete a class and its calendar event", async () => {
    if (!createdClassId) {
      return;
    }
    await expect(deleteTrainingClass.execute(createdClassId)).resolves.toBeUndefined();
  }, 15000);

  afterAll(async () => {
    if (createdClassId) {
      try {
        await deleteTrainingClass.execute(createdClassId);
      } catch {
        // Already cleaned up
      }
    }
    await prisma.$disconnect();
  });
});
