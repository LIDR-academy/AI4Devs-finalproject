import React, { useState } from 'react';
import { Utensils, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { KitchenService } from '../services/kitchen.service.js';

interface RecipeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredientsSummary: string;
}

const DEFAULT_RECIPES: RecipeItem[] = [
  {
    id: 'rec-pizza-margarita',
    name: 'Pizza Margarita',
    category: 'PIZZA',
    description: '1 Masa + 0.15 kg Queso Mozzarella + 0.10 kg Salsa Pomodoro',
    ingredientsSummary: 'Insumos: Queso Mozzarella, Salsa, Masa',
  },
  {
    id: 'rec-pasta-pomodoro',
    name: 'Pasta Pomodoro',
    category: 'PASTA',
    description: '0.20 kg Pasta Fettuccine + 0.15 kg Salsa Pomodoro',
    ingredientsSummary: 'Insumos: Pasta, Salsa Pomodoro',
  },
  {
    id: 'rec-ensalada-cesar',
    name: 'Ensalada César',
    category: 'ENSALADA',
    description: '0.15 kg Lechuga + 0.10 kg Pollo + 0.05 kg Aderezo',
    ingredientsSummary: 'Insumos: Lechuga, Pollo, Aderezo',
  },
];

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecipeSelectorModal: React.FC<RecipeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('rec-pizza-margarita');
  const [portions, setPortions] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrepareRecipe = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await KitchenService.consumeRecipe(selectedRecipeId, portions);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el descuento por receta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="card-dashboard"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Utensils style={{ color: 'var(--color-primary)' }} /> Preparación de Recetas (Descuento FEFO)
          </h2>
          <button className="btn-touch btn-secondary" onClick={onClose} style={{ width: '40px', height: '40px', padding: 0, minWidth: 'auto' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(255, 42, 42, 0.15)', border: '1px solid var(--color-danger)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        {/* Seleccion de Recetas Tàctil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Selecciona la Receta a Preparar:
          </label>

          {DEFAULT_RECIPES.map((recipe) => {
            const isSelected = selectedRecipeId === recipe.id;
            return (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipeId(recipe.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-card)',
                  backgroundColor: isSelected ? 'rgba(0, 210, 190, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {recipe.name} <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', color: 'var(--color-primary)' }}>{recipe.category}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {recipe.description}
                  </div>
                </div>
                {isSelected && <CheckCircle size={22} style={{ color: 'var(--color-primary)' }} />}
              </div>
            );
          })}
        </div>

        {/* Selector Tactil de Porciones */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Número de Porciones / Platillos:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn-touch btn-secondary"
              onClick={() => setPortions((p) => Math.max(1, p - 1))}
              style={{ width: '56px', height: '56px', fontSize: '1.4rem', fontWeight: 700 }}
            >
              -
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', backgroundColor: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              {portions} {portions === 1 ? 'porción' : 'porciones'}
            </div>
            <button
              className="btn-touch btn-secondary"
              onClick={() => setPortions((p) => p + 1)}
              style={{ width: '56px', height: '56px', fontSize: '1.4rem', fontWeight: 700 }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-touch btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            className="btn-touch btn-primary"
            onClick={handlePrepareRecipe}
            disabled={isSubmitting}
            style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Utensils size={20} />
            {isSubmitting ? 'Descontando FEFO...' : 'Confirmar Preparación'}
          </button>
        </div>
      </div>
    </div>
  );
};
