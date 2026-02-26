/**
 * Upload Service - API Layer
 * Handles communication with backend upload endpoints
 * Separated from UI components for better testability and reusability
 */

import axios from 'axios';
import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  UploadProgress,
} from '../types/upload';
import type { PartDetail } from '../types/parts';

/**
 * API endpoint for requesting presigned upload URLs
 */
const UPLOAD_URL_ENDPOINT = '/api/upload/url';

/**
 * API endpoint for confirming a completed upload
 */
const CONFIRM_UPLOAD_ENDPOINT = '/api/upload/confirm';

/**
 * API endpoint for fetching part details
 */
const PART_DETAIL_ENDPOINT = '/api/parts';

/**
 * Content type for .3dm Rhino files
 */
const RHINO_CONTENT_TYPE = 'application/x-rhino';

/**
 * Request a presigned URL from the backend for uploading a file
 * 
 * @param filename - Name of the file to upload
 * @param size - Size of the file in bytes
 * @param checksum - Optional checksum for file validation
 * @returns Promise resolving to presigned URL and file metadata
 * 
 * @throws {Error} If backend request fails or returns invalid response
 * 
 * @example
 * ```typescript
 * const { upload_url, file_id } = await getPresignedUrl('model.3dm', 1024000);
 * console.log(`File will be uploaded as: ${file_id}`);
 * ```
 */
export async function getPresignedUrl(
  filename: string,
  size: number,
  checksum?: string
): Promise<PresignedUrlResponse> {
  const payload: PresignedUrlRequest = {
    filename,
    size,
    checksum,
  };

  const response = await axios.post<PresignedUrlResponse>(
    UPLOAD_URL_ENDPOINT,
    payload
  );

  return response.data;
}

/**
 * Upload a file to cloud storage using a presigned URL
 * 
 * @param presignedUrl - The S3 presigned URL obtained from backend
 * @param file - The File object to upload
 * @param onProgress - Optional callback for tracking upload progress
 * 
 * @throws {Error} If upload to storage fails
 * 
 * @example
 * ```typescript
 * await uploadToStorage(
 *   'https://s3.amazonaws.com/...',
 *   fileObject,
 *   (progress) => console.log(`${progress.percentage}% uploaded`)
 * );
 * ```
 */
export async function uploadToStorage(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': RHINO_CONTENT_TYPE,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress: UploadProgress = {
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        };
        onProgress(progress);
      }
    },
  });
}

/**
 * Confirm a completed upload with the backend
 *
 * @param fileId - UUID returned from getPresignedUrl
 * @param fileKey - Storage path where file was uploaded
 * @returns Promise resolving to confirmation response
 *
 * @throws {Error} If backend confirmation fails
 */
export async function confirmUpload(
  fileId: string,
  fileKey: string
): Promise<ConfirmUploadResponse> {
  const payload: ConfirmUploadRequest = {
    file_id: fileId,
    file_key: fileKey,
  };

  const response = await axios.post<ConfirmUploadResponse>(
    CONFIRM_UPLOAD_ENDPOINT,
    payload
  );

  return response.data;
}

/**
 * Complete upload flow: request presigned URL and upload file
 * This is a convenience function that combines both steps
 * 
 * @param file - The File object to upload
 * @param onProgress - Optional callback for tracking upload progress
 * @returns Promise resolving to the file_id assigned by backend
 * 
 * @throws {Error} If either step fails
 * 
 * @example
 * ```typescript
 * const fileId = await uploadFile(
 *   fileObject,
 *   (progress) => setUploadProgress(progress.percentage)
 * );
 * console.log(`File uploaded with ID: ${fileId}`);
 * ```
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  // Step 1: Get presigned URL
  const { upload_url, file_id } = await getPresignedUrl(file.name, file.size);

  // Step 2: Upload to storage
  await uploadToStorage(upload_url, file, onProgress);

  return file_id;
}

/**
 * Fetch detailed part information including low_poly_url
 * 
 * T-1002-BACK / T-1005-FRONT: Get Part Detail API
 * Used by ModelLoader component to fetch part data before loading GLB
 * 
 * @param partId - Part UUID
 * @returns Promise resolving to PartDetail with presigned CDN URL
 * @throws {Error} If part not found (404) or access denied (403)
 * 
 * @example
 * ```typescript
 * const partData = await getPartDetail('550e8400-e29b-41d4-a716-446655440000');
 * console.log(`ISO Code: ${partData.iso_code}`);
 * if (partData.low_poly_url) {
 *   console.log(`GLB URL: ${partData.low_poly_url}`);
 * }
 * ```
 */
export async function getPartDetail(partId: string): Promise<PartDetail> {
  try {
    const response = await axios.get<PartDetail>(
      `${PART_DETAIL_ENDPOINT}/${partId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // X-Workshop-Id header added by middleware from JWT claims
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Pieza no encontrada (ID: ${partId})`);
      } else if (error.response?.status === 403) {
        throw new Error('Acceso denegado: no tienes permisos para ver esta pieza');
      } else {
        const status = error.response?.status || 'unknown';
        const statusText = error.response?.statusText || 'Unknown error';
        throw new Error(`Error ${status}: ${statusText}`);
      }
    }
    throw error;
  }
}
