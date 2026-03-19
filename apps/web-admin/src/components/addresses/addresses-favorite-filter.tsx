'use client';

type FavoriteValue = 'true' | 'false' | undefined;

interface AddressesFavoriteFilterProps {
  value: FavoriteValue;
  onChange: (value: FavoriteValue) => void;
}

const OPTIONS: { label: string; value: FavoriteValue }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Favorita', value: 'true' },
  { label: 'No favorita', value: 'false' },
];

export function AddressesFavoriteFilter({ value, onChange }: AddressesFavoriteFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por favorita"
      className="flex items-center rounded-md border border-input overflow-hidden"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`h-9 px-3 text-sm transition-colors border-r last:border-r-0 border-input ${
              isActive
                ? 'bg-brand-teal/10 text-brand-teal font-medium'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
