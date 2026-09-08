import { Prisma, type PrismaClient } from "@prisma/client";
import type { EnrollmentPolicy } from "../../domain/services/EnrollmentPolicy.js";
import { hasOverlap } from "../../domain/services/OverlapChecker.js";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface JoinTrainingClassInput {
  classId: string;
  coacheeId: string;
}

export interface JoinTrainingClassResult {
  id: string;
  classId: string;
  coacheeId: string;
  joinedAt: string;
}

type JoinVerdictCode =
  | "CANCELED_CLASS"
  | "INDIVIDUAL_CLASS"
  | "ALREADY_ENROLLED"
  | "LEVEL_MISMATCH"
  | "OVERLAP_DETECTED"
  | "CLASS_FULL";

function isWriteConflict(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export class JoinTrainingClass {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: EnrollmentPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: JoinTrainingClassInput): Promise<JoinTrainingClassResult> {
    try {
      const enrollment = await this.prisma.$transaction(
        async (tx) => {
          const trainingClass = await tx.trainingClass.findUnique({
            where: { id: input.classId },
            include: { enrollments: true, level: true },
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
            throw new ForbiddenError("Only an active Coachee can enroll.");
          }

          const isAlreadyEnrolled = trainingClass.enrollments.some(
            (existing) => existing.coachee_id === input.coacheeId,
          );

          const overlapsExisting = await this.hasOverlappingClass(
            tx,
            input.classId,
            input.coacheeId,
            trainingClass.start_time,
            trainingClass.duration_minutes,
          );

          const verdict = this.policy.assertGroupJoinEligible({
            classType: trainingClass.class_type,
            status: trainingClass.status,
            isAlreadyEnrolled,
            coacheeLevelSortOrder: coachee.level?.sort_order ?? null,
            classLevelSortOrder: trainingClass.level?.sort_order ?? null,
            overlapsExisting,
            enrollmentCount: trainingClass.enrollments.length,
          });

          if (!verdict.ok) {
            throw this.mapVerdict(verdict.code);
          }

          return tx.classEnrollment.create({
            data: { class_id: input.classId, coachee_id: input.coacheeId },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      await this.auditLogger.log({
        actorId: input.coacheeId,
        action: "class.enroll",
        resource: "CLASS_ENROLLMENT",
        resourceId: input.classId,
        outcome: "SUCCESS",
      });

      return {
        id: enrollment.id,
        classId: enrollment.class_id,
        coacheeId: enrollment.coachee_id,
        joinedAt: enrollment.joined_at.toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError || isWriteConflict(error)) {
        await this.auditLogger.log({
          actorId: input.coacheeId,
          action: "class.enroll",
          resource: "CLASS_ENROLLMENT",
          resourceId: input.classId,
          outcome: "DENIED",
        });
      }
      if (isWriteConflict(error)) {
        throw new ConflictError(
          "The class filled up while you were joining. Please try again.",
          "CLASS_FULL",
        );
      }
      throw error;
    }
  }

  private async hasOverlappingClass(
    tx: Prisma.TransactionClient,
    classId: string,
    coacheeId: string,
    startTime: Date,
    durationMinutes: number,
  ): Promise<boolean> {
    const classesWithCoachee = await tx.trainingClass.findMany({
      where: {
        id: { not: classId },
        status: "ACTIVE",
        enrollments: { some: { coachee_id: coacheeId } },
      },
    });
    const target = {
      start: startTime,
      end: new Date(startTime.getTime() + durationMinutes * 60 * 1000),
    };
    const intervals = classesWithCoachee.map((trainingClass) => ({
      start: trainingClass.start_time,
      end: new Date(
        trainingClass.start_time.getTime() + trainingClass.duration_minutes * 60 * 1000,
      ),
    }));
    return hasOverlap(intervals, target);
  }

  private mapVerdict(code: JoinVerdictCode): AppError {
    switch (code) {
      case "CANCELED_CLASS":
        return new ValidationError("This class has been canceled.");
      case "INDIVIDUAL_CLASS":
        return new ValidationError("Coachees cannot self-enroll in individual classes.");
      case "ALREADY_ENROLLED":
        return new ConflictError("You are already enrolled in this class.", "ALREADY_ENROLLED");
      case "LEVEL_MISMATCH":
        return new ConflictError("This class level is out of your reach.", "LEVEL_MISMATCH");
      case "OVERLAP_DETECTED":
        return new ConflictError("You already have a class at this time.", "OVERLAP_DETECTED");
      case "CLASS_FULL":
        return new ConflictError("This class is full.", "CLASS_FULL");
    }
  }
}
