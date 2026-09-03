import React, { useCallback, useEffect, useState } from 'react';
import { Package, AlertTriangle, RefreshCw, PlusCircle, Clock, ShieldCheck, Utensils, ClipboardCheck } from 'lucide-react';
import { KitchenService, RemanenteFEFOItem } from '../../features/kitchen/services/kitchen.service.js';
import { ActiveRemanentesList } from '../../features/kitchen/components/ActiveRemanentesList.js';
import { WarehouseExtractionModal } from '../../features/stock/components/WarehouseExtractionModal.js';
import { DiscardModal } from '../../features/kitchen/components/DiscardModal.js';
import { RecipeSelectorModal } from '../../features/kitchen/components/RecipeSelectorModal.js';
import { ShiftReconciliationWizard } from '../../features/kitchen/components/ShiftReconciliationWizard.js';
import { FEFOInventoryHealthBar } from '../../features/kitchen/components/FEFOInventoryHealthBar.js';
import { LocationFilterTabs, LocationFilter } from '../../features/kitchen/components/LocationFilterTabs.js';
import { useAppShell } from '../session.js';

const MetricCard: React.FC<{ icon: React.ReactNode; danger?: boolean; title: string; value: number; unitLabel: string }> = ({
  icon,
  danger = false,
  title,
  value,
  unitLabel,
}) => (
  <div className="card-dashboard">
    <div className="card-header">
      <div className={`card-badge-icon${danger ? ' card-badge-icon--danger' : ''}`}>{icon}</div>
      <h2 className="card-title">{title}</h2>
    </div>
    <div className="fs-3xl fw-black">
      {value} <span className="text-secondary-color fs-md">{unitLabel}</span>
    </div>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; id: string; className: string }> = ({
  icon,
  label,
  onClick,
  id,
  className,
}) => (
  <div className="card-dashboard flex-column flex-center">
    <button type="button" className={`btn-touch w-full flex-center flex-gap-xs ${className}`} onClick={onClick} id={id}>
      {icon}
      {label}
    </button>
  </div>
);

interface SummaryCardsProps {
  remanentesCount: number;
  criticalCount: number;
  onExtract: () => void;
  onPrepareRecipe: () => void;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ remanentesCount, criticalCount, onExtract, onPrepareRecipe }) => (
  <section className="metrics-grid">
    <MetricCard icon={<Clock size={20} />} title="Remanentes Abiertos" value={remanentesCount} unitLabel="lotes FEFO" />
    <MetricCard
      icon={<AlertTriangle size={20} />}
      danger
      title="Vencimiento Próximo (<24h)"
      value={criticalCount}
      unitLabel="lotes críticos"
    />
    <ActionCard icon={<PlusCircle size={22} />} label="Extraer Insumo de Bodega" onClick={onExtract} id="btn-open-extraction" className="btn-primary" />
    <ActionCard icon={<Utensils size={22} />} label="Preparar Receta FEFO" onClick={onPrepareRecipe} id="btn-open-recipe" className="btn-primary" />
  </section>
);

