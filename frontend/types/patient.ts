export type Sex = "Hombre" | "Mujer" | "Otro";

export interface Patient {
  id: string;
  fullName: string;
  sex: Sex;
  dateOfBirth: string;
  email?: string | null;
}

export interface PatientCreateInput {
  fullName: string;
  sex: Sex;
  dateOfBirth: string;
}
