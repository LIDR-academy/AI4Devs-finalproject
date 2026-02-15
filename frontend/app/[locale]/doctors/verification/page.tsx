'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import UploadForm from '@/app/components/verification/UploadForm';
import { VerificationDocumentStatus } from '@/lib/api/verification';
import { useAuth } from '@/hooks/useAuth';
import {
  useUploadVerificationDoc,
  useVerificationDocs,
} from '@/hooks/useVerificationDocs';

function formatDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DoctorVerificationPage() {
  const t = useTranslations('doctorVerification');
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const docsQuery = useVerificationDocs();
  const uploadMutation = useUploadVerificationDoc();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'doctor') {
      router.push(`/${locale}/appointments`);
    }
  }, [isAuthenticated, loading, locale, router, user?.role]);

  if (loading || docsQuery.isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  const mapError = (error: Error): string => {
    switch (error.message) {
      case 'INVALID_FILE_TYPE':
        return t('errors.invalidType');
      case 'FILE_TOO_LARGE':
        return t('errors.fileTooLarge');
      case 'MALWARE_DETECTED':
        return t('errors.malwareDetected');
      default:
        return t('errors.generic');
    }
  };

  const renderStatusBadge = (status: VerificationDocumentStatus) => {
    const colorClass =
      status === 'approved'
        ? 'bg-green-100 text-green-700'
        : status === 'rejected'
          ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700';

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${colorClass}`}>
        {t(`status.${status}`)}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {uploadMutation.isError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {uploadMutation.error instanceof Error
            ? mapError(uploadMutation.error)
            : t('errors.generic')}
        </div>
      )}

      <UploadForm
        isUploading={uploadMutation.isPending}
        onSubmit={async ({ file, documentType }) => {
          setSuccessMessage(null);
          const response = await uploadMutation.mutateAsync({ file, documentType });
          setSuccessMessage(response.message || t('success'));
          await docsQuery.refetch();
        }}
      />

      <section className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('listTitle')}</h2>

        {docsQuery.isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
            {docsQuery.error instanceof Error
              ? docsQuery.error.message
              : t('errors.loadDocuments')}
          </div>
        ) : (docsQuery.data?.length || 0) === 0 ? (
          <div className="text-gray-600">{t('emptyList')}</div>
        ) : (
          <div className="space-y-2">
            {docsQuery.data?.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{doc.originalFilename}</p>
                  <p className="text-sm text-gray-600">
                    {t(`documentTypeOptions.${doc.documentType}`)} - {doc.mimeType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.createdAt, locale)} - {doc.fileSizeBytes} bytes
                  </p>
                </div>
                {renderStatusBadge(doc.status)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
