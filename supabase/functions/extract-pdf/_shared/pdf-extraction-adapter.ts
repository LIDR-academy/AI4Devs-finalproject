// Mirrors libs/services/src/pdf-extraction/pdf-extraction-adapter.ts — kept manually in sync
// (task-3 note). Plain types only; no Deno-specific globals.

export type ExtractedPageText = {
  page: number;
  text: string;
};

export type ExtractedImage = {
  page: number;
  positionIndex: number;
  bytes: Uint8Array;
  width: number;
  height: number;
  mimeType: string;
};

export type PdfExtractionAdapterResult = {
  pages: ExtractedPageText[];
  images: ExtractedImage[];
};

export type PdfExtractionAdapter = {
  extract(bytes: Uint8Array): Promise<PdfExtractionAdapterResult>;
};
