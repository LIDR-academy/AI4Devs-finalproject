'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useApproveDoctorVerification,
  useDoctorDocuments,
  useRejectDoctorVerification,
  useSignedVerificationUrl,
} from '@/hooks/admin/useVerificationList';

interface VerificationItem {
  doctorId: string;
  fullName: string;
  email: string;
  specialty: string;
  verificationStatus: string;
  createdAt: string;
}

interface VerificationTableProps {
  items: VerificationItem[];
}

export default function VerificationTable({ items }: VerificationTableProps) {
  const t = useTranslations('adminDashboard');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const docsQuery = useDoctorDocuments(selectedDoctorId);
  const signedUrlMutation = useSignedVerificationUrl();
  const approveMutation = useApproveDoctorVerification();
  const rejectMutation = useRejectDoctorVerification();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t('verification.title')}</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">{t('verification.columns.name')}</th>
              <th className="py-2 pr-3">{t('verification.columns.email')}</th>
              <th className="py-2 pr-3">{t('verification.columns.specialty')}</th>
              <th className="py-2 pr-3">{t('verification.columns.status')}</th>
              <th className="py-2 pr-3">{t('verification.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.doctorId} className="border-b">
                <td className="py-2 pr-3">{item.fullName}</td>
                <td className="py-2 pr-3">{item.email}</td>
                <td className="py-2 pr-3">{item.specialty}</td>
                <td className="py-2 pr-3">{item.verificationStatus}</td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => setSelectedDoctorId(item.doctorId)}
                    >
                      {t('verification.actions.viewDocs')}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      onClick={() => approveMutation.mutate({ doctorId: item.doctorId })}
                    >
                      {t('verification.actions.approve')}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => {
                        const notes = window.prompt(t('verification.actions.rejectPrompt'));
                        if (notes) {
                          rejectMutation.mutate({ doctorId: item.doctorId, notes });
                        }
                      }}
                    >
                      {t('verification.actions.reject')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDoctorId && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <p className="font-medium mb-2">{t('verification.documentsTitle')}</p>
          {docsQuery.isLoading ? (
            <p>{t('common.loading')}</p>
          ) : (
            <ul className="space-y-2">
              {(docsQuery.data?.documents || []).map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-2">
                  <span>{doc.originalFilename}</span>
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    onClick={async () => {
                      const data = await signedUrlMutation.mutateAsync(doc.id);
                      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {t('verification.actions.openSignedUrl')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
