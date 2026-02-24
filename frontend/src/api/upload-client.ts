/**
 * Upload file to S3 via backend API
 */
export interface UploadFileResponse {
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
}

/**
 * Upload an image file to S3/LocalStack
 */
export async function uploadImage(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/v1/generation/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload a music/audio file to S3/LocalStack
 */
export async function uploadMusic(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/v1/generation/upload/music', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload music: ${response.statusText}`);
  }

  return response.json();
}
