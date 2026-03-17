import { Utensils, Car, Home, Film, ShoppingBag, Coffee, Users, Calendar } from 'lucide-react';
import type { ExpenseListItem, TripCurrency } from '@/types/expense.types';
import { formatCurrency } from '@/utils/currency';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpenseCardProps {
  expense: ExpenseListItem;
  currency?: TripCurrency; // Optional: Currency of the trip (COP or USD). Defaults to COP for backward compatibility
  onClick?: () => void;
}

/**
 * Get the appropriate icon for expense category based on category name or icon string
 */
const getCategoryIcon = (category_name: string, category_icon?: string) => {
  const iconProps = { size: 20, className: 'text-slate-600' };
  const icon_name = (category_icon || category_name).toLowerCase();

  if (icon_name.includes('comida') || icon_name.includes('food')) {
    return <Utensils {...iconProps} />;
  }
  if (icon_name.includes('transporte') || icon_name.includes('transport')) {
    return <Car {...iconProps} />;
  }
  if (icon_name.includes('alojamiento') || icon_name.includes('lodging')) {
    return <Home {...iconProps} />;
  }
  if (icon_name.includes('entretenimiento') || icon_name.includes('entertainment')) {
    return <Film {...iconProps} />;
  }
  if (icon_name.includes('compras') || icon_name.includes('shopping')) {
    return <ShoppingBag {...iconProps} />;
  }
  // Default
  return <Coffee {...iconProps} />;
};

/**
 * Format date to short format (e.g., "16 ene 2024")
 */
const formatShortDate = (date_value: Date | string): string => {
  try {
    const date_string = typeof date_value === 'string' ? date_value : date_value.toISOString();
    const parsed = parseISO(date_string);

    if (!isValid(parsed)) {
      return date_string;
    }

    return format(parsed, 'd MMM yyyy', { locale: es });
  } catch {
    return typeof date_value === 'string' ? date_value : date_value.toISOString();
  }
};

/**
 * ExpenseCard Component
 * Displays an expense with category icon, title, amount, date, payer, and beneficiary count
 *
 * Layout: [Icon] Title                    $ Amount
 *                Categoría • Fecha        N beneficiarios
 *                Pagó: [Nombre]
 *
 * Used in TripDetailPage to show expenses list
 * Follows Design System: bg-white, rounded-xl, p-4, shadow-sm
 */
export const ExpenseCard = ({ expense, currency = 'COP', onClick }: ExpenseCardProps) => {
  const base_class_name =
    'w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]';
  const cursor_class = onClick ? 'cursor-pointer' : 'cursor-default';
  const class_name = `${base_class_name} ${cursor_class}`;

  const Container: 'div' | 'button' = onClick ? 'button' : 'div';
  const beneficiary_count = expense.beneficiaries?.length || 0;

  return (
    <Container
      className={class_name}
      {...(onClick
        ? {
            onClick,
            type: 'button' as const,
          }
        : {})}
    >
      <div className="flex items-start gap-4">
        {/* Left: Category icon in circular background */}
        <div
          className="flex-shrink-0 bg-slate-100 rounded-full p-3 flex items-center justify-center"
          aria-hidden="true"
        >
          {getCategoryIcon(expense.category_name)}
        </div>

        {/* Center: Title, category, date, and payer info */}
        <div className="flex-1 min-w-0 space-y-1 text-left">
          <h4 className="text-base font-semibold text-slate-900 truncate text-left">
            {expense.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span>{expense.category_name}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} aria-hidden="true" />
              <span>{formatShortDate(expense.expense_date)}</span>
            </span>
          </div>
          {expense.payer?.nombre && (
            <p className="text-xs text-slate-400">
              Pagó: <span className="font-medium text-slate-500">{expense.payer.nombre}</span>
            </p>
          )}
        </div>

        {/* Right: Amount and beneficiary count */}
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(expense.amount, currency)}
          </p>
          {beneficiary_count > 0 && (
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-1">
              <Users size={14} aria-hidden="true" />
              <span className="font-medium">{beneficiary_count}</span>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};
