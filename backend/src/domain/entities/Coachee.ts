export type ClassTypePreference = "INDIVIDUAL" | "GROUP" | "BOTH" | null;
export type CoacheeStatus = "ACTIVE" | "INACTIVE";

export interface CreateCoacheeData {
  name: string;
  email: string;
  phone: string;
  classTypePreference?: ClassTypePreference;
  levelId?: string | null;
  additionalInfo?: string | null;
}

export interface UpdateCoacheeData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  classTypePreference?: ClassTypePreference;
  additionalInfo?: string | null;
}

export class Coachee {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly classTypePreference: ClassTypePreference,
    public readonly status: CoacheeStatus,
    public readonly levelId: string | null,
    public readonly additionalInfo: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
