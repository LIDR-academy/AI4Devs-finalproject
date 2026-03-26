import type { TripCurrency } from '@/types/trip.types';

interface CurrencySelectorProps {
  selected_currency?: TripCurrency;
  on_select: (currency: TripCurrency) => void;
  error?: string;
}

/**
 * CurrencySelector molecule component
 * Dropdown/Select for choosing trip currency (COP or USD)
 * Default: COP
 */
export const CurrencySelector = ({
  selected_currency,
  on_select,
  error,
}: CurrencySelectorProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">Moneda del viaje</label>
      <select
        value={selected_currency || 'COP'}
        onChange={e => on_select(e.target.value as TripCurrency)}
        className={`w-full min-h-[48px] px-4 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600 focus:border-transparent active:bg-slate-50 transition-colors ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus-visible:ring-red-500'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <option value="COP">COP (Peso Colombiano)</option>
        <option value="USD">USD (Dólar Estadounidense)</option>
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