function useInventarioData() {
  const [remanentes, setRemanentes] = useState<RemanenteFEFOItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRemanentes = useCallback(async () => {
    setIsLoading(true);
    try {
      setRemanentes(await KitchenService.fetchActiveRemanentes());
    } catch (err) {
      console.error('[InventarioRoute] Error cargando remanentes activos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRemanentes();
  }, [loadRemanentes]);

  const handleConsume = useCallback(
    async (id: string, qty: number) => {
      await KitchenService.consumeRemanente(id, qty);
      await loadRemanentes();
    },
    [loadRemanentes],
  );

  return { remanentes, isLoading, loadRemanentes, handleConsume };
}

function useKitchenOpModals() {
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<RemanenteFEFOItem | null>(null);
  return {
    isExtractionOpen,
    setIsExtractionOpen,
    isRecipeOpen,
    setIsRecipeOpen,
    isReconciliationOpen,
    setIsReconciliationOpen,
    discardTarget,
    setDiscardTarget,
  };
}

const PageHeading: React.FC<{ isLoading: boolean; onSync: () => void; onReconcile: () => void }> = ({ isLoading, onSync, onReconcile }) => (
  <header className="flex-between flex-wrap mb-6 gap-3">
    <div>
      <h1 className="flex-gap-md fs-2xl fw-bold">
        <Package className="text-primary-color" /> RestoStock FEFO Dashboard
      </h1>
      <p className="text-secondary-color mt-1 fs-md">Sistema Táctil de Inventario en Tiempo Real para Cocinas Industriales</p>
    </div>
    <div className="flex-gap-md flex-wrap">
      <button type="button" className="btn-touch btn-secondary" onClick={onReconcile} id="btn-open-reconciliation" title="Cierre de Turno y Conciliación">
        <ClipboardCheck size={20} />
        Conciliar Turno
      </button>
      <button type="button" className="btn-touch btn-secondary" onClick={onSync} disabled={isLoading} id="btn-sync-remanentes" title="Sincronizar Remanentes">
        <RefreshCw size={20} className={isLoading ? 'spin' : ''} />
        Sincronizar
      </button>
    </div>
  </header>
);

const KitchenBoardTitle: React.FC = () => (
  <div className="flex-between mb-4">
    <h2 className="flex-gap-sm fs-xl fw-bold">
      <ShieldCheck className="text-primary-color" /> Tablero FEFO de Cocina (Prioridad por Expiración)
    </h2>
    <span className="fs-sm text-secondary-color">
      Botones táctiles optimizados a <strong>&ge;48px</strong>
    </span>
  </div>
);

/** Ruta Inventario (`/`, US-023): el Tablero FEFO de cocina, antes cuerpo de `App.tsx`. */
export const InventarioRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  const { remanentes, isLoading, loadRemanentes, handleConsume } = useInventarioData();
  const modals = useKitchenOpModals();
  const [activeLocation, setActiveLocation] = useState<LocationFilter>('ALL');

  const criticalCount = remanentes.filter((r) => r.hoursRemaining < 24).length;
  const counts: Record<LocationFilter, number> = {
    ALL: remanentes.length,
    KITCHEN_FRIDGE: remanentes.filter((r) => r.location === 'KITCHEN_FRIDGE').length,
    KITCHEN_PREP: remanentes.filter((r) => r.location === 'KITCHEN_PREP').length,
    KITCHEN_LINE: remanentes.filter((r) => r.location === 'KITCHEN_LINE').length,
  };
  const filtered = activeLocation === 'ALL' ? remanentes : remanentes.filter((r) => r.location === activeLocation);

  return (
    <>
      <PageHeading
        isLoading={isLoading}
        onSync={loadRemanentes}
        onReconcile={() => modals.setIsReconciliationOpen(true)}
      />
      <FEFOInventoryHealthBar remanentes={remanentes} />
      <SummaryCards
        remanentesCount={remanentes.length}
        criticalCount={criticalCount}
        onExtract={() => modals.setIsExtractionOpen(true)}
        onPrepareRecipe={() => modals.setIsRecipeOpen(true)}
      />
      <KitchenBoardTitle />
      <LocationFilterTabs activeLocation={activeLocation} onLocationSelect={setActiveLocation} counts={counts} />
      <main>
        <ActiveRemanentesList items={filtered} onConsume={handleConsume} onDiscard={(item) => modals.setDiscardTarget(item)} />
      </main>

      <WarehouseExtractionModal isOpen={modals.isExtractionOpen} onClose={() => modals.setIsExtractionOpen(false)} onSuccess={loadRemanentes} />
      <RecipeSelectorModal isOpen={modals.isRecipeOpen} onClose={() => modals.setIsRecipeOpen(false)} onSuccess={loadRemanentes} />
      <DiscardModal remanente={modals.discardTarget} onClose={() => modals.setDiscardTarget(null)} onSuccess={loadRemanentes} />
      <ShiftReconciliationWizard
        isOpen={modals.isReconciliationOpen}
        remanentes={remanentes}
        operatorId={currentUser.id}
        onClose={() => modals.setIsReconciliationOpen(false)}
        onSuccess={loadRemanentes}
      />
    </>
  );
};
