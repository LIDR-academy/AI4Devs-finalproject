import { useState } from 'react';
import clsx from 'clsx';
import { Key } from 'lucide-react';
import { JoinTripModal } from '@/components/organisms/JoinTripModal';
import type { TripResponse } from '@/types/trip.types';

const JOIN_BUTTON_CLASSES =
  'flex h-12 w-full max-w-sm mx-auto items-center justify-center gap-2 rounded-xl bg-white border-2 border-violet-600 font-semibold text-violet-600 transition-colors hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2';

interface JoinTripButtonProps {
  onSuccess?: (trip: TripResponse) => void;
  onError?: (error: unknown) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * JoinTripButton molecule component
 * Molecule that combines button + icon + modal trigger
 * Follows Atomic Design: Located in molecules/ as it combines atoms and has simple state
 */
export function JoinTripButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}: JoinTripButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (trip: TripResponse) => {
    setIsModalOpen(false);
    if (onSuccess) {
      onSuccess(trip);
    }
  };

  const handleError = (error: unknown) => {
    if (onError) {
      onError(error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className={clsx(
          JOIN_BUTTON_CLASSES,
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <Key size={20} />
        Unirse con código
      </button>

      <JoinTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}
