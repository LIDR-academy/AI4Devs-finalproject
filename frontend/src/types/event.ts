export type ClinicalEvent = {
  id: string;
  encounterId: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  sourceQuote: string;
};
