import type { ClassType, Prisma, PrismaClient, User } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import { canAddToGymSlot, validateClassSize } from "../../domain/services/CapacityValidator.js";
import { hasOverlap, type TimeInterval } from "../../domain/services/OverlapChecker.js";
import { isWithinReach } from "../../domain/services/ReachCalculator.js";
import {
  combineDateWithTime,
  generateWeeklyDates,
} from "../../domain/services/RecurrenceGenerator.js";
import { zonedWallClockParts } from "../../domain/services/TimeZoneMath.js";
import { ConflictError, NotFoundError, ValidationError } from "../../infrastructure/errors.js";

const CLASS_DURATION_MINUTES = 60;
const RECURRING_INSTANCE_COUNT = 12;

export interface RecurrenceInput {
  enabled: boolean;
  dayOfWeek?: number;
  startDate?: string;
}

export interface CreateTrainingClassData {
  classType: ClassType;
  coacheeIds: string[];
  assignedCoachId?: string;
  levelId?: string | null;
  startDateTime: Date;
  description?: string | null;
  recurrence?: RecurrenceInput;
  createdBy: string;
}

export type TrainingClassWithRelations = Prisma.TrainingClassGetPayload<{
  include: {
    assignedCoach: true;
    level: true;
    enrollments: { include: { coachee: true } };
    waitingLists: true;
  };
}>;

export interface CreateTrainingClassResult {
  seriesId: string | null;
  recurrence: { enabled: boolean };
  instances: TrainingClassWithRelations[];
}

interface GymClassLike {
  class_type: ClassType;
  assigned_coach_id: string;
  start_time: Date;
  duration_minutes: number;
  enrollments: Array<{ coachee_id: string }>;
}

interface GymBlockLike {
  block_type: string;
  coach_id: string | null;
  start_time: Date;
  end_time: Date;
}

const CLASS_RELATIONS_INCLUDE = {
  assignedCoach: true,
  level: true,
  enrollments: { include: { coachee: true } },
  waitingLists: true,
} satisfies Prisma.TrainingClassInclude;

export class CreateTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(data: CreateTrainingClassData): Promise<CreateTrainingClassResult> {
    const { classType, levelId, description, recurrence, createdBy } = data;
    const coacheeIds = [...new Set(data.coacheeIds)];

    this.validateClassRules(classType, coacheeIds.length, levelId);
    if (!this.isHourAligned(data.startDateTime)) {
      throw new ValidationError("Class start time must be aligned to the hour.");
    }

    const level = levelId ? await this.loadLevel(levelId) : null;
    const creator = await this.loadUser(createdBy, "Creator");
    const coachId = await this.resolveAssignedCoachId(data.assignedCoachId, creator);
    const coach = await this.loadUser(coachId, "Assigned coach");
    const coachees = await this.loadCoachees(coacheeIds);
    if (classType === "GROUP" && level) {
      this.assertLevelReach(coachees, level.sort_order);
    }

    const { enabled, startTimes, seriesData } = this.buildInstanceStartTimes(
      recurrence,
      data.startDateTime,
    );

    const { rangeClasses, rangeBlocks } = await this.loadSlotContext(startTimes);

    for (const start of startTimes) {
      this.validateInstance(
        classType,
        coachId,
        new Set(coacheeIds),
        rangeClasses,
        rangeBlocks,
        start,
      );
    }

    const events = await this.createCalendarEvents({
      classType,
      levelName: level?.name,
      coachName: coach.name,
      startTimes,
      description,
      recurring: enabled,
      coachees,
    });

    const { seriesId, classIds } = await this.persist(
      classType,
      coachId,
      levelId,
      startTimes,
      description,
      coacheeIds,
      createdBy,
      events,
      seriesData,
    );

    const instances = await this.prisma.trainingClass.findMany({
      where: { id: { in: classIds } },
      include: CLASS_RELATIONS_INCLUDE,
      orderBy: { start_time: "asc" },
    });

