'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useCreateAppointmentReview } from '@/hooks/useReview';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(10, 'commentMin')
    .max(1000, 'commentMax'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

function mapBackendErrorToI18nKey(status?: number, code?: string): string {
  if (code === 'REVIEW_ALREADY_EXISTS' || status === 409) return 'errors.alreadyExists';
  if (status === 403) return 'errors.forbidden';
  if (status === 404) return 'errors.notFound';
  if (status === 400) return 'errors.invalidData';
  return 'errors.generic';
}

interface ReviewFormProps {
  appointmentId: string;
  onCreated?: () => void;
}

export default function ReviewForm({ appointmentId, onCreated }: ReviewFormProps) {
  const t = useTranslations('reviews');
  const [selectedRating, setSelectedRating] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createReview = useCreateAppointmentReview();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const comment = watch('comment') || '';
  const charCount = useMemo(() => comment.trim().length, [comment]);

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const result = await createReview.mutateAsync({
        appointmentId,
        payload: {
          rating: data.rating,
          comment: data.comment,
        },
      });

      setSuccessMessage(result.message || t('pendingModeration'));
      onCreated?.();
    } catch (error) {
      const typed = error as Error & { status?: number; code?: string };
      setSubmitError(t(mapBackendErrorToI18nKey(typed.status, typed.code)));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">{t('rating')}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={t('ratingValue', { value })}
              onClick={() => {
                setSelectedRating(value);
                setValue('rating', value, { shouldValidate: true });
              }}
              className={`text-2xl transition-colors ${
                value <= selectedRating ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-sm text-red-600">{t('ratingRequired')}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          {t('comment')}
        </label>
        <textarea
          id="comment"
          rows={5}
          {...register('comment')}
          placeholder={t('commentPlaceholder')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.comment ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          <div>
            {errors.comment?.message === 'commentMin' && (
              <p className="text-sm text-red-600">{t('commentMin')}</p>
            )}
            {errors.comment?.message === 'commentMax' && (
              <p className="text-sm text-red-600">{t('commentMax')}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">{t('charactersCount', { count: charCount })}</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={createReview.isPending}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createReview.isPending ? t('sending') : t('submit')}
      </button>
    </form>
  );
}
