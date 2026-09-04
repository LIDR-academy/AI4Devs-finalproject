import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ArrowRightLeft, ShieldCheck, Utensils, ClipboardCheck } from 'lucide-react';
import { ActionButton } from '../../shared/components/ActionButton.js';
import { bucketRemanentes, type UrgencyLevel } from '../../shared/components/urgency.js';
import { KitchenService, RemanenteFEFOItem } from '../../features/kitchen/services/kitchen.service.js';
import { ActiveRemanentesList } from '../../features/kitchen/components/ActiveRemanentesList.js';
import { WarehouseExtractionModal } from '../../features/stock/components/WarehouseExtractionModal.js';
import { DiscardModal } from '../../features/kitchen/components/DiscardModal.js';
import { RecipeSelectorModal } from '../../features/kitchen/components/RecipeSelectorModal.js';
import { ShiftReconciliationWizard } from '../../features/kitchen/components/ShiftReconciliationWizard.js';
import { FEFOInventoryHealthBar } from '../../features/kitchen/components/FEFOInventoryHealthBar.js';
import { OpenPreparationsPanel } from '../../features/kitchen/components/OpenPreparationsPanel.js';
import { LocationFilterTabs, LocationFilter } from '../../features/kitchen/components/LocationFilterTabs.js';
import { useAppShell } from '../session.js';
import styles from './InventarioRoute.module.css';

const STATUS_BUCKETS: { key: UrgencyLevel; label: string }[] = [
  { key: 'safe', label: 'Vigentes' },
  { key: 'warning', label: 'Vencimiento Próximo' },
  { key: 'critical', label: 'Críticos Hoy' },
];

/** Panel Estado: 3 cubetas de severidad alineadas con los 3 segmentos de la health bar (TK-087-FE). */
const StatusPanel: React.FC<{ remanentes: RemanenteFEFOItem[] }> = ({ remanentes }) => {
  const buckets = bucketRemanentes(remanentes);

  return (
    <section className={styles['estado-panel']}>
      <h3 className="card-title mb-3">Estado</h3>
      {buckets.total === 0 ? (
        <p className="text-secondary-color fs-sm">Sin remanentes abiertos en cocina — nada que vigilar este turno.</p>
      ) : (
        <>
          <div className={styles['bucket-row']}>
            {STATUS_BUCKETS.map((b) => (
              <div key={b.key} className={styles.bucket}>
                <div className={`fs-2xl fw-black ${styles[`bucket-value--${b.key}`]}`}>{buckets[b.key]}</div>
                <div className="fs-xs text-secondary-color">{b.label}</div>
              </div>
            ))}
          </div>
          <FEFOInventoryHealthBar remanentes={remanentes} embedded />
        </>
      )}
    </section>
  );
};

interface AccionesEstadoGridProps {
  remanentes: RemanenteFEFOItem[];
  onExtract: () => void;
  onPrepareRecipe: () => void;
}

const AccionesEstadoGrid: React.FC<AccionesEstadoGridProps> = ({ remanentes, onExtract, onPrepareRecipe }) => (
  <section className={styles['acciones-estado-grid']}>
    <div className={styles['acciones-panel']}>
      <h3 className="card-title mb-3">Acciones</h3>
      <div className={styles['acciones-row']}>
        <ActionButton
          action="extract"
          label="Extraer de Bodega"
          hint="bodega → cocina"
          icon={<ArrowRightLeft size={26} />}
          onClick={onExtract}
          id="btn-open-extraction"
        />
        <ActionButton
          action="recipe"
          label="Preparar Receta"
          hint="consumo FEFO en cascada"
          icon={<Utensils size={26} />}
          onClick={onPrepareRecipe}
          id="btn-open-recipe"
        />
      </div>
    </div>
    <StatusPanel remanentes={remanentes} />
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

/* TK-095-FE WS-3 #13: el artefacto va directo a la rejilla Acciones|Estado — sin
   h1 de página (el wordmark lateral + la pestaña activa identifican la vista).
   Conciliar/Sincronizar quedan como una barra de acciones discreta alineada a la derecha. */
const PageHeading: React.FC<{ isLoading: boolean; onSync: () => void; onReconcile: () => void }> = ({ isLoading, onSync, onReconcile }) => (
  <div className="flex-gap-md flex-wrap justify-end mb-4">
    <button type="button" className="btn-touch btn-secondary" onClick={onReconcile} id="btn-open-reconciliation" title="Cierre de Turno y Conciliación">
      <ClipboardCheck size={20} />
      Conciliar Turno
    </button>
    <button type="button" className="btn-touch btn-secondary" onClick={onSync} disabled={isLoading} id="btn-sync-remanentes" title="Sincronizar Remanentes">
      <RefreshCw size={20} className={isLoading ? 'spin' : ''} />
      Sincronizar
    </button>
  </div>
);

const KitchenBoardTitle: React.FC = () => (
  <div className="mb-4">
    <h2 className="flex-gap-sm fs-xl fw-bold">
      <ShieldCheck className="text-primary-color" /> Tablero FEFO de Cocina (Prioridad por Expiración)
    </h2>
  </div>
);

/** Ruta Inventario (`/`, US-023): el Tablero FEFO de cocina, antes cuerpo de `App.tsx`. */
export const InventarioRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  const { remanentes, isLoading, loadRemanentes, handleConsume } = useInventarioData();
  const modals = useKitchenOpModals();
  const [activeLocation, setActiveLocation] = useState<LocationFilter>('ALL');

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
      <AccionesEstadoGrid
        remanentes={remanentes}
        onExtract={() => modals.setIsExtractionOpen(true)}
        onPrepareRecipe={() => modals.setIsRecipeOpen(true)}
      />
      {/* US-027: preparaciones de receta abiertas — el panel se auto-oculta si no hay ninguna. */}
      <OpenPreparationsPanel reloadKey={remanentes.length} />
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
