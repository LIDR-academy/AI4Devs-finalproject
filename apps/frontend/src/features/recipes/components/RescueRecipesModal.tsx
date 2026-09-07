import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Bot, AlertTriangle, CheckCircle2, Save, RefreshCw, BookOpen, ShieldCheck, Lock } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import {
  RecipesService,
  RescueRecipeProposal,
  RescueSuggestionsResponse,
} from '../services/recipes.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import styles from './RescueRecipesModal.module.css';

const DEFAULT_CURRENCY_SYMBOL = '$';
type RescueMode = 'CATALOG' | 'CREATIVE';

interface RescueRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: () => void;
}

const SourceBadge: React.FC<{ source: RescueSuggestionsResponse['source'] }> = ({ source }) => {
  if (source === 'CATALOG') {
    return (
      <div className={styles['source-badge-catalog']} role="status">
        <ShieldCheck size={16} />
        <span>Catálogo Propio (100% Local / Zero Data Leakage)</span>
      </div>
    );
  }
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

const PreventedWasteBadge: React.FC<{ cost: string | null; currencySymbol: string }> = ({ cost, currencySymbol }) => (
  <span className={styles['waste-saved-badge']}>
    <Sparkles size={12} />
    {cost !== null ? `${currencySymbol}${cost} de merma evitada` : 'Valor de merma no disponible'}
  </span>
);

interface ProposalCardProps {
  proposal: RescueRecipeProposal;
  currencySymbol: string;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, currencySymbol, isSaving, isSaved, onSave }) => (
  <article className={styles['proposal-card']}>
    <div className={styles['card-top']}>
      <h3 className={styles['recipe-name']}>{proposal.name}</h3>
      <div className={styles['meta-tags']}>
        <span className={styles['category-badge']}>{proposal.category}</span>
        <span className={styles['category-badge']}>{proposal.estimatedPortions} porciones</span>
        <PreventedWasteBadge cost={proposal.preventedWasteCost} currencySymbol={currencySymbol} />
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

function useCurrencySymbol(isOpen: boolean): string {
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_CURRENCY_SYMBOL);
  useEffect(() => {
    if (!isOpen) return;
    SettingsService.fetchSettings()
      .then((settings) => setCurrencySymbol(settings.currencySymbol || DEFAULT_CURRENCY_SYMBOL))
      .catch(() => setCurrencySymbol(DEFAULT_CURRENCY_SYMBOL));
  }, [isOpen]);
  return currencySymbol;
}

function useCatalogSaver(onRecipeSaved?: () => void) {
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetSaved = useCallback(() => setSavedIndexes(new Set()), []);

  const handleSaveToCatalog = useCallback(
    async (proposal: RescueRecipeProposal, index: number) => {
      setSavingIndex(index);
      setSaveError(null);
      try {
        await RecipesService.createRecipe({
          name: proposal.name,
          category: proposal.category,
          description: proposal.description,
          ingredients: proposal.ingredients.map((i) => ({ insumoId: i.insumoId, quantity: i.quantity })),
        });
        setSavedIndexes((prev) => new Set(prev).add(index));
        setSuccessMessage(`Receta "${proposal.name}" agregada exitosamente al catálogo.`);
        onRecipeSaved?.();
      } catch (err: unknown) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar la receta en el catálogo');
      } finally {
        setSavingIndex(null);
      }
    },
    [onRecipeSaved]
  );

  return { savedIndexes, savingIndex, successMessage, saveError, resetSaved, handleSaveToCatalog };
}

function useRescueRecipes(isOpen: boolean, onRecipeSaved?: () => void) {
  const [mode, setMode] = useState<RescueMode>('CATALOG');
  const [data, setData] = useState<RescueSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const currencySymbol = useCurrencySymbol(isOpen);
  const saver = useCatalogSaver(onRecipeSaved);
  const { resetSaved } = saver;

  const loadSuggestions = useCallback(
    async (targetMode?: RescueMode) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        setData(await RecipesService.suggestRescueRecipes(targetMode ?? mode));
        resetSaved();
      } catch (err: unknown) {
        setLoadError(err instanceof Error ? err.message : 'Error al obtener sugerencias de rescate');
      } finally {
        setIsLoading(false);
      }
    },
    [mode, resetSaved]
  );

  useEffect(() => {
    if (isOpen) loadSuggestions();
  }, [isOpen, loadSuggestions]);

  return {
    mode,
    setMode,
    data,
    isLoading,
    error: loadError ?? saver.saveError,
    currencySymbol,
    savedIndexes: saver.savedIndexes,
    savingIndex: saver.savingIndex,
    successMessage: saver.successMessage,
    loadSuggestions,
    handleSaveToCatalog: saver.handleSaveToCatalog,
  };
}

