import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Bot, AlertTriangle, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import {
  RecipesService,
  RescueRecipeProposal,
  RescueSuggestionsResponse,
} from '../services/recipes.service.js';
import styles from './RescueRecipesModal.module.css';

interface RescueRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: () => void;
}

const SourceBadge: React.FC<{ source: RescueSuggestionsResponse['source'] }> = ({ source }) => {
  if (source === 'HEURISTIC') {
    return (
      <div className={styles['source-badge-heuristic']} role="status">
        <Sparkles size={16} />
        <span>Motor Heurístico Local (Sin conexión externa activa)</span>
      </div>
    );
  }
  return (
    <div className={styles['source-badge-ai']} role="status">
      <Bot size={16} />
      <span>Sugerencias Inteligentes Generadas por IA ({source})</span>
    </div>
  );
};

interface ProposalCardProps {
  proposal: RescueRecipeProposal;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, isSaving, isSaved, onSave }) => (
  <article className={styles['proposal-card']}>
    <div className={styles['card-top']}>
      <h3 className={styles['recipe-name']}>{proposal.name}</h3>
      <div className={styles['meta-tags']}>
        <span className={styles['category-badge']}>{proposal.category}</span>
        <span className={styles['category-badge']}>{proposal.estimatedPortions} porciones</span>
        <span className={styles['waste-saved-badge']}>
          <Sparkles size={12} />
          {proposal.preventedWasteEstimate} merma prevenida
        </span>
      </div>
    </div>

    <p className={styles['recipe-desc']}>{proposal.description}</p>

    <div className={styles['ingredients-list']}>
      <div className={styles['ingredients-title']}>Ingredientes Requeridos</div>
      {proposal.ingredients.map((ing) => (
        <div key={`${proposal.name}-${ing.insumoId}`} className={styles['ingredient-row']}>
          <span>
            {ing.insumoName}: <strong>{ing.quantity} {ing.unit}</strong>
          </span>
          {ing.isAtRisk && (
            <span className={styles['risk-chip']}>
              <AlertTriangle size={10} />
              En riesgo (&lt;48h)
            </span>
          )}
        </div>
      ))}
    </div>

    <div className={styles['card-actions']}>
      {isSaved ? (
        <span className={styles['saved-label']}>
          <CheckCircle2 size={18} />
          Guardada en Catálogo
        </span>
      ) : (
        <button
          type="button"
          className={`btn-touch btn-primary flex-center flex-gap-xs ${styles['save-btn']}`}
          disabled={isSaving}
          onClick={onSave}
          aria-label={`Guardar receta ${proposal.name} en el catálogo`}
        >
          <Save size={18} />
          {isSaving ? 'Guardando...' : 'Guardar en Catálogo'}
        </button>
      )}
    </div>
  </article>
);

function useRescueRecipes(isOpen: boolean, onRecipeSaved?: () => void) {
  const [data, setData] = useState<RescueSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await RecipesService.suggestRescueRecipes();
      setData(res);
      setSavedIndexes(new Set());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al obtener sugerencias de rescate';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen, loadSuggestions]);

  const handleSaveToCatalog = useCallback(
    async (proposal: RescueRecipeProposal, index: number) => {
      setSavingIndex(index);
      setError(null);
      try {
        await RecipesService.createRecipe({
          name: proposal.name,
          category: proposal.category,
          description: proposal.description,
          ingredients: proposal.ingredients.map((i) => ({
            insumoId: i.insumoId,
            quantity: i.quantity,
          })),
        });
        setSavedIndexes((prev) => new Set(prev).add(index));
        setSuccessMessage(`Receta "${proposal.name}" agregada exitosamente al catálogo.`);
        onRecipeSaved?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al guardar la receta en el catálogo';
        setError(msg);
      } finally {
        setSavingIndex(null);
      }
    },
    [onRecipeSaved]
  );

  return {
    data,
    isLoading,
    error,
    savedIndexes,
    savingIndex,
    successMessage,
    loadSuggestions,
    handleSaveToCatalog,
  };
}

interface ProposalsGridProps {
  proposals?: RescueRecipeProposal[];
  savingIndex: number | null;
  savedIndexes: Set<number>;
  onSave: (proposal: RescueRecipeProposal, idx: number) => void;
}

const ProposalsGrid: React.FC<ProposalsGridProps> = ({ proposals, savingIndex, savedIndexes, onSave }) => (
  <div className={styles['recipe-cards-grid']}>
    {proposals?.map((proposal, idx) => (
      <ProposalCard
        key={`${proposal.name}-${idx}`}
        proposal={proposal}
        isSaving={savingIndex === idx}
        isSaved={savedIndexes.has(idx)}
        onSave={() => onSave(proposal, idx)}
      />
    ))}
    {proposals && proposals.length === 0 && (
      <div className="flex-center p-8 text-secondary-color">
        No hay remanentes en riesgo crítico en este momento. La cocina opera en niveles óptimos.
      </div>
    )}
  </div>
);

export const RescueRecipesModal: React.FC<RescueRecipesModalProps> = ({
  isOpen,
  onClose,
  onRecipeSaved,
}) => {
  const {
    data,
    isLoading,
    error,
    savedIndexes,
    savingIndex,
    successMessage,
    loadSuggestions,
    handleSaveToCatalog,
  } = useRescueRecipes(isOpen, onRecipeSaved);

  if (!isOpen) return null;

  return (
    <Modal size="lg">
      <ModalHeader
        icon={<Sparkles className="text-primary-color" size={24} />}
        title="Recetas de Aprovechamiento Anti-Desperdicio"
        size="lg"
        onClose={onClose}
      />

      <div className={styles.container}>
        {successMessage && <SuccessFeedbackBanner message={successMessage} />}
        {error && <ErrorBanner message={error} />}

        {data && (
          <div className={styles['source-bar']}>
            <SourceBadge source={data.source} />
            <button
              type="button"
              className="btn-touch btn-secondary flex-center flex-gap-xs"
              onClick={loadSuggestions}
              disabled={isLoading}
              title="Volver a generar sugerencias"
            >
              <RefreshCw size={16} />
              <span className="fs-xs">Regenerar</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex-center p-8 flex-column flex-gap-sm">
            <Sparkles size={32} className="text-primary-color animate-spin" />
            <span className="fs-md text-secondary-color">
              Analizando remanentes en cocina y elaborando propuestas de rescate...
            </span>
          </div>
        ) : (
          <ProposalsGrid
            proposals={data?.proposals}
            savingIndex={savingIndex}
            savedIndexes={savedIndexes}
            onSave={handleSaveToCatalog}
          />
        )}
      </div>
    </Modal>
  );
};
