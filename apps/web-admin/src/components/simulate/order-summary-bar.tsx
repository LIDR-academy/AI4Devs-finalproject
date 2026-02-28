'use client';

import { Button } from '@/components/ui/button';

interface OrderSummaryBarProps {
  summary: string | null;
  onNewSimulation: () => void;
  onChangeOrder: () => void;
}

export function OrderSummaryBar({ summary, onNewSimulation, onChangeOrder }: OrderSummaryBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-3 shrink-0">
      <div>
        <h1 className="text-lg font-semibold">Simulación de Compras</h1>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>
      <div className="flex gap-2">
        {summary && (
          <Button variant="outline" size="sm" onClick={onChangeOrder}>
            ✎ Cambiar pedido
          </Button>
        )}
        <Button size="sm" onClick={onNewSimulation}>
          + Nueva Simulación
        </Button>
      </div>
    </div>
  );
}
