import React, { useCallback, useEffect, useState } from 'react';
import { ChefHat, RefreshCw } from 'lucide-react';
import {
  RecipePreparationsService,
  RecipePreparationSummary,
} from '../services/recipePreparations.service.js';
import { RecipeItem, KitchenService } from '../services/kitchen.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { ConfirmModal } from '../../../shared/components/ConfirmModal.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { ClosePreparationModal } from './ClosePreparationModal.js';
import styles from './OpenPreparationsPanel.module.css';

interface OpenPreparationsPanelProps {
  /** Se incrementa desde fuera para forzar recarga tras una extracción. */
  reloadKey?: number;
  /** US-028: se dispara tras un cierre/abandono exitoso — el padre puede refrescar el tablero FEFO. */
  onReconciled?: () => void;
}

function useRecipeNames(): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    KitchenService.fetchAvailableRecipes()
      .then((items: RecipeItem[]) => {
        setNames(Object.fromEntries(items.map((r) => [r.id, r.name])));
      })
      .catch(() => setNames({}));
  }, []);
  return names;
}

const PreparationRow: React.FC<{
  prep: RecipePreparationSummary;
  recipeName: string;
  onClosePreparation: (id: string) => void;
  onAbandonPreparation: (id: string, recipeName: string) => void;
}> = ({ prep, recipeName, onClosePreparation, onAbandonPreparation }) => (
  <li className={styles.row}>
    <div>
      <strong>{recipeName}</strong>
      <span className="text-secondary-color fs-sm">
        {' '}· {prep.plannedPortions} porciones planificadas · abierta {new Date(prep.openedAt).toLocaleString()}
      </span>
    </div>
    <div className="flex-gap-sm">
      <button
        type="button"
        className="btn-touch btn-secondary"
        onClick={() => onAbandonPreparation(prep.id, recipeName)}
        id={`btn-abandon-prep-${prep.id}`}
      >
        Abandonar
      </button>
      <button type="button" className="btn-touch btn-primary" onClick={() => onClosePreparation(prep.id)} id={`btn-close-prep-${prep.id}`}>
        Cerrar preparación
      </button>
    </div>
  </li>
);

function useOpenPreparations(reloadKey: number) {
  const [preparations, setPreparations] = useState<RecipePreparationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    RecipePreparationsService.list('OPEN')
      .then(setPreparations)
      .catch((err) => setError(mapToUserFriendlyError(err).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  return { preparations, error, setError, loading, load };
}

interface AbandonTarget {
  id: string;
  recipeName: string;
}

function usePreparationActions(load: () => void, onReconciled?: () => void) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [abandonTarget, setAbandonTarget] = useState<AbandonTarget | null>(null);
  const [abandonError, setAbandonError] = useState<string | null>(null);

  const handleReconciled = () => {
    load();
    onReconciled?.();
  };

  const confirmAbandon = async () => {
    if (!abandonTarget) return;
    try {
      await RecipePreparationsService.abandon(abandonTarget.id);
      setAbandonTarget(null);
      handleReconciled();
    } catch (err) {
      console.error('[OpenPreparationsPanel] Error abandonando la preparación:', err);
      setAbandonError(mapToUserFriendlyError(err).message);
    }
  };

  return { closingId, setClosingId, abandonTarget, setAbandonTarget, abandonError, setAbandonError, handleReconciled, confirmAbandon };
}

function resolveClosingRecipeName(
  closingId: string | null,
  preparations: RecipePreparationSummary[],
  recipeNames: Record<string, string>
): string {
  if (!closingId) return '';
  const recipeId = preparations.find((p) => p.id === closingId)?.recipeId;
  return (recipeId && recipeNames[recipeId]) || '';
}

type Actions = ReturnType<typeof usePreparationActions>;

const PreparationActionModals: React.FC<{ preparations: RecipePreparationSummary[]; recipeNames: Record<string, string>; actions: Actions }> = ({
  preparations,
  recipeNames,
  actions,
}) => (
  <>
    <ClosePreparationModal
      preparationId={actions.closingId}
      recipeName={resolveClosingRecipeName(actions.closingId, preparations, recipeNames)}
      onClose={() => actions.setClosingId(null)}
      onReconciled={actions.handleReconciled}
    />
    <ConfirmModal
      isOpen={actions.abandonTarget !== null}
      title="Abandonar Preparación"
      message={`¿Confirmas abandonar la preparación de "${actions.abandonTarget?.recipeName}"? Los ingredientes extraídos vuelven al pool de remanentes activos, sin registrar merma.`}
      confirmLabel="Abandonar"
      onConfirm={actions.confirmAbandon}
      onCancel={() => actions.setAbandonTarget(null)}
    />
  </>
);

const PanelHeader: React.FC<{ onReload: () => void }> = ({ onReload }) => (
  <header className={styles.header}>
    <h3 className="card-title">
      <ChefHat size={18} className={styles['title-icon']} /> Preparaciones de Receta en Curso
    </h3>
    <button type="button" className="btn-touch btn-secondary" onClick={onReload} aria-label="Recargar preparaciones">
      <RefreshCw size={16} />
    </button>
  </header>
);

export const OpenPreparationsPanel: React.FC<OpenPreparationsPanelProps> = ({ reloadKey = 0, onReconciled }) => {
  const { preparations, error, loading, load } = useOpenPreparations(reloadKey);
  const recipeNames = useRecipeNames();
  const actions = usePreparationActions(load, onReconciled);
  const bannerMessage = error ?? actions.abandonError;

  if (!loading && !error && preparations.length === 0) {
    return null;
  }

  return (
    <section className={`card-dashboard ${styles.panel}`}>
      <PanelHeader onReload={load} />
      {bannerMessage && <ErrorBanner message={bannerMessage} />}
      <ul className={styles.list}>
        {preparations.map((p) => (
          <PreparationRow
            key={p.id}
            prep={p}
            recipeName={recipeNames[p.recipeId] ?? p.recipeId}
            onClosePreparation={actions.setClosingId}
            onAbandonPreparation={(id, recipeName) => {
              actions.setAbandonError(null);
              actions.setAbandonTarget({ id, recipeName });
            }}
          />
        ))}
      </ul>
      <PreparationActionModals preparations={preparations} recipeNames={recipeNames} actions={actions} />
    </section>
  );
};
