'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyVerificationDocuments,
  uploadVerificationDocument,
  VerificationDocumentType,
} from '@/lib/api/verification';
import { useAuthStore } from '@/store/authStore';

export function useVerificationDocs() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['doctor-verification-documents'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getMyVerificationDocuments(accessToken);
    },
    enabled: !!accessToken,
  });
}

export function useUploadVerificationDoc() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      documentType,
    }: {
      file: File;
      documentType: VerificationDocumentType;
    }) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return uploadVerificationDocument(file, documentType, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['doctor-verification-documents'],
      });
    },
  });
}
