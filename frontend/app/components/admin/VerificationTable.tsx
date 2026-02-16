'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useApproveDoctorVerification,
  useDoctorDocuments,
  useRejectDoctorVerification,
  useSignedVerificationUrl,
} from '@/hooks/admin/useVerificationList';
import ActionModal from '@/app/components/ui/ActionModal';

interface VerificationItem {
  doctorId: string;
  fullName: string;
  email: string;
  specialty: string;
  verificationStatus: string;
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  createdAt: string;
}

interface VerificationTableProps {
  items: VerificationItem[];
}

export default function VerificationTable({ items }: VerificationTableProps) {
  const t = useTranslations('adminDashboard');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [modalDoctorId, setModalDoctorId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const docsQuery = useDoctorDocuments(selectedDoctorId);
  const signedUrlMutation = useSignedVerificationUrl();
  const approveMutation = useApproveDoctorVerification();
  const rejectMutation = useRejectDoctorVerification();

  const closeModal = () => {
    setModalAction(null);
    setModalDoctorId(null);
    setNotes('');
  };

  const getStatusBadgeClasses = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-800';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return t('verification.status.approved');
    if (status === 'rejected') return t('verification.status.rejected');
    return t('verification.status.pending');
  };

  const getStatusHint = (item: VerificationItem) => {
    if (item.verificationStatus === 'pending' && item.pendingDocuments > 0) {
      return t('verification.statusHints.pendingDocuments', {
        pending: item.pendingDocuments,
      });
    }
    if (item.verificationStatus === 'pending' && item.rejectedDocuments > 0) {
      return t('verification.statusHints.rejectedDocuments', {
        rejected: item.rejectedDocuments,
      });
    }
    if (item.verificationStatus === 'approved') {
      return t('verification.statusHints.allDocumentsApproved');
    }
    if (item.verificationStatus === 'rejected') {
      return t('verification.statusHints.doctorRejected');
    }
    return '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="admin-verification-table">
      <h3 className="text-lg font-semibold mb-4">{t('verification.title')}</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm" aria-label={t('verification.title')}>
          <caption className="sr-only">{t('verification.tableCaption')}</caption>
          <thead>
            <tr className="text-left border-b">
              <th scope="col" className="py-2 pr-3">{t('verification.columns.name')}</th>
              <th scope="col" className="py-2 pr-3">{t('verification.columns.email')}</th>
              <th scope="col" className="py-2 pr-3">{t('verification.columns.specialty')}</th>
              <th scope="col" className="py-2 pr-3">{t('verification.columns.status')}</th>
              <th scope="col" className="py-2 pr-3">{t('verification.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.doctorId} className="border-b" data-testid={`admin-verification-row-${item.doctorId}`}>
                <td className="py-2 pr-3">{item.fullName}</td>
                <td className="py-2 pr-3">{item.email}</td>
                <td className="py-2 pr-3">{item.specialty}</td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(item.verificationStatus)}`}
                    >
                      {getStatusLabel(item.verificationStatus)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t('verification.documentsSummary', {
                        approved: item.approvedDocuments,
                        pending: item.pendingDocuments,
                        rejected: item.rejectedDocuments,
                        total: item.totalDocuments,
                      })}
                    </span>
                    {getStatusHint(item) && (
                      <span className="text-xs text-slate-500">{getStatusHint(item)}</span>
                    )}
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      data-testid={`admin-verification-view-docs-${item.doctorId}`}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      aria-label={`${t('verification.actions.viewDocs')} ${item.fullName}`}
                      onClick={() => setSelectedDoctorId(item.doctorId)}
                    >
                      {t('verification.actions.viewDocs')}
                    </button>
                    <button
                      type="button"
                      data-testid={`admin-verification-approve-${item.doctorId}`}
                      className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      aria-label={`${t('verification.actions.approve')} ${item.fullName}`}
                      onClick={() => {
                        setModalDoctorId(item.doctorId);
                        setModalAction('approve');
                        setNotes('');
                      }}
                    >
                      {t('verification.actions.approve')}
                    </button>
                    <button
                      type="button"
                      data-testid={`admin-verification-reject-${item.doctorId}`}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      aria-label={`${t('verification.actions.reject')} ${item.fullName}`}
                      onClick={() => {
                        setModalDoctorId(item.doctorId);
                        setModalAction('reject');
                        setNotes('');
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

      <ActionModal
        isOpen={!!modalAction && !!modalDoctorId}
        title={
          modalAction === 'approve'
            ? t('verification.actions.approve')
            : t('verification.actions.reject')
        }
        description={t('verification.modalDescription')}
        requireNotes={modalAction === 'reject'}
        notes={notes}
        onNotesChange={setNotes}
        confirmLabel={t('verification.actions.confirm')}
        cancelLabel={t('verification.actions.cancel')}
        isSubmitting={approveMutation.isPending || rejectMutation.isPending}
        onClose={closeModal}
        onConfirm={() => {
          if (!modalDoctorId || !modalAction) return;
          if (modalAction === 'approve') {
            approveMutation.mutate(
              { doctorId: modalDoctorId },
              { onSuccess: closeModal }
            );
            return;
          }
          rejectMutation.mutate(
            { doctorId: modalDoctorId, notes: notes.trim() },
            { onSuccess: closeModal }
          );
        }}
      />
    </div>
  );
}
