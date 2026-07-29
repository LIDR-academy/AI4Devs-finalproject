export type ClinicalEvent = {
  id: string;
  encounterId: string;
  patientId: string;
  category: string;
  title: string;
  description: string;
  eventDate: string | null;
  sourceQuote: string;
  confidence: number;
  extractionSource: string;
};
