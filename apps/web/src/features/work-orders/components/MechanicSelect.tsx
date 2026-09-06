import { cn } from '@/shared/lib/cn';
import { useMechanics } from '../hooks/useMechanics';

interface MechanicSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function MechanicSelect({
  value,
  onChange,
  disabled = false,
  error,
}: MechanicSelectProps) {
  const { data: mechanics = [], isLoading } = useMechanics();

  return (
    <div className="space-y-1">
      <label
        htmlFor="assignedMechanicId"
        className="block text-sm font-medium text-slate-700"
      >
        Mecánico asignado (opcional)
      </label>
      <select
        id="assignedMechanicId"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isLoading}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2 disabled:bg-slate-100',
          error ? 'border-red-500' : 'border-slate-300',
        )}
      >
        <option value="">Sin asignar</option>
        {mechanics.map((mechanic) => {
          const role = mechanic.role ?? 'MECHANIC';
          const label =
            role === 'ADMIN'
              ? `${mechanic.fullName} (Admin)`
              : mechanic.fullName;

          return (
            <option key={mechanic.id} value={mechanic.id}>
              {label}
            </option>
          );
        })}
      </select>
      {isLoading && (
        <p className="text-sm text-slate-500">Cargando mecánicos...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
