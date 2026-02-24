/**
 * Meditation Builder API Client
 * Based on OpenAPI specification
 */

import type {
  CompositionResponse,
  UpdateTextRequest,
  GenerateTextRequest,
  TextContentResponse,
  ImageReferenceResponse,
  SelectMusicRequest,
  SetImageRequest,
  OutputTypeResponse,
  MusicPreviewResponse,
  ImagePreviewResponse,
  ErrorResponse,
} from './types';
import { ApiError } from './types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * MVP User ID (hardcoded until US1 authentication is implemented)
 */
const MVP_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json().catch(() => ({
      error: 'UNKNOWN_ERROR',
      message: response.statusText || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    }));
    throw new ApiError(response.status, errorBody);
  }
  return response.json();
}

/**
 * Capability 1: Access Meditation Builder
 * Creates a new meditation composition with initial text
 */
export async function createComposition(request?: { text?: string }): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': MVP_USER_ID
    },
    body: JSON.stringify(request ?? { text: '' }),
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Get composition by ID
 */
export async function getComposition(compositionId: string): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}`, {
    headers: { 'X-User-Id': MVP_USER_ID },
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Capability 2: Define Meditation Text
 * Updates composition text, preserving it exactly as provided
 */
export async function updateText(
  compositionId: string,
  request: UpdateTextRequest
): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/text`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': MVP_USER_ID
    },
    body: JSON.stringify(request),
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Capability 3: AI Text Generation/Enhancement
 * Works with empty field, keywords, or existing content
 */
export async function generateText(
  compositionId: string,
  request?: GenerateTextRequest
): Promise<TextContentResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/text/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request ?? {}),
  });
  return handleResponse<TextContentResponse>(response);
}

/**
 * Capability 3 (global): AI Text Generation/Enhancement (no composition required)
 */
export async function generateTextGlobal(
  request?: GenerateTextRequest
): Promise<TextContentResponse> {
  const response = await fetch(`${BASE_URL}/compositions/text/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request ?? {}),
  });
  return handleResponse<TextContentResponse>(response);
}

/**
 * Capability 4: AI Image Generation
 * Generates AI image when no image is selected
 */
export async function generateImage(compositionId: string): Promise<ImageReferenceResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/image/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<ImageReferenceResponse>(response);
}

/**
 * Select music for composition
 */
export async function selectMusic(
  compositionId: string,
  request: SelectMusicRequest
): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/music`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Set image for composition (manual or AI-generated)
 */
export async function setImage(
  compositionId: string,
  request: SetImageRequest
): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/image`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Remove image from composition
 */
export async function removeImage(compositionId: string): Promise<CompositionResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/image`, {
    method: 'DELETE',
  });
  return handleResponse<CompositionResponse>(response);
}

/**
 * Capabilities 5 & 6: Determine Output Type
 * Returns PODCAST when no image, VIDEO when image present
 */
export async function getOutputType(compositionId: string): Promise<OutputTypeResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/output-type`);
  return handleResponse<OutputTypeResponse>(response);
}

/**
 * Capability 7: Preview Selected Music
 */
export async function previewMusic(compositionId: string): Promise<MusicPreviewResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/preview/music`);
  return handleResponse<MusicPreviewResponse>(response);
}

/**
 * Capability 8: Preview Image
 */
export async function previewImage(compositionId: string): Promise<ImagePreviewResponse> {
  const response = await fetch(`${BASE_URL}/compositions/${compositionId}/preview/image`);
  return handleResponse<ImagePreviewResponse>(response);
}
