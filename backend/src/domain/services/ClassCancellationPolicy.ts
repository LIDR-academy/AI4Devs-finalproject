export type CancellationActorRole = "ADMIN" | "COACH" | "COACHEE";

export interface CancellationActor {
  id: string;
  role: CancellationActorRole;
}

export type CancellationScope = "single" | "series";

export interface ClassInstanceLike {
  id: string;
  status: "ACTIVE" | "CANCELED";
  start_time: Date;
  recurrence_series_id: string | null;
}

export interface CancellationSelection {
  targetIds: string[];
}

export class ClassCancellationPolicy {
  canCancel(actor: CancellationActor, assignedCoachId: string | null): boolean {
    return (
      actor.role === "ADMIN" ||
      (actor.role === "COACH" && assignedCoachId !== null && actor.id === assignedCoachId)
    );
  }

  selectInstancesToCancel(
    instances: ClassInstanceLike[],
    targetId: string,
    scope: CancellationScope,
    now: Date,
  ): CancellationSelection {
    const target = instances.find((trainingClass) => trainingClass.id === targetId);
    if (!target) {
      return { targetIds: [] };
    }

    const isEligible = (trainingClass: ClassInstanceLike): boolean =>
      trainingClass.status === "ACTIVE" && trainingClass.start_time >= now;

    let candidates: ClassInstanceLike[];
    if (scope === "single") {
      candidates = [target];
    } else {
      candidates = instances.filter(
        (trainingClass) =>
          trainingClass.recurrence_series_id === target.recurrence_series_id ||
          trainingClass.id === targetId,
      );
    }

    return { targetIds: candidates.filter(isEligible).map((trainingClass) => trainingClass.id) };
  }

  notificationTypeForCancellation(): number {
    return 7;
  }
}
