import React, { useCallback, useEffect, useState } from 'react';
import { ChefHat, RefreshCw } from 'lucide-react';
import {
  RecipePreparationsService,
  RecipePreparationSummary,
} from '../services/recipePreparations.service.js';
import { RecipeItem, KitchenService } from '../services/kitchen.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import styles from './OpenPreparationsPanel.module.css';

interface OpenPreparationsPanelProps {
  /** US-028 / TK-104-FE: abre el modal de cierre. Sin este callback el botón no se muestra. */
  onClosePreparation?: (preparationId: string) => void;
  /** Se incrementa desde fuera para forzar recarga tras una extracción o un cierre. */
  reloadKey?: number;
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
  onClosePreparation?: (id: string) => void;
}> = ({ prep, recipeName, onClosePreparation }) => (
  <li className={styles.row}>
    <div>
      <strong>{recipeName}</strong>
      <span className="text-secondary-color fs-sm">
        {' '}· {prep.plannedPortions} porciones planificadas · abierta {new Date(prep.openedAt).toLocaleString()}
      </span>
    </div>
    {onClosePreparation && (
      <button type="button" className="btn-touch btn-primary" onClick={() => onClosePreparation(prep.id)} id={`btn-close-prep-${prep.id}`}>
        Cerrar preparación
      </button>
    )}
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

  return { preparations, error, loading, load };
}

export const OpenPreparationsPanel: React.FC<OpenPreparationsPanelProps> = ({ onClosePreparation, reloadKey = 0 }) => {
  const { preparations, error, loading, load } = useOpenPreparations(reloadKey);
  const recipeNames = useRecipeNames();

  if (!loading && !error && preparations.length === 0) {
    return null;
  }

  return (
    <section className={`card-dashboard ${styles.panel}`}>
      <header className={styles.header}>
        <h3 className="card-title">
          <ChefHat size={18} className={styles['title-icon']} /> Preparaciones de Receta en Curso
        </h3>
        <button type="button" className="btn-touch btn-secondary" onClick={load} aria-label="Recargar preparaciones">
          <RefreshCw size={16} />
        </button>
      </header>
      {error && <ErrorBanner message={error} />}
      <ul className={styles.list}>
        {preparations.map((p) => (
          <PreparationRow
            key={p.id}
            prep={p}
            recipeName={recipeNames[p.recipeId] ?? p.recipeId}
            onClosePreparation={onClosePreparation}
          />
        ))}
      </ul>
    </section>
  );
};
