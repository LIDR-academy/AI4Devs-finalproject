import type { TripParticipant } from '@/types/trip.types';
import { EmailSearchInput } from './EmailSearchInput';

interface BeneficiariesSelectorProps {
  participants: TripParticipant[];
  selectedBeneficiaryIds: string[];
  selectedPayerId?: string;
  onToggle: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAddByEmail: (userId: string) => void;
  onInviteByEmail: (email: string) => Promise<void>;
  error?: string;
}

/**
 * BeneficiariesSelector molecule component
 * Checkbox list for selecting expense beneficiaries (split)
 * Default: all selected
 */
export const BeneficiariesSelector = ({
  participants,
  selectedBeneficiaryIds,
  selectedPayerId,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onAddByEmail,
  onInviteByEmail,
  error,
}: BeneficiariesSelectorProps) => {
  // Filter out the payer from beneficiaries list
  const availableBeneficiaries = selectedPayerId
    ? participants.filter(p => p.user_id !== selectedPayerId)
    : participants;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">Beneficiarios</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-violet-600 hover:text-violet-700 active:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 rounded px-1 font-medium transition-colors"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-xs text-slate-500 hover:text-slate-700 active:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1 rounded px-1 font-medium transition-colors"
          >
            Ninguno
          </button>
        </div>
      </div>
      {onAddByEmail && (
        <div className="mb-3">
          <EmailSearchInput
            onAdd={onAddByEmail || (() => {})}
            onInvite={onInviteByEmail}
            existingEmails={participants.map(p => p.user?.email || '').filter(Boolean)}
          />
        </div>
      )}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {availableBeneficiaries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay otros participantes disponibles. El pagador no puede ser beneficiario.
          </p>
        ) : (
          availableBeneficiaries.map(participant => {
            const isSelected = selectedBeneficiaryIds.includes(participant.user_id);
            return (
              <label
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(participant.user_id)}
                  className="w-5 h-5 text-violet-600 border-slate-300 rounded focus:ring-violet-600 focus:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700">
                  {participant.user?.nombre || `Usuario ${participant.user_id.slice(0, 8)}`}
                </span>
              </label>
            );
          })
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
