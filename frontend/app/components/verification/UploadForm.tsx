'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { VerificationDocumentType } from '@/lib/api/verification';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);

interface UploadFormProps {
  isUploading: boolean;
  onSubmit: (input: {
    file: File;
    documentType: VerificationDocumentType;
  }) => Promise<void>;
}

export default function UploadForm({ isUploading, onSubmit }: UploadFormProps) {
  const t = useTranslations('doctorVerification');
  const [documentType, setDocumentType] = useState<VerificationDocumentType>('cedula');
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (selectedFile: File): string | null => {
    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return t('errors.invalidType');
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      return t('errors.fileTooLarge');
    }

    return null;
  };

  const handleFileChange = (nextFile: File | null) => {
    setValidationError(null);
    if (!nextFile) {
      setFile(null);
      return;
    }

    const error = validateFile(nextFile);
    if (error) {
      setValidationError(error);
      setFile(null);
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!file) {
      setValidationError(t('errors.missingFile'));
      return;
    }

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    await onSubmit({ file, documentType });
    setFile(null);
    const input = document.getElementById(
      'verification-document-input'
    ) as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">{t('uploadTitle')}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            {t('documentTypeLabel')}
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value as VerificationDocumentType)
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            disabled={isUploading}
          >
            <option value="cedula">{t('documentTypeOptions.cedula')}</option>
            <option value="diploma">{t('documentTypeOptions.diploma')}</option>
            <option value="other">{t('documentTypeOptions.other')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="verification-document-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('fileLabel')}
          </label>
          <input
            id="verification-document-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            disabled={isUploading}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">{t('fileHint')}</p>

      {validationError && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm">
          {validationError}
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isUploading ? t('uploading') : t('uploadButton')}
      </button>
    </form>
  );
}
