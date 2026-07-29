import { apiFetch } from "./apiClient";
import type { ClinicalEvent } from "../types/event";

export type Timeline = {
  patientId: string;
  events: ClinicalEvent[];
  context: string;
};

export const timelineApi = {
  getByPatientId: (patientId: string) =>
    apiFetch<Timeline>(`/patients/${patientId}/timeline`),
};
