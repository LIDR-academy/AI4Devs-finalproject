export interface MedicalEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  clinicalSummary: string;
  originalNotes?: string | null;
  severity: "Alta" | "Media" | "Baja" | string;
  doctor?: string | null;
  medicalCenter?: string | null;
  department?: string | null;
  redFlag: boolean;
  alertJustification?: string | null;
}