interface ModeSelectorProps {
  mode: RescueMode;
  isLoading: boolean;
  onSelect: (mode: RescueMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, isLoading, onSelect }) => (
  <div className={styles['mode-selector']} role="tablist" aria-label="Modo de generación de recetas">
    <button
      type="button"
      role="tab"
      aria-selected={mode === 'CATALOG'}
      className={`${styles['mode-tab']} ${mode === 'CATALOG' ? styles['mode-tab-active'] : ''}`}
      onClick={() => onSelect('CATALOG')}
      disabled={isLoading}
    >
      <BookOpen size={18} />
      <span>Recetas del Restaurante (100% Privado)</span>
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={mode === 'CREATIVE'}
      className={`${styles['mode-tab']} ${mode === 'CREATIVE' ? styles['mode-tab-active'] : ''}`}
      onClick={() => onSelect('CREATIVE')}
      disabled={isLoading}
    >
      <Sparkles size={18} />
      <span>Generación Creativa (IA)</span>
    </button>
  </div>
);

const SourceBar: React.FC<{ source: RescueSuggestionsResponse['source']; isLoading: boolean; onRegenerate: () => void }> = ({
  source,
  isLoading,
  onRegenerate,
}) => (
  <div className={styles['source-bar']}>
    <SourceBadge source={source} />
    <button
      type="button"
      className="btn-touch btn-secondary flex-center flex-gap-xs"
      onClick={onRegenerate}
      disabled={isLoading}
      title="Volver a generar sugerencias"
    >
      <RefreshCw size={16} />
      <span className="fs-xs">Regenerar</span>
    </button>
  </div>
);

interface ProposalsGridProps {
  proposals?: RescueRecipeProposal[];
  currencySymbol: string;
  savingIndex: number | null;
  savedIndexes: Set<number>;
  onSave: (proposal: RescueRecipeProposal, idx: number) => void;
  mode: RescueMode;
  onSwitchToCreative: () => void;
}

const ProposalsGrid: React.FC<ProposalsGridProps> = ({
  proposals,
  currencySymbol,
  savingIndex,
  savedIndexes,
  onSave,
  mode,
  onSwitchToCreative,
}) => (
  <div className={styles['recipe-cards-grid']}>
    {proposals?.map((proposal, idx) => (
      <ProposalCard
        key={`${proposal.name}-${idx}`}
        proposal={proposal}
        currencySymbol={currencySymbol}
        isSaving={savingIndex === idx}
        isSaved={savedIndexes.has(idx)}
        onSave={() => onSave(proposal, idx)}
      />
    ))}
    {proposals && proposals.length === 0 && (
      <div className="flex-center p-8 flex-column flex-gap-sm text-secondary-color">
        {mode === 'CATALOG' ? (
          <>
            <p>No se encontraron recetas en tu catálogo para los insumos en riesgo, o no hay remanentes en riesgo crítico en este momento.</p>
            <button type="button" className="btn-touch btn-secondary flex-center flex-gap-xs" onClick={onSwitchToCreative}>
              <Sparkles size={16} />
              <span>Generar Nuevas Propuestas con Modo Creativo (IA)</span>
            </button>
          </>
        ) : (
          <p>No hay remanentes en riesgo crítico en este momento. La cocina opera en niveles óptimos.</p>
        )}
      </div>
    )}
  </div>
);

export const RescueRecipesModal: React.FC<RescueRecipesModalProps> = ({ isOpen, onClose, onRecipeSaved }) => {
  const rescue = useRescueRecipes(isOpen, onRecipeSaved);

  if (!isOpen) return null;

  const selectMode = (target: RescueMode) => {
    rescue.setMode(target);
    rescue.loadSuggestions(target);
  };

  return (
    <Modal size="lg">
      <ModalHeader
        icon={<Sparkles className="text-primary-color" size={24} />}
        title="Recetas de Aprovechamiento Anti-Desperdicio"
        size="lg"
        onClose={onClose}
      />

      <div className={styles.container}>
        {rescue.successMessage && <SuccessFeedbackBanner message={rescue.successMessage} />}
        {rescue.error && <ErrorBanner message={rescue.error} />}

        <ModeSelector mode={rescue.mode} isLoading={rescue.isLoading} onSelect={selectMode} />

        {rescue.mode === 'CATALOG' && (
          <div className={styles['privacy-notice']} role="status">
            <Lock size={16} />
            <span>
              <strong>Privacidad Garantizada:</strong> Las recetas y fórmulas del restaurante se procesan únicamente en este servidor. Ningún dato culinario es compartido con proveedores externos de IA.
            </span>
          </div>
        )}

        {rescue.data && (
          <SourceBar source={rescue.data.source} isLoading={rescue.isLoading} onRegenerate={() => rescue.loadSuggestions()} />
        )}

        {rescue.isLoading ? (
          <div className="flex-center p-8 flex-column flex-gap-sm">
            <Sparkles size={32} className="text-primary-color animate-spin" />
            <span className="fs-md text-secondary-color">
              Analizando remanentes en cocina y elaborando propuestas de rescate...
            </span>
          </div>
        ) : (
          <ProposalsGrid
            proposals={rescue.data?.proposals}
            currencySymbol={rescue.currencySymbol}
            savingIndex={rescue.savingIndex}
            savedIndexes={rescue.savedIndexes}
            onSave={rescue.handleSaveToCatalog}
            mode={rescue.mode}
            onSwitchToCreative={() => selectMode('CREATIVE')}
          />
        )}
      </div>
    </Modal>
  );
};
