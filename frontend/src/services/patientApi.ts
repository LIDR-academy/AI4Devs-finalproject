import { apiFetch } from "./apiClient";
import type { Patient } from "../types/patient";

export type PatientInput = {
  name: string;
  birthDate?: string | null;
  sex?: string | null;
};

export const patientApi = {
  list: () => apiFetch<Patient[]>("/patients"),

  create: (input: PatientInput) =>
    apiFetch<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
