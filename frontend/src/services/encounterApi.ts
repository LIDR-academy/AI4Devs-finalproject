import { apiFetch } from "./apiClient";
import type { Encounter } from "../types/encounter";
import type { ClinicalEvent } from "../types/event";

export type EncounterInput = {
  patientId: string;
  date?: string | null;
  type?: string | null;
  noteText: string;
};

export const encounterApi = {
  create: (input: EncounterInput) =>
    apiFetch<Encounter>("/encounters", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  extractEvents: (encounterId: string) =>
    apiFetch<ClinicalEvent[]>(`/encounters/${encounterId}/extract-events`, {
      method: "POST",
    }),
};
