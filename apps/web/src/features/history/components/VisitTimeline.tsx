'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { VehicleVisit } from '../types/history.types';
import { VisitCard } from './VisitCard';

interface VisitTimelineProps {
  visits: VehicleVisit[];
  vehicleId: string;
  currentOwnerNationalId: string | null;
  isLoading?: boolean;
}

export function VisitTimeline({
  visits,
  vehicleId,
  currentOwnerNationalId,
  isLoading = false,
}: VisitTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section
      id="historial"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Historial de visitas
      </h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Cargando historial...</p>
      ) : visits.length === 0 ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">
            Este vehículo aún no tiene visitas registradas
          </p>
          <Link href={`/work-orders/new?vehicleId=${vehicleId}`}>
            <Button type="button">Crear orden de trabajo</Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visits.map((visit) => (
            <li key={visit.workOrderId}>
              <VisitCard
                visit={visit}
                currentOwnerNationalId={currentOwnerNationalId}
                expanded={expandedId === visit.workOrderId}
                onToggle={() =>
                  setExpandedId((current) =>
                    current === visit.workOrderId ? null : visit.workOrderId,
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
