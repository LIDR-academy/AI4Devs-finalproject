/**
 * Meditation Builder API Types
 * Auto-generated from OpenAPI specification
 */

// Enums
export type OutputType = 'PODCAST' | 'VIDEO';

// Request Types
export interface UpdateTextRequest {
  text: string;
}

export interface GenerateTextRequest {
  existingText?: string | null;
  context?: string | null;
}

export interface SelectMusicRequest {
  musicReference: string;
}

export interface SetImageRequest {
  imageReference: string;
}

// Response Types
export interface CompositionResponse {
  id: string;
  textContent: string;
  musicReference?: string | null;
  imageReference?: string | null;
  outputType: OutputType;
  createdAt: string;
  updatedAt: string;
}

export interface TextContentResponse {
  text: string;
}

export interface ImageReferenceResponse {
  imageReference: string;
}

export interface OutputTypeResponse {
  outputType: OutputType;
}

export interface MusicPreviewResponse {
  previewUrl: string;
  musicReference: string;
}

export interface ImagePreviewResponse {
  previewUrl: string;
  imageReference: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  details?: Record<string, unknown> | null;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public errorResponse: ErrorResponse
  ) {
    super(errorResponse.message);
    this.name = 'ApiError';
  }
}
