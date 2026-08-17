export type ClassType = "INDIVIDUAL" | "GROUP";

export const MAX_INDIVIDUAL_CLASSES_PER_SLOT = 2;
export const MAX_GROUP_CLASSES_PER_SLOT = 1;

export const INDIVIDUAL_CLASS_COACHEES = 1;
export const GROUP_MIN_COACHEES = 3;
export const GROUP_MAX_COACHEES = 4;

export interface GymSlotUsage {
  individualCount: number;
  groupCount: number;
}

export function validateClassSize(classType: ClassType, coacheeCount: number): boolean {
  if (classType === "INDIVIDUAL") {
    return coacheeCount === INDIVIDUAL_CLASS_COACHEES;
  }
  return coacheeCount >= GROUP_MIN_COACHEES && coacheeCount <= GROUP_MAX_COACHEES;
}

export function canAddToGymSlot(usage: GymSlotUsage, classType: ClassType): boolean {
  if (classType === "INDIVIDUAL") {
    return usage.individualCount + 1 <= MAX_INDIVIDUAL_CLASSES_PER_SLOT;
  }
  return usage.groupCount + 1 <= MAX_GROUP_CLASSES_PER_SLOT;
}
