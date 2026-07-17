export type UploadPdfParams = {
  userId: string;
  documentId: string;
  bytes: Uint8Array;
};

export type InsertDocumentParams = {
  documentId: string;
  userId: string;
  filename: string;
  sizeBytes: number;
};
