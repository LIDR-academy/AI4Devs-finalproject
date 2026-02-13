/**
 * Meditation Builder - Generation API Client
 * Wrapper around auto-generated OpenAPI client
 * 
 * Bounded Context: Generation (US3 - Generate Meditation Audio/Video)
 * 
 * Core capability:
 * - Generate meditation content with professional narration and synchronized subtitles
 * - Supports both video (with image) and audio (podcast) output
 */

import {
  GenerationApi,
  Configuration,
  type GenerateMeditationRequest,
  type GenerationResponse,
  type ErrorResponse,
} from './generated/generation/src';

/**
 * API Error wrapper for consistency with existing client
 */
export class GenerationApiError extends Error {
  constructor(
    public status: number,
    public errorResponse: ErrorResponse
  ) {
    super(errorResponse.message || 'Unknown error');
    this.name = 'GenerationApiError';
  }
}

/**
 * Configuration for Generation API client
 * Uses relative path to work with Vite proxy
 */
const generationApiConfig = new Configuration({
  basePath: '/api/v1',
  // JWT token will be added here when authentication is implemented (blocked by US1)
  // accessToken: () => getAuthToken(),
});

const generationApi = new GenerationApi(generationApiConfig);

/**
 * Generate meditation content with narration and subtitles
 * 
 * @param request - Generation request with text, music, and optional image
 * @returns Generation response with URLs and metadata
 * @throws GenerationApiError on failure
 * 
 * Maps to BDD scenarios:
 * - Scenario 1: "Generate narrated video with synchronized subtitles" (with imageReference)
 * - Scenario 2: "Generate narrated podcast" (without imageReference)
 * - Scenario 3: "Processing time exceeded" (408 timeout)
 * 
 * Example:
 * ```ts
 * const response = await generateMeditationContent({
 *   text: "Breathe deeply...",
 *   musicReference: "music-123",
 *   imageReference: "image-456" // Optional - omit for audio
 * });
 * 
 * if (response.status === 'SUCCESS') {
 *   console.log('Video URL:', response.mediaUrl);
 *   console.log('Subtitles:', response.subtitleUrl);
 * }
 * ```
 */
export async function generateMeditationContent(
  request: GenerateMeditationRequest
): Promise<GenerationResponse> {
  try {
    const response = await generationApi.generateMeditationContent({
      generateMeditationRequest: request,
    });
    return response;
  } catch (error: any) {
    // Convert fetch errors to consistent API error format
    if (error.response) {
      const errorBody: ErrorResponse = await error.response.json().catch(() => ({
        error: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      }));
      throw new GenerationApiError(error.response.status, errorBody);
    }
    // Re-throw network or other errors
    throw error;
  }
}

/**
 * Re-export types for convenience
 */
export type {
  GenerateMeditationRequest,
  GenerationResponse,
  ErrorResponse,
} from './generated/generation/src';

export {
  GenerationStatus,
  MediaType,
} from './generated/generation/src';
