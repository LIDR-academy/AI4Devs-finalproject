import type { TripParticipant } from '@/types/trip.types';

interface PayerSelectorProps {
  participants: TripParticipant[];
  selectedPayerId?: string;
  onSelect: (payerId: string) => void;
  error?: string;
}

/**
 * PayerSelector molecule component
 * Dropdown/Select for choosing who paid the expense
 * Default: logged-in user
 */
export const PayerSelector = ({
  participants,
  selectedPayerId,
  onSelect,
  error,
}: PayerSelectorProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">Pagador</label>
      <select
        value={selectedPayerId || ''}
        onChange={e => onSelect(e.target.value)}
        className={`w-full min-h-[48px] px-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600 focus:border-transparent active:bg-slate-50 transition-colors ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus-visible:ring-red-500'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <option value="">Seleccione un pagador</option>
        {participants.map(participant => (
          <option key={participant.id} value={participant.user_id}>
            {participant.user?.nombre || `Usuario ${participant.user_id.slice(0, 8)}`}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
