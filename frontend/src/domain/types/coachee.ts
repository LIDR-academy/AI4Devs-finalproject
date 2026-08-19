export interface Coachee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classTypePreference: string | null;
  status: string;
  level: { id: string } | null;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CoacheeFormData {
  name: string;
  email: string;
  phone: string;
  classTypePreference: string;
  levelId: string;
}

export interface CoacheeFilters {
  status?: string;
  levelId?: string;
  page: number;
  limit: number;
}

export interface Level {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface CoacheeCoachRef {
  id: string;
  name: string;
}

export interface CoacheeLevelRef {
  id: string;
  name: string;
  color: string;
}

export interface CoacheeNextClass {
  id: string;
  classType: "INDIVIDUAL" | "GROUP";
  startTime: string;
  assignedCoach: CoacheeCoachRef;
  level: CoacheeLevelRef | null;
  status: "ACTIVE";
}

export interface CoacheeJoinableClass {
  id: string;
  classType: "GROUP";
  startTime: string;
  level: CoacheeLevelRef;
  assignedCoach: CoacheeCoachRef;
  enrollmentCount: number;
  capacity: number;
  isWithinReach: boolean;
  hasOpenSpots: boolean;
}

export interface CoacheeWaitlistEligibleClass {
  id: string;
  classType: "GROUP";
  startTime: string;
  level: CoacheeLevelRef;
  assignedCoach: CoacheeCoachRef;
  enrollmentCount: number;
  capacity: number;
  isWithinReach: boolean;
  isOnWaitingList: boolean;
}

export interface CoacheeDashboard {
  nextClass: CoacheeNextClass | null;
  joinableClasses: CoacheeJoinableClass[];
  waitlistEligibleClasses: CoacheeWaitlistEligibleClass[];
  activeWaitingListCount: number;
}
