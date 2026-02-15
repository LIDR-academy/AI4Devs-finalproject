'use client';

import { useTranslations } from 'next-intl';
import {
  useApproveReviewModeration,
  useRejectReviewModeration,
} from '@/hooks/admin/useReviewsModeration';

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t('reviews.title')}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">{t('reviews.columns.patient')}</th>
              <th className="py-2 pr-3">{t('reviews.columns.doctor')}</th>
              <th className="py-2 pr-3">{t('reviews.columns.rating')}</th>
              <th className="py-2 pr-3">{t('reviews.columns.comment')}</th>
              <th className="py-2 pr-3">{t('reviews.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.reviewId} className="border-b">
                <td className="py-2 pr-3">{item.patientName}</td>
                <td className="py-2 pr-3">{item.doctorName}</td>
                <td className="py-2 pr-3">{item.rating}</td>
                <td className="py-2 pr-3 max-w-xs truncate">{item.comment}</td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      onClick={() => approveMutation.mutate({ reviewId: item.reviewId })}
                    >
                      {t('reviews.actions.approve')}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => {
                        const notes = window.prompt(t('reviews.actions.rejectPrompt'));
                        if (notes) {
                          rejectMutation.mutate({ reviewId: item.reviewId, notes });
                        }
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
    </div>
  );
}
