import { Prisma, type PrismaClient } from "@prisma/client";
import { WaitingListPolicy } from "../../domain/services/WaitingListPolicy.js";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface JoinWaitingListInput {
  classId: string;
  coacheeId: string;
}

export interface JoinWaitingListResult {
  id: string;
  classId: string;
  coacheeId: string;
  joinedAt: string;
}

type JoinVerdictCode =
  | "CANCELED_CLASS"
  | "GROUP_NOT_FULL"
  | "SLOT_NOT_OCCUPIED"
  | "ALREADY_ENROLLED"
  | "ALREADY_ON_WAITING_LIST"
  | "LEVEL_MISMATCH"
  | "WAITING_LIST_FULL";

function isWriteConflict(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export class JoinWaitingList {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: WaitingListPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: JoinWaitingListInput): Promise<JoinWaitingListResult> {
    try {
      const entry = await this.prisma.$transaction(
        async (tx) => {
          const trainingClass = await tx.trainingClass.findUnique({
            where: { id: input.classId },
            include: { enrollments: true, waitingLists: true, level: true },
          });
          if (!trainingClass) {
            throw new NotFoundError("Class not found.");
          }

          const coachee = await tx.user.findUnique({
            where: { id: input.coacheeId },
            include: { level: true },
          });
          if (!coachee) {
            throw new NotFoundError("Coachee not found.");
          }
          if (coachee.role !== "COACHEE" || coachee.status !== "ACTIVE") {
            throw new ForbiddenError("Only an active Coachee can join the waiting list.");
          }

          const isAlreadyEnrolled = trainingClass.enrollments.some(
            (existing) => existing.coachee_id === input.coacheeId,
          );
          const isAlreadyOnWaitingList = trainingClass.waitingLists.some(
            (existing) => existing.coachee_id === input.coacheeId,
          );

          const verdict = this.policy.assertJoinEligible({
            classType: trainingClass.class_type,
            status: trainingClass.status,
            enrollmentCount: trainingClass.enrollments.length,
            capacity: WaitingListPolicy.GROUP_CAPACITY,
            waitingListCount: trainingClass.waitingLists.length,
            isAlreadyEnrolled,
            isAlreadyOnWaitingList,
            coacheeLevelSortOrder: coachee.level?.sort_order ?? null,
            classLevelSortOrder: trainingClass.level?.sort_order ?? null,
          });

          if (!verdict.ok) {
            throw this.mapVerdict(verdict.code);
          }

          const created = await tx.waitingList.create({
            data: {
              class_id: input.classId,
              coachee_id: input.coacheeId,
            },
          });

          await tx.notification.create({
            data: {
              notification_type: this.policy.notificationTypeForJoin(),
              recipient_id: input.coacheeId,
              class_id: input.classId,
              content: "You joined the waiting list for this class.",
            },
          });

          return created;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "waiting-list.join",
        resource: "WAITING_LIST",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return {
        id: entry.id,
        classId: entry.class_id,
        coacheeId: entry.coachee_id,
        joinedAt: entry.joined_at.toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError || isWriteConflict(error)) {
        await this.auditLogger.log({
          actorId: input.coacheeId,
          action: "waiting-list.join",
          resource: "WAITING_LIST",
          resourceId: input.classId,
          outcome: "DENIED",
        });
      }
      if (isWriteConflict(error)) {
        throw new ConflictError(
          "The waiting list filled up while you were joining. Please try again.",
          "WAITING_LIST_FULL",
        );
      }
      throw error;
    }
  }

  private mapVerdict(code: JoinVerdictCode): AppError {
    switch (code) {
      case "CANCELED_CLASS":
        return new ValidationError("This class has been canceled.");
      case "GROUP_NOT_FULL":
        return new ValidationError("The group class still has free spots.");
      case "SLOT_NOT_OCCUPIED":
        return new ValidationError("The individual slot is not occupied.");
      case "ALREADY_ENROLLED":
        return new ConflictError("You are already enrolled in this class.", "ALREADY_ENROLLED");
      case "ALREADY_ON_WAITING_LIST":
        return new ConflictError(
          "You are already on the waiting list for this class.",
          "ALREADY_ON_WAITING_LIST",
        );
      case "LEVEL_MISMATCH":
        return new ConflictError("This class level is out of your reach.", "LEVEL_MISMATCH");
      case "WAITING_LIST_FULL":
        return new ConflictError("The waiting list is full.", "WAITING_LIST_FULL");
    }
  }
}
