export type BlockRole = "ADMIN" | "COACH" | "COACHEE";

export type BlockTypeValue = "PERSONAL" | "GYM_WIDE";

export interface BlockPolicyLike {
  block_type: BlockTypeValue;
  created_by: string;
}

export type BlockWindowValidation = { valid: true } | { valid: false; reason: string };

export class BlockPolicy {
  validBlockWindow(start: Date, end: Date, now: Date): BlockWindowValidation {
    if (start.getUTCMinutes() !== 0 || start.getUTCSeconds() !== 0) {
      return { valid: false, reason: "HOUR_ALIGNED" };
    }

    if (start.getTime() >= end.getTime()) {
      return { valid: false, reason: "RANGE" };
    }

    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    if (durationMinutes < 60) {
      return { valid: false, reason: "MIN_DURATION" };
    }

    if (end.getUTCMinutes() !== 0 || end.getUTCSeconds() !== 0) {
      return { valid: false, reason: "HOUR_ALIGNED" };
    }

    if (start.getTime() < now.getTime()) {
      return { valid: false, reason: "PAST_START" };
    }

    return { valid: true };
  }

  canCreatePersonal(actorRole: BlockRole, actorId: string, targetCoachId: string): boolean {
    if (actorRole === "ADMIN") {
      return true;
    }
    return actorRole === "COACH" && actorId === targetCoachId;
  }

  canCreateGymWide(actorRole: BlockRole): boolean {
    return actorRole === "ADMIN";
  }

  canCancel(actorRole: BlockRole, actorId: string, block: BlockPolicyLike): boolean {
    if (actorRole === "ADMIN") {
      return true;
    }
    return actorRole === "COACH" && block.block_type === "PERSONAL" && block.created_by === actorId;
  }
}
