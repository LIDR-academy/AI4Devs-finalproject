import type { ClientVehicleSummary } from '../types/history.types';
import { ClientVehicleCard } from './ClientVehicleCard';

interface ClientVehiclesListProps {
  vehicles: ClientVehicleSummary[];
}

export function ClientVehiclesList({ vehicles }: ClientVehiclesListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Vehículos del cliente
      </h2>

      {vehicles.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Sin vehículos registrados
        </p>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <ClientVehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
