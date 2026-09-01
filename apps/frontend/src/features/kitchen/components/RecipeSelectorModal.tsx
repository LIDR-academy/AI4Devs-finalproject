import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle, AlertTriangle } from 'lucide-react';
import { KitchenService, RecipeItem } from '../services/kitchen.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RecipeCardProps {
  recipe: RecipeItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onSelect }) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={isSelected}
    onClick={() => onSelect(recipe.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(recipe.id);
      }
    }}
    style={{
      padding: '16px',
      borderRadius: '12px',
      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-card)',
      backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-warning) 8%, transparent)' : 'var(--overlay-white-faint)',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
        {recipe.name}{' '}
        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', color: 'var(--color-primary)' }}>
          {recipe.category}
        </span>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{recipe.description}</div>
    </div>
    {isSelected && <CheckCircle size={22} style={{ color: 'var(--color-primary)' }} />}
  </div>
);

interface PortionStepperProps {
  portions: number;
  onChange: (portions: number) => void;
}

interface RecipeListProps {
  recipes: RecipeItem[];
  selectedRecipeId: string;
  onSelect: (id: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, selectedRecipeId, onSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
      Selecciona la Receta a Preparar:
    </span>
    {recipes.map((recipe) => (
      <RecipeCard key={recipe.id} recipe={recipe} isSelected={selectedRecipeId === recipe.id} onSelect={onSelect} />
    ))}
  </div>
);

interface PortionsSelectorProps {
  portions: number;
  onChange: (portions: number) => void;
}

const PortionsSelector: React.FC<PortionsSelectorProps> = ({ portions, onChange }) => (
  <div style={{ marginBottom: '24px' }}>
    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
      Número de Porciones / Platillos:
    </span>
    <PortionStepper portions={portions} onChange={onChange} />
  </div>
);

const PortionStepper: React.FC<PortionStepperProps> = ({ portions, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button
      className="btn-touch btn-secondary"
      onClick={() => onChange(Math.max(1, portions - 1))}
      style={{ width: '56px', height: '56px', fontSize: '1.4rem', fontWeight: 700 }}
    >
      -
    </button>
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '1.8rem',
        fontWeight: 800,
        color: 'var(--color-primary)',
        backgroundColor: 'var(--bg-primary)',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid var(--border-card)',
      }}
    >
      {portions} {portions === 1 ? 'porción' : 'porciones'}
    </div>
    <button
      className="btn-touch btn-secondary"
      onClick={() => onChange(portions + 1)}
      style={{ width: '56px', height: '56px', fontSize: '1.4rem', fontWeight: 700 }}
    >
      +
    </button>
  </div>
);

function useAvailableRecipes(isOpen: boolean): { recipes: RecipeItem[]; isLoadingRecipes: boolean } {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoadingRecipes(true);
    KitchenService.fetchAvailableRecipes()
      .then((data) => {
        if (!cancelled) setRecipes(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecipes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return { recipes, isLoadingRecipes };
}

interface RecipeSelectionBodyProps {
  isLoadingRecipes: boolean;
  recipes: RecipeItem[];
  selectedRecipeId: string;
  onSelectRecipe: (id: string) => void;
  portions: number;
  onPortionsChange: (portions: number) => void;
}

const RecipeSelectionBody: React.FC<RecipeSelectionBodyProps> = ({
  isLoadingRecipes,
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  portions,
  onPortionsChange,
}) => {
  if (isLoadingRecipes) {
    return (
      <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
        Cargando recetas del catálogo...
      </div>
    );
  }
  if (recipes.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
        No hay recetas dadas de alta en el catálogo todavía.
      </div>
    );
  }
  return (
    <>
      <RecipeList recipes={recipes} selectedRecipeId={selectedRecipeId} onSelect={onSelectRecipe} />
      <PortionsSelector portions={portions} onChange={onPortionsChange} />
    </>
  );
};

function usePrepareRecipe(onSuccess: () => void, onClose: () => void) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePrepareRecipe = async (selectedRecipeId: string, portions: number) => {
    if (!selectedRecipeId) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await KitchenService.consumeRecipe(selectedRecipeId, portions);
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el descuento por receta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, errorMsg, handlePrepareRecipe };
}

export const RecipeSelectorModal: React.FC<RecipeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { recipes, isLoadingRecipes } = useAvailableRecipes(isOpen);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [portions, setPortions] = useState<number>(1);
  const { isSubmitting, errorMsg, handlePrepareRecipe } = usePrepareRecipe(onSuccess, onClose);

  useEffect(() => {
    setSelectedRecipeId((current) => (recipes.some((r) => r.id === current) ? current : (recipes[0]?.id ?? '')));
  }, [recipes]);

  if (!isOpen) return null;

  return (
    <Modal maxWidth="560px" width="100%">
      <ModalHeader
        icon={<Utensils style={{ color: 'var(--color-primary)' }} />}
        title="Preparación de Recetas (Descuento FEFO)"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      {errorMsg && <ErrorBanner message={errorMsg} icon={<AlertTriangle size={18} />} />}

      <RecipeSelectionBody
        isLoadingRecipes={isLoadingRecipes}
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        onSelectRecipe={setSelectedRecipeId}
        portions={portions}
        onPortionsChange={setPortions}
      />

      <ModalFooterActions
        onCancel={onClose}
        confirmLabel="Confirmar Preparación"
        submittingLabel="Descontando FEFO..."
        confirmIcon={<Utensils size={20} />}
        confirmType="button"
        onConfirm={() => handlePrepareRecipe(selectedRecipeId, portions)}
        isSubmitting={isSubmitting}
        marginTop="0px"
      />
    </Modal>
  );
};
