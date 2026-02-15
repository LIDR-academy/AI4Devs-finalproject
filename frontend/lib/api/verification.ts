'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

export type VerificationDocumentType = 'cedula' | 'diploma' | 'other';
export type VerificationDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationDocumentItem {
  id: string;
  documentType: VerificationDocumentType;
  status: VerificationDocumentStatus;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface UploadVerificationResponse {
  message: string;
  document: VerificationDocumentItem;
}

function mapApiError(message: string, code?: string): Error {
  if (code === 'INVALID_FILE_TYPE') {
    return new Error('INVALID_FILE_TYPE');
  }
  if (code === 'FILE_TOO_LARGE') {
    return new Error('FILE_TOO_LARGE');
  }
  if (code === 'MALWARE_DETECTED') {
    return new Error('MALWARE_DETECTED');
  }
  return new Error(message || 'UPLOAD_ERROR');
}

function validateFileClientSide(file: File): void {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('INVALID_FILE_TYPE');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
}

export async function getMyVerificationDocuments(
  token: string
): Promise<VerificationDocumentItem[]> {
  const response = await fetch(`${API_URL}/api/v1/doctors/verification`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const apiError = await response
      .json()
      .catch(() => ({ error: 'Error al obtener documentos' }));
    throw new Error(apiError.error || 'Error al obtener documentos');
  }

  const data = await response.json();
  return data.documents || [];
}

export async function uploadVerificationDocument(
  file: File,
  documentType: VerificationDocumentType,
  token: string
): Promise<UploadVerificationResponse> {
  validateFileClientSide(file);

  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const response = await fetch(`${API_URL}/api/v1/doctors/verification`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw mapApiError(data.error || 'Error al subir documento', data.code);
  }

  return data as UploadVerificationResponse;
}
