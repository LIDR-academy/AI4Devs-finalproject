'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useApproveReviewModeration,
  useRejectReviewModeration,
} from '@/hooks/admin/useReviewsModeration';
import ActionModal from '@/app/components/ui/ActionModal';

interface ReviewItem {
  reviewId: string;
  patientName: string;
  doctorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsModerationTableProps {
  items: ReviewItem[];
}

export default function ReviewsModerationTable({ items }: ReviewsModerationTableProps) {
  const t = useTranslations('adminDashboard');
  const approveMutation = useApproveReviewModeration();
  const rejectMutation = useRejectReviewModeration();
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [modalReviewId, setModalReviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const closeModal = () => {
    setModalAction(null);
    setModalReviewId(null);
    setNotes('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="admin-reviews-table">
      <h3 className="text-lg font-semibold mb-4">{t('reviews.title')}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm" aria-label={t('reviews.title')}>
          <caption className="sr-only">{t('reviews.tableCaption')}</caption>
          <thead>
            <tr className="text-left border-b">
              <th scope="col" className="py-2 pr-3">{t('reviews.columns.patient')}</th>
              <th scope="col" className="py-2 pr-3">{t('reviews.columns.doctor')}</th>
              <th scope="col" className="py-2 pr-3">{t('reviews.columns.rating')}</th>
              <th scope="col" className="py-2 pr-3">{t('reviews.columns.comment')}</th>
              <th scope="col" className="py-2 pr-3">{t('reviews.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.reviewId} className="border-b" data-testid={`admin-review-row-${item.reviewId}`}>
                <td className="py-2 pr-3">{item.patientName}</td>
                <td className="py-2 pr-3">{item.doctorName}</td>
                <td className="py-2 pr-3">{item.rating}</td>
                <td className="py-2 pr-3 max-w-xs truncate" title={item.comment}>
                  {item.comment}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-testid={`admin-review-approve-${item.reviewId}`}
                      className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      aria-label={`${t('reviews.actions.approve')} ${item.doctorName}`}
                      onClick={() => {
                        setModalReviewId(item.reviewId);
                        setModalAction('approve');
                        setNotes('');
                      }}
                    >
                      {t('reviews.actions.approve')}
                    </button>
                    <button
                      type="button"
                      data-testid={`admin-review-reject-${item.reviewId}`}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      aria-label={`${t('reviews.actions.reject')} ${item.doctorName}`}
                      onClick={() => {
                        setModalReviewId(item.reviewId);
                        setModalAction('reject');
                        setNotes('');
                      }}
                    >
                      {t('reviews.actions.reject')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ActionModal
        isOpen={!!modalAction && !!modalReviewId}
        title={
          modalAction === 'approve'
            ? t('reviews.actions.approve')
            : t('reviews.actions.reject')
        }
        description={t('reviews.modalDescription')}
        requireNotes={modalAction === 'reject'}
        notes={notes}
        onNotesChange={setNotes}
        confirmLabel={t('reviews.actions.confirm')}
        cancelLabel={t('reviews.actions.cancel')}
        isSubmitting={approveMutation.isPending || rejectMutation.isPending}
        onClose={closeModal}
        onConfirm={() => {
          if (!modalReviewId || !modalAction) return;
          if (modalAction === 'approve') {
            approveMutation.mutate(
              { reviewId: modalReviewId },
              { onSuccess: closeModal }
            );
            return;
          }
          rejectMutation.mutate(
            { reviewId: modalReviewId, notes: notes.trim() },
            { onSuccess: closeModal }
          );
        }}
      />
    </div>
  );
}
