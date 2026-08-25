import { Prisma, type PrismaClient } from "@prisma/client";
import { WaitingListPolicy } from "../../domain/services/WaitingListPolicy.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface ClaimWaitingListSpotInput {
  classId: string;
  coacheeId: string;
}

export interface ClaimWaitingListSpotResult {
  message: string;
  enrollmentId: string;
  classId: string;
  coacheeId: string;
  joinedAt: string;
}

function isWriteConflict(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export class ClaimWaitingListSpot {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: ClaimWaitingListSpotInput): Promise<ClaimWaitingListSpotResult> {
    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const trainingClass = await tx.trainingClass.findUnique({
            where: { id: input.classId },
            include: { enrollments: true, waitingLists: true },
          });
          if (!trainingClass) {
            throw new NotFoundError("Class not found.");
          }

          if (trainingClass.status !== "ACTIVE") {
            throw new ValidationError("This class has been canceled.");
          }

          const waitingListEntry = await tx.waitingList.findUnique({
            where: {
              class_id_coachee_id: {
                class_id: input.classId,
                coachee_id: input.coacheeId,
              },
            },
          });
          if (!waitingListEntry) {
            throw new ConflictError(
              "You are not on the waiting list for this class.",
              "NOT_ON_WAITING_LIST",
            );
          }

          const isAlreadyEnrolled = trainingClass.enrollments.some(
            (e) => e.coachee_id === input.coacheeId,
          );
          if (isAlreadyEnrolled) {
            throw new ConflictError("You are already enrolled in this class.", "ALREADY_ENROLLED");
          }

          if (trainingClass.enrollments.length >= WaitingListPolicy.GROUP_CAPACITY) {
            throw new ConflictError(
              "This spot has already been claimed by another Coachee.",
              "SPOT_TAKEN",
            );
          }

          // Create enrollment
          const enrollment = await tx.classEnrollment.create({
            data: {
              class_id: input.classId,
              coachee_id: input.coacheeId,
            },
          });

          // Remove waiting list entry
          await tx.waitingList.delete({
            where: { id: waitingListEntry.id },
          });

          // Notification #9 to claiming coachee
          await tx.notification.create({
            data: {
              notification_type: 9,
              recipient_id: input.coacheeId,
              class_id: input.classId,
              content: "You joined this class from the waiting list.",
            },
          });

          // Notification #6 to coach
          await tx.notification.create({
            data: {
              notification_type: 6,
              recipient_id: trainingClass.assigned_coach_id,
              class_id: input.classId,
              content: "A waitlisted Coachee has claimed the spot in this class.",
            },
          });

          return enrollment;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "waiting-list.claim-spot",
        resource: "CLASS_ENROLLMENT",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return {
        message: "You joined this class from the waiting list.",
        enrollmentId: result.id,
        classId: result.class_id,
        coacheeId: result.coachee_id,
        joinedAt: result.joined_at.toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError || isWriteConflict(error)) {
        await this.auditLogger.log({
          actorId: input.coacheeId,
          action: "waiting-list.claim-spot",
          resource: "CLASS_ENROLLMENT",
          resourceId: input.classId,
          outcome: "DENIED",
        });
      }
      if (isWriteConflict(error)) {
        throw new ConflictError(
          "This spot has already been claimed by another Coachee. Please try again.",
          "SPOT_TAKEN",
        );
      }
      throw error;
    }
  }
}
