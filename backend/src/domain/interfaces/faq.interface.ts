export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
  chunks?: FAQChunk[];
}

export interface FAQChunk {
  id: string;
  content: string;
  embedding: number[];
  faqId: string;
  createdAt: Date;
  updatedAt: Date;
} 