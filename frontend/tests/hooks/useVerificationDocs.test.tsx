/**
 * @jest-environment jsdom
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useUploadVerificationDoc,
  useVerificationDocs,
} from '@/hooks/useVerificationDocs';

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const getMyVerificationDocumentsMock = jest.fn();
const uploadVerificationDocumentMock = jest.fn();

jest.mock('@/lib/api/verification', () => ({
  getMyVerificationDocuments: (...args: unknown[]) =>
    getMyVerificationDocumentsMock(...args),
  uploadVerificationDocument: (...args: unknown[]) =>
    uploadVerificationDocumentMock(...args),
}));

const mockedUseAuthStore = require('@/store/authStore').useAuthStore as jest.Mock;

describe('useVerificationDocs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockReturnValue({
      accessToken: 'token-verification',
    });
  });

  function wrapperFactory() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it('carga documentos con useQuery', async () => {
    getMyVerificationDocumentsMock.mockResolvedValue([
      {
        id: 'doc-1',
        documentType: 'cedula',
        status: 'pending',
        originalFilename: 'cedula.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1000,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { result } = renderHook(() => useVerificationDocs(), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);
    expect(getMyVerificationDocumentsMock).toHaveBeenCalledWith('token-verification');
  });

  it('sube documento con useMutation', async () => {
    uploadVerificationDocumentMock.mockResolvedValue({
      message: 'ok',
      document: {
        id: 'doc-2',
      },
    });

    const file = new File(['%PDF-1.4'], 'cedula.pdf', {
      type: 'application/pdf',
    });
    const { result } = renderHook(() => useUploadVerificationDoc(), {
      wrapper: wrapperFactory(),
    });

    await result.current.mutateAsync({
      file,
      documentType: 'cedula',
    });

    expect(uploadVerificationDocumentMock).toHaveBeenCalledWith(
      file,
      'cedula',
      'token-verification'
    );
  });
});
