export interface Document {
  id: string;
  filename: string;
  originalName: string;
  title?: string;
  size: number;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface DocumentSearchResponse extends DocumentListResponse {
  // Inherits from DocumentListResponse
}

export interface UploadDocumentRequest {
  document: File;
  title?: string;
}

export interface UploadDocumentResponse {
  message: string;
  document: Document;
}

export interface UpdateDocumentRequest {
  title?: string;
  isActive?: boolean;
}

export interface UpdateDocumentResponse {
  message: string;
  document: Document;
} 