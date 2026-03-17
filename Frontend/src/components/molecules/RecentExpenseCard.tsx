import { Utensils, Car, Bed, Film, Package, Users } from 'lucide-react';
import type { RecentExpense, ExpenseCategory, TripCurrency } from '@/types/trip.types';
import { formatCurrency } from '@/utils/currency';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

function assertNever(value: never): never {
  throw new Error(`Unhandled expense category: ${String(value)}`);
}

interface RecentExpenseCardProps {
  expense: RecentExpense;
  currency?: TripCurrency; // Optional: Currency of the trip (COP or USD). Defaults to COP for backward compatibility
  onClick?: () => void;
}

/**
 * Get the appropriate icon for each expense category
 */
const getCategoryIcon = (category: ExpenseCategory) => {
  const iconProps = { size: 20, className: 'text-slate-600' };

  switch (category) {
    case 'food':
      return <Utensils {...iconProps} />;
    case 'transport':
      return <Car {...iconProps} />;
    case 'lodging':
      return <Bed {...iconProps} />;
    case 'entertainment':
      return <Film {...iconProps} />;
    case 'other':
      return <Package {...iconProps} />;
    default:
      return assertNever(category as never);
  }
};

/**
 * Format date to short format (e.g., "16 ene")
 */
const formatShortDate = (dateString: string): string => {
  try {
    const parsed = parseISO(dateString);

    if (!isValid(parsed)) {
      return dateString;
    }

    return format(parsed, 'd MMM', { locale: es });
  } catch {
    return dateString;
  }
};

/**
 * RecentExpenseCard Component
 * Displays a recent expense with category icon, title, payer info, amount, and participant count
 *
 * Layout: [Icon] Title              $ Amount
 *                Pagó X • date      N personas
 *
 * Used in HomePage to show recent expenses section
 * Follows Design System: bg-white, rounded-xl, p-4, shadow-sm
 */
export const RecentExpenseCard = ({
  expense,
  currency = 'COP',
  onClick,
}: RecentExpenseCardProps) => {
  const baseClassName =
    'bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200';
  const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
  const className = `${baseClassName} ${cursorClass}`;

  const Container: 'div' | 'button' = onClick ? 'button' : 'div';

  return (
    <Container
      className={`${className} w-full`}
      {...(onClick
        ? {
            onClick,
            type: 'button' as const,
          }
        : {})}
    >
      <div className="flex items-start gap-3">
        {/* Left: Category icon in circular background */}
        <div className="flex-shrink-0 bg-slate-100 rounded-full p-2 mt-1" aria-hidden="true">
          {getCategoryIcon(expense.category)}
        </div>

        {/* Center: Title and payer info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-slate-900 truncate mb-1">{expense.title}</h4>
          <p className="text-sm text-slate-500">
            Pagó {expense.paidBy} • {formatShortDate(expense.date)}
          </p>
        </div>

        {/* Right: Amount and participant count */}
        <div className="flex-shrink-0 text-right">
          <p className="text-base font-semibold text-slate-900 mb-1">
            {formatCurrency(expense.amount, currency)}
          </p>
          <div className="flex items-center justify-end gap-1 text-sm text-slate-500">
            <Users size={20} aria-hidden="true" />
            <span>{expense.participantCount}</span>
          </div>
        </div>
      </div>
    </Container>
  );
};
