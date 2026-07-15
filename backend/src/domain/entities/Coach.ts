export type CoachStatus = "ACTIVE" | "INACTIVE";

export interface CreateCoachData {
  name: string;
  email: string;
  phone?: string | null;
  specialities?: string | null;
  bankAccount: string;
  ssn: string;
  dni: string;
}

export interface UpdateCoachData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  specialities?: string | null;
}

export class Coach {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly specialities: string | null,
    public readonly status: CoachStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export interface CoachFinancialData {
  id: string;
  name: string;
  bankAccount: string;
  ssn: string;
  dni: string;
}
