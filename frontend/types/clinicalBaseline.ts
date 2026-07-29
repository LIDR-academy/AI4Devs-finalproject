export interface ClinicalBaseline {
  id: string;
  type: string;
  concept: string;
  startDate?: string | null;
  details?: string | null;
}
