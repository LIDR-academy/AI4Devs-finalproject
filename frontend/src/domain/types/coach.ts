export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialities: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CoachFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialities: string;
  bankAccount: string;
  ssn: string;
  dni: string;
}

export interface CoachUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  specialities?: string;
}

export interface AssignableCoach {
  id: string;
  name: string;
}

export interface CoachFinancialData {
  id: string;
  name: string;
  bankAccount: string;
  ssn: string;
  dni: string;
}
