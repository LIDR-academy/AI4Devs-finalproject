import type { PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import { zonedDateTimeToUtc } from "../../domain/services/TimeZoneMath.js";

export interface GetAvailableSlotsInput {
  date: string;
  coachId: string;
  classType: "INDIVIDUAL" | "GROUP";
}

export interface AvailableSlot {
  start: string;
  end: string;
  capacityAvailable: "individual" | "group" | "both";
}

export interface GetAvailableSlotsOutput {
  date: string;
  coachId: string;
  availableSlots: AvailableSlot[];
}

const OPERATING_START_HOUR = 7;
const OPERATING_END_HOUR = 23;

export class GetAvailableSlots {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
  ) {}

  async execute(input: GetAvailableSlotsInput): Promise<GetAvailableSlotsOutput> {
    const { date, coachId, classType } = input;

    const dayStart = zonedDateTimeToUtc(date, "00:00");
    const dayEnd = zonedDateTimeToUtc(date, "23:59");

    const [freeBusyResult, existingClasses, blocks, allActiveClasses] = await Promise.all([
      this.calendar.queryFreeBusy({ timeMin: dayStart, timeMax: dayEnd }),
      this.prisma.trainingClass.findMany({
        where: {
          assigned_coach_id: coachId,
          status: "ACTIVE",
          start_time: { gte: dayStart, lte: dayEnd },
        },
      }),
      this.prisma.block.findMany({
        where: {
          status: "ACTIVE",
          start_time: { gte: dayStart, lte: dayEnd },
          OR: [{ block_type: "GYM_WIDE" }, { block_type: "PERSONAL", coach_id: coachId }],
        },
      }),
      this.prisma.trainingClass.findMany({
        where: {
          status: "ACTIVE",
          start_time: { gte: dayStart, lte: dayEnd },
        },
        include: { enrollments: true },
      }),
    ]);

    const busyOverlapChecker = this.makeBusyOverlapChecker(freeBusyResult.busySlots);

    const slots: AvailableSlot[] = [];

    for (let hour = OPERATING_START_HOUR; hour < OPERATING_END_HOUR; hour++) {
      const startTimeStr = `${String(hour).padStart(2, "0")}:00`;
      const endTimeStr = `${String(hour + 1).padStart(2, "0")}:00`;

      const slotStart = zonedDateTimeToUtc(date, `${startTimeStr}`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      if (busyOverlapChecker(slotStart, slotEnd)) continue;

      if (this.overlapsAny(existingClasses, slotStart, slotEnd)) continue;

      if (this.overlapsAny(blocks, slotStart, slotEnd)) continue;

      const { individualCount, groupCount } = this.countClassesInSlot(
        allActiveClasses,
        slotStart,
        slotEnd,
      );

      const canAddIndividual = individualCount < 2;
      const canAddGroup = groupCount < 1;

      if (!canAddIndividual && !canAddGroup) continue;

      if (classType === "INDIVIDUAL" && !canAddIndividual) continue;
      if (classType === "GROUP" && !canAddGroup) continue;

      let capacityAvailable: "individual" | "group" | "both";
      if (canAddIndividual && canAddGroup) {
        capacityAvailable = "both";
      } else if (canAddIndividual) {
        capacityAvailable = "individual";
      } else {
        capacityAvailable = "group";
      }

      slots.push({ start: startTimeStr, end: endTimeStr, capacityAvailable });
    }

    return { date, coachId, availableSlots: slots };
  }

  private makeBusyOverlapChecker(
    busySlots: Array<{ start: string; end: string }>,
  ): (slotStart: Date, slotEnd: Date) => boolean {
    const parsed = busySlots
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));

    return (slotStart: Date, slotEnd: Date) =>
      parsed.some((b) => slotStart < b.end && slotEnd > b.start);
  }

  private overlapsAny(
    items: Array<{ start_time: Date; end_time?: Date; duration_minutes?: number }>,
    slotStart: Date,
    slotEnd: Date,
  ): boolean {
    return items.some((item) => {
      const itemStart = new Date(item.start_time);
      const itemEnd = item.end_time
        ? new Date(item.end_time)
        : new Date(itemStart.getTime() + (item.duration_minutes ?? 60) * 60 * 1000);
      return slotStart < itemEnd && slotEnd > itemStart;
    });
  }

  private countClassesInSlot(
    classes: Array<{ class_type: string; start_time: Date; duration_minutes: number }>,
    slotStart: Date,
    slotEnd: Date,
  ): { individualCount: number; groupCount: number } {
    let individualCount = 0;
    let groupCount = 0;

    for (const c of classes) {
      const classStart = new Date(c.start_time);
      const classEnd = new Date(classStart.getTime() + c.duration_minutes * 60 * 1000);
      if (slotStart < classEnd && slotEnd > classStart) {
        if (c.class_type === "INDIVIDUAL") individualCount++;
        else groupCount++;
      }
    }

    return { individualCount, groupCount };
  }
}
