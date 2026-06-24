'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { CancellationModal } from '@/components/booking/CancellationModal';
import { useBookingDetail, useCancelBooking } from '@/services/tripsService';
import { formatDate } from '@/lib/formatDate';
import { bookingStatusBadgeClass } from '@/lib/bookingStatus';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = typeof params.id === 'string' ? params.id : undefined;

  const { data, isLoading, error } = useBookingDetail(bookingId);
  const cancelBooking = useCancelBooking();

  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center text-taupe">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-terracotta" />
        Loading your booking…
      </main>
    );
  }

  if (error || !data) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-ink" role="alert">
          {notFound ? 'Booking not found.' : 'We couldn’t load this booking.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/trips')}
          className="mt-4 text-sm font-semibold text-terracotta hover:underline"
        >
          Back to My Trips
        </button>
      </main>
    );
  }

  const pb = data.price_breakdown;

  async function handleConfirmCancel() {
    if (!bookingId) return;
    try {
      await cancelBooking.mutateAsync({ bookingId, reason: undefined });
      setModalOpen(false);
    } catch {
      // error surfaced via cancelBooking.error in the modal
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.push('/trips')}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> My Trips
      </button>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <img
          src={data.property.photo_url}
          alt={`Photo of ${data.property.title}`}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x300?text=No+Image'; }}
          className="h-48 w-full object-cover"
        />
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-serif text-ink text-xl">{data.property.title}</h1>
            <span className={bookingStatusBadgeClass(data.status)}>
              {data.status}
            </span>
          </div>

          <p className="flex items-center gap-1 text-sm text-taupe">
            <MapPin className="h-4 w-4" aria-hidden />
            {data.property.city}, {data.property.country}
            {data.property.address ? ` · ${data.property.address}` : ''}
          </p>
          {data.property.host_name && (
            <p className="text-sm text-taupe">Hosted by {data.property.host_name}</p>
          )}

          <p className="text-sm text-taupe">
            Reference: <span>{data.reference_number}</span>
          </p>
          <p className="text-sm text-ink">
            {formatDate(data.check_in)} &#8594; {formatDate(data.check_out)} · {data.guest_count} guest
            {data.guest_count === 1 ? '' : 's'}
          </p>

          <div className="mt-2 border-t border-divider pt-3 text-sm">
            <div className="flex justify-between text-taupe">
              <span>€{pb.nightly_rate_eur.toFixed(2)} × {pb.nights} nights</span>
              <span>€{pb.subtotal_eur.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-taupe">
              <span>Cleaning fee</span><span>€{pb.cleaning_fee_eur.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-taupe">
              <span>Service fee</span><span>€{pb.service_fee_eur.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-divider pt-2 font-serif text-ink">
              <span>Total</span><span>€{pb.total_eur.toFixed(2)}</span>
            </div>
          </div>

          {data.cancellation_policy && (
            <p className="mt-2 text-xs text-taupe">{data.cancellation_policy}</p>
          )}

          {data.can_cancel && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-testid="open-cancel-button"
              className="mt-3 self-start rounded-pill border border-border px-4 py-2 text-sm font-semibold text-terracotta hover:bg-terracotta-tint"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      <CancellationModal
        isOpen={modalOpen}
        policy={data.cancellation_policy ?? 'Full refund if cancelled 48+ hours before check-in'}
        refundAmountEur={data.refund_amount_eur}
        isCancelling={cancelBooking.isPending}
        error={cancelBooking.error ? cancelBooking.error.message : null}
        onConfirm={handleConfirmCancel}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
