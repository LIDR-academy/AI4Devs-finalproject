import { User } from 'lucide-react';
import type { ParticipantBalance, TripCurrency } from '@/types/balance.types';
import { formatCurrency } from '@/utils/currency';

interface ParticipantBalanceCardProps {
  participantBalance: ParticipantBalance;
  currency?: TripCurrency; // Optional: Currency of the trip (COP or USD). Defaults to COP for backward compatibility
  isCurrentUser?: boolean; // Optional: Whether this is the current user's balance
}

/**
 * ParticipantBalanceCard Component
 * Displays balance information for a single participant
 * Shows: name, total spent, total owed, and net balance
 *
 * Used in TripDetailPage to show individual participant balances
 * Follows Design System: bg-white, rounded-xl, p-4, shadow-sm
 */
export const ParticipantBalanceCard = ({
  participantBalance,
  currency = 'COP',
  isCurrentUser = false,
}: ParticipantBalanceCardProps) => {
  const { user_name, total_spent, total_owed, balance } = participantBalance;

  // Determine balance color based on value
  const balanceColorClass =
    balance > 0.01
      ? 'text-emerald-700 bg-emerald-50'
      : balance < -0.01
        ? 'text-red-700 bg-red-50'
        : 'text-slate-700 bg-slate-50';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 bg-slate-100 rounded-full p-2">
          <User size={20} className="text-slate-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-semibold text-slate-900 truncate">{user_name}</h4>
            {isCurrentUser && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Tú
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{participantBalance.user_email}</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Total Spent */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total gastado</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(total_spent, currency)}
          </span>
        </div>

        {/* Total Owed */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total que debe</span>
          <span className="font-medium text-slate-900">{formatCurrency(total_owed, currency)}</span>
        </div>

        {/* Net Balance */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Balance neto</span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${balanceColorClass}`}>
            {formatCurrency(Math.abs(balance), currency)}
            {balance > 0.01 && ' (le deben)'}
            {balance < -0.01 && ' (debe)'}
            {Math.abs(balance) <= 0.01 && ' (al día)'}
          </span>
        </div>
      </div>
    </div>
  );
};
