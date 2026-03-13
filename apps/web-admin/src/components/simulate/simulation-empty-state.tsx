'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationEmptyStateProps {
  onNewSimulation: () => void;
}

export function SimulationEmptyState({ onNewSimulation }: SimulationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
      <div>
        <p className="text-base font-medium text-foreground">Ninguna simulación activa</p>
        <p className="text-sm text-muted-foreground mt-1">
          Configura un pedido para comenzar
        </p>
      </div>
      <Button onClick={onNewSimulation}>
        + Nueva Simulación
      </Button>
    </div>
  );
}