    return { seriesId, recurrence: { enabled }, instances };
  }

  private validateClassRules(classType: ClassType, coacheeCount: number, levelId?: string | null) {
    if (!validateClassSize(classType, coacheeCount)) {
      throw new ValidationError(
        classType === "INDIVIDUAL"
          ? "An individual class requires exactly 1 coachee."
          : "A group class requires between 3 and 4 coachees.",
      );
    }
    if (classType === "GROUP" && !levelId) {
      throw new ValidationError("A group class requires a level.");
    }
    if (classType === "INDIVIDUAL" && levelId) {
      throw new ValidationError("Level must not be provided for individual classes.");
    }
  }

  private async loadLevel(levelId: string) {
    const level = await this.prisma.level.findUnique({ where: { id: levelId } });
    if (!level) throw new NotFoundError("Level not found.");
    return level;
  }

  private async loadUser(userId: string, label: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError(`${label} not found.`);
    return user;
  }

  private async resolveAssignedCoachId(assignedCoachId: string | undefined, creator: User) {
    let coachId = assignedCoachId;
    if (coachId === undefined) {
      if (creator.role !== "COACH" && creator.role !== "ADMIN") {
        throw new ValidationError("assignedCoachId is required for this role.");
      }
      coachId = creator.id;
    }
    const coach = await this.loadUser(coachId, "Assigned coach");
    if ((coach.role !== "COACH" && coach.role !== "ADMIN") || coach.status !== "ACTIVE") {
      throw new ValidationError("assignedCoachId must reference an active coach.");
    }
    return coach.id;
  }

  private async loadCoachees(coacheeIds: string[]) {
    const coachees = await this.prisma.user.findMany({
      where: { id: { in: coacheeIds } },
      include: { level: true },
    });
    const foundIds = new Set(coachees.map((coachee) => coachee.id));
    const missing = coacheeIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundError(`One or more coachees were not found: ${missing.join(", ")}.`);
    }
    const invalid = coachees.filter(
      (coachee) => coachee.role !== "COACHEE" || coachee.status !== "ACTIVE",
    );
    if (invalid.length > 0) {
      throw new ValidationError(
        `${invalid.map((coachee) => coachee.name).join(", ")} is not an active coachee.`,
      );
    }
    return coachees;
  }

  private assertLevelReach(
    coachees: Array<{ name: string; level: { sort_order: number } | null }>,
    classSortOrder: number,
  ) {
    const outOfReach = coachees
      .filter(
        (coachee) => !coachee.level || !isWithinReach(coachee.level.sort_order, classSortOrder),
      )
      .map((coachee) => coachee.name);
    if (outOfReach.length > 0) {
      throw new ConflictError(
        `Coachee level is outside the class level reach: ${outOfReach.join(", ")}.`,
        "LEVEL_MISMATCH",
      );
    }
  }

  private buildInstanceStartTimes(
    recurrence: RecurrenceInput | undefined,
    startDateTime: Date,
  ): {
    enabled: boolean;
    startTimes: Date[];
    seriesData: { dayOfWeek: number; startDate: Date } | null;
  } {
    if (!recurrence?.enabled) {
      return { enabled: false, startTimes: [startDateTime], seriesData: null };
    }
    if (typeof recurrence.dayOfWeek !== "number" || !recurrence.startDate) {
      throw new ValidationError("dayOfWeek and startDate are required when recurrence is enabled.");
    }
    const startDate = new Date(`${recurrence.startDate}T00:00:00.000Z`);
    const firstOccurrence = combineDateWithTime(startDate, startDateTime);
    if (zonedWallClockParts(firstOccurrence).weekday !== recurrence.dayOfWeek) {
      throw new ValidationError(
        "recurrence.startDate must fall on the configured recurrence.dayOfWeek.",
      );
    }
    return {
      enabled: true,
      startTimes: generateWeeklyDates(firstOccurrence, RECURRING_INSTANCE_COUNT),
      seriesData: { dayOfWeek: recurrence.dayOfWeek, startDate },
    };
  }

  private isHourAligned(date: Date): boolean {
    return date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
  }

  private async loadSlotContext(startTimes: Date[]) {
    const first = startTimes[0];
    const last = startTimes[startTimes.length - 1];
    const rangeEnd = new Date(last.getTime() + CLASS_DURATION_MINUTES * 60 * 1000);

    const [rangeClasses, rangeBlocks] = await Promise.all([
      this.prisma.trainingClass.findMany({
        where: { status: "ACTIVE", start_time: { gte: first, lte: rangeEnd } },
        include: { enrollments: true },
      }),
      this.prisma.block.findMany({
        where: { status: "ACTIVE", start_time: { gte: first, lte: rangeEnd } },
      }),
    ]);

    return { rangeClasses, rangeBlocks };
  }

  private validateInstance(
    classType: ClassType,
    coachId: string,
    coacheeIdSet: Set<string>,
    rangeClasses: GymClassLike[],
    rangeBlocks: GymBlockLike[],
    start: Date,
  ) {
    const end = new Date(start.getTime() + CLASS_DURATION_MINUTES * 60 * 1000);
    const target: TimeInterval = { start, end };

    const slotClasses = rangeClasses.filter((c) =>
      hasOverlap([this.toInterval(c.start_time, c.duration_minutes)], target),
    );
    const slotBlocks = rangeBlocks.filter((b) =>
      hasOverlap([{ start: b.start_time, end: b.end_time }], target),
    );

    this.assertGymCapacity(classType, slotClasses);
    this.assertCoachAssigned(coachId, slotClasses, slotBlocks);
    this.assertCoacheesAvailable(coacheeIdSet, slotClasses);
  }

  private toInterval(start: Date, durationMinutes: number): TimeInterval {
    return { start, end: new Date(start.getTime() + durationMinutes * 60 * 1000) };
  }

  private assertGymCapacity(classType: ClassType, slotClasses: GymClassLike[]) {
    const individualCount = slotClasses.filter((c) => c.class_type === "INDIVIDUAL").length;
    const groupCount = slotClasses.filter((c) => c.class_type === "GROUP").length;
    if (!canAddToGymSlot({ individualCount, groupCount }, classType)) {
      throw new ConflictError(
        "Gym capacity would be exceeded for this time slot (max 2 individual + 1 group).",
        "CAPACITY_EXCEEDED",
      );
    }
  }

  private assertCoachAssigned(
    coachId: string,
    slotClasses: GymClassLike[],
    slotBlocks: GymBlockLike[],
  ) {
    const blockConflict = slotBlocks.some(
      (b) => b.block_type === "GYM_WIDE" || (b.block_type === "PERSONAL" && b.coach_id === coachId),
    );
    const classConflict = slotClasses.some((c) => c.assigned_coach_id === coachId);
    if (blockConflict || classConflict) {
      throw new ConflictError(
        "The assigned coach already has an overlapping class or time block.",
        "OVERLAP_DETECTED",
      );
    }
  }

  private assertCoacheesAvailable(coacheeIdSet: Set<string>, slotClasses: GymClassLike[]) {
    for (const c of slotClasses) {
      for (const enrollment of c.enrollments) {
        if (coacheeIdSet.has(enrollment.coachee_id)) {
          throw new ConflictError(
            "One or more coachees already have an overlapping class.",
            "OVERLAP_DETECTED",
          );
        }
      }
    }
  }

  private buildEventTitle(
    classType: ClassType,
    coachees: Array<{ name: string; level: { name: string } | null }>,
    levelName: string | undefined,
  ): string {
    if (classType === "INDIVIDUAL") {
      const coachee = coachees[0];
      const category = coachee?.level?.name ?? levelName;
      return category ? `${coachee.name} - ${category}` : coachee.name;
    }
    return levelName ? `Group class - ${levelName}` : "Group class";
  }

  private buildEventDescription(input: {
    classType: ClassType;
    coachName: string;
    recurring: boolean;
    description: string | null | undefined;
    coachees: Array<{ name: string }>;
  }): string {
    const lines: string[] = [`Coach: ${input.coachName}`];
    lines.push(input.recurring ? "Recurring: weekly" : "Recurring: no");
    if (input.classType === "GROUP" && input.coachees.length > 0) {
      lines.push(`Coachees: ${input.coachees.map((c) => c.name).join(", ")}`);
    }
    if (input.description) {
      lines.push(`Notes: ${input.description}`);
    }
    return lines.join("\n");
  }

  private async createCalendarEvents(input: {
    classType: ClassType;
    levelName?: string;
    coachName: string;
    startTimes: Date[];
    description: string | null | undefined;
    recurring: boolean;
    coachees: Array<{ name: string; level: { name: string } | null }>;
  }): Promise<string[]> {
    const title = this.buildEventTitle(input.classType, input.coachees, input.levelName);
    const description = this.buildEventDescription(input);
    const events: string[] = [];
    for (const start of input.startTimes) {
      const eventId = await this.calendar.createEvent({
        title,
        startTime: start,
        endTime: new Date(start.getTime() + CLASS_DURATION_MINUTES * 60 * 1000),
        timezone: "Europe/Madrid",
        description,
      });
      events.push(eventId);
    }
    return events;
  }

  private async persist(
    classType: ClassType,
    coachId: string,
    levelId: string | null | undefined,
    startTimes: Date[],
    description: string | null | undefined,
    coacheeIds: string[],
    createdBy: string,
    eventIds: string[],
    seriesData: { dayOfWeek: number; startDate: Date } | null,
  ): Promise<{ seriesId: string | null; classIds: string[] }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let seriesId: string | null = null;
        if (seriesData) {
          const series = await tx.recurrenceSeries.create({
            data: {
              class_type: classType,
              level_id: levelId ?? null,
              coach_id: coachId,
              day_of_week: seriesData.dayOfWeek,
              start_time: startTimes[0],
              start_date: seriesData.startDate,
              created_by: createdBy,
            },
          });
          seriesId = series.id;
        }

        const classIds: string[] = [];
        for (let i = 0; i < startTimes.length; i++) {
          const created = await tx.trainingClass.create({
            data: {
              class_type: classType,
              assigned_coach_id: coachId,
              level_id: levelId ?? null,
              start_time: startTimes[i],
              duration_minutes: CLASS_DURATION_MINUTES,
              description: description ?? null,
              recurrence_series_id: seriesId,
              google_event_id: eventIds[i],
              created_by: createdBy,
            },
          });
          classIds.push(created.id);
          if (coacheeIds.length > 0) {
            await tx.classEnrollment.createMany({
              data: coacheeIds.map((coacheeId) => ({
                class_id: created.id,
                coachee_id: coacheeId,
              })),
            });
          }
        }
        return { seriesId, classIds };
      });
    } catch (error) {
      await this.rollbackCalendarEvents(eventIds);
      throw error;
    }
  }

  private async rollbackCalendarEvents(eventIds: string[]) {
    for (const eventId of eventIds) {
      try {
        await this.calendar.deleteEvent(eventId);
      } catch {
        // Best-effort cleanup; the original error is preserved.
      }
    }
  }
}
