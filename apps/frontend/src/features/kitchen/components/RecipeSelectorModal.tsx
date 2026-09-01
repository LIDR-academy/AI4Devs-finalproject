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
    className={isSelected ? 'recipe-card--selected' : 'recipe-card'}
  >
    <div>
      <div className="fw-bold fs-base">
        {recipe.name}{' '}
        <span className="recipe-category-badge">
          {recipe.category}
        </span>
      </div>
      <div className="fs-sm text-secondary-color mt-1">{recipe.description}</div>
    </div>
    {isSelected && <CheckCircle size={22} className="text-primary-color" />}
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
  <div className="flex-column gap-3 mb-5">
    <span className="d-block fs-md fw-semibold text-secondary-color">
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
  <div className="mb-6">
    <span className="fs-md fw-semibold text-secondary-color d-block mb-2">
      Número de Porciones / Platillos:
    </span>
    <PortionStepper portions={portions} onChange={onChange} />
  </div>
);

const PortionStepper: React.FC<PortionStepperProps> = ({ portions, onChange }) => (
  <div className="flex-gap-md">
    <button
      className="btn-touch btn-secondary icon-badge-md fs-xl fw-bold"
      onClick={() => onChange(Math.max(1, portions - 1))}
    >
      -
    </button>
    <div className="portion-display">
      {portions} {portions === 1 ? 'porción' : 'porciones'}
    </div>
    <button
      className="btn-touch btn-secondary icon-badge-md fs-xl fw-bold"
      onClick={() => onChange(portions + 1)}
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
      <div className="recipe-body-message">
        Cargando recetas del catálogo...
      </div>
    );
  }
  if (recipes.length === 0) {
    return (
      <div className="recipe-body-message">
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
    <Modal size="md">
      <ModalHeader
        icon={<Utensils className="text-primary-color" />}
        title="Preparación de Recetas (Descuento FEFO)"
        size="lg"
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
        noMarginTop
      />
    </Modal>
  );
};
