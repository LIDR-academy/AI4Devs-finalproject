'use client';

type RegisteredValue = 'true' | 'false' | undefined;

interface UsersRegisteredFilterProps {
  value: RegisteredValue;
  onChange: (value: RegisteredValue) => void;
}

const OPTIONS: { label: string; value: RegisteredValue }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Registrado', value: 'true' },
  { label: 'No registrado', value: 'false' },
];

export function UsersRegisteredFilter({ value, onChange }: UsersRegisteredFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estado de registro"
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
