import { cn } from '@/shared/lib/cn';

interface VehicleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function VehicleSearchBar({
  value,
  onChange,
  isLoading = false,
}: VehicleSearchBarProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor="vehicle-search"
        className="block text-sm font-medium text-slate-700"
      >
        Buscar por placa
      </label>
      <div className="relative">
        <input
          id="vehicle-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="Ej. ABC123"
          className={cn(
            'w-full rounded-lg border border-slate-300 px-3 py-2 uppercase text-slate-900 outline-none ring-blue-500 focus:ring-2',
            isLoading && 'pr-10',
          )}
        />
        {isLoading && (
          <span
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export function VehicleSearchHint({ query }: { query: string }) {
  if (query.length > 0 && query.length < 2) {
    return (
      <p className="text-sm text-slate-500">
        Escribe al menos 2 caracteres para buscar
      </p>
    );
  }

  return null;
}
