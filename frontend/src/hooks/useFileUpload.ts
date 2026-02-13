import { useMutation } from '@tanstack/react-query';
import { uploadImage, uploadMusic, UploadFileResponse } from '../api/upload-client';

/**
 * Hook for uploading image files to S3
 */
export function useUploadImage() {
  return useMutation<UploadFileResponse, Error, File>({
    mutationFn: (file: File) => uploadImage(file),
    onSuccess: (data) => {
      console.log('Image uploaded successfully:', data.fileUrl);
    },
    onError: (error) => {
      console.error('Failed to upload image:', error);
    },
  });
}

/**
 * Hook for uploading music files to S3
 */
export function useUploadMusic() {
  return useMutation<UploadFileResponse, Error, File>({
    mutationFn: (file: File) => uploadMusic(file),
    onSuccess: (data) => {
      console.log('Music uploaded successfully:', data.fileUrl);
    },
    onError: (error) => {
      console.error('Failed to upload music:', error);
    },
  });
}
