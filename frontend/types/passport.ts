import { ClinicalBaseline } from "@/types/clinicalBaseline";
import { MedicalEvent } from "@/types/medicalEvent";

export interface Passport {
  patientId: string;
  baseline: ClinicalBaseline[];
  timeline: MedicalEvent[];
}
