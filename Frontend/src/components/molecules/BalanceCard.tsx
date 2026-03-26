import { ArrowRight } from 'lucide-react';
import type { Balance, TripCurrency } from '@/types/trip.types';
import { formatCurrency } from '@/utils/currency';

interface BalanceCardProps {
  balance: Balance;
  currency?: TripCurrency; // Optional: Currency of the trip (COP or USD). Defaults to COP for backward compatibility
  // TODO: Add onClick handler for navigation to balance detail
  // Should navigate to: /trips/:tripId/balances/:balanceId or /trips/:tripId?tab=saldos
  // Requires backend endpoint: GET /trips/:tripId/balances/:balanceId
  // Prerequisites: TripDetailPage with Saldos tab must be implemented first
  // onClick?: () => void;
}

/**
 * BalanceCard Component
 * Displays a debt/balance between two users in the format "NameA → NameB"
 * with a colored badge showing the amount
 *
 * Used in HomePage to show balances section
 * Follows Design System: bg-white, rounded-xl, p-4, shadow-sm
 */
export const BalanceCard = ({ balance, currency = 'COP' }: BalanceCardProps) => {
  // Determine badge colors based on badgeColor prop
  const badgeColors = {
    red: 'bg-red-50 text-red-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  const badgeColorClass = badgeColors[balance.badgeColor] ?? badgeColors.blue;

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm cursor-default"
      // TODO: Add onClick when navigation is implemented
      // When implemented, change cursor-default to cursor-pointer and uncomment onClick
      // onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Left: Names with arrow */}
        <div className="flex items-center gap-2 text-slate-900">
          <span className="font-medium">{balance.fromName}</span>
          <ArrowRight size={20} className="text-slate-400" aria-hidden="true" />
          <span className="font-medium">{balance.toName}</span>
        </div>

        {/* Right: Amount badge */}
        <div className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeColorClass}`}>
          {formatCurrency(balance.amount, currency)}
        </div>
      </div>
    </div>
  );
};
