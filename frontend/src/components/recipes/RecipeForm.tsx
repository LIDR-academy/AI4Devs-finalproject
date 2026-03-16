import { useState, useEffect } from 'react';
import { Recipe } from '@/services/recipeService';
import { useRecipeStore } from '@/store/recipeStore';

interface RecipeFormProps {
  recipe?: Recipe;
  onSuccess?: () => void;
}

export default function RecipeForm({ recipe, onSuccess }: RecipeFormProps) {
  const { addRecipe, updateRecipe } = useRecipeStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cookingTime: '',
    difficulty: 'Fácil',
    dietaryRestrictions: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      nutFree: false,
      other: []
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients.join('\n'),
        instructions: recipe.instructions.join('\n'),
        cookingTime: recipe.cookingTime.toString(),
        difficulty: recipe.difficulty
      });
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
        instructions: formData.instructions.split('\n').filter(i => i.trim()),
        cookingTime: parseInt(formData.cookingTime)
      };

      if (recipe) {
        await updateRecipe(recipe.id, recipeData);
      } else {
        await addRecipe(recipeData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error al guardar la receta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        dietaryRestrictions: {
          ...prev.dietaryRestrictions,
          [name]: checkbox.checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Nombre de tu receta"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Describe brevemente tu receta"
          />
        </div>

        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
            Ingredientes
          </label>
          <p className="text-sm text-gray-500 mb-2">Ingresa un ingrediente por línea</p>
          <textarea
            name="ingredients"
            id="ingredients"
            rows={5}
            required
            value={formData.ingredients}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ejemplo:&#10;2 tazas de harina&#10;1 huevo&#10;1/2 taza de leche"
          />
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
            Instrucciones
          </label>
          <p className="text-sm text-gray-500 mb-2">Ingresa un paso por línea</p>
          <textarea
            name="instructions"
            id="instructions"
            rows={5}
            required
            value={formData.instructions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ejemplo:&#10;Mezclar los ingredientes secos&#10;Agregar los líquidos&#10;Hornear a 180°C"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
              Tiempo de cocción (minutos)
            </label>
            <input
              type="number"
              name="cookingTime"
              id="cookingTime"
              required
              min="1"
              value={formData.cookingTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Dificultad
            </label>
            <select
              name="difficulty"
              id="difficulty"
              required
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Fácil">Fácil</option>
              <option value="Media">Media</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Restricciones Dietéticas</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="vegetarian"
                id="vegetarian"
                checked={formData.dietaryRestrictions.vegetarian}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-900">
                Vegetariano
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="vegan"
                id="vegan"
                checked={formData.dietaryRestrictions.vegan}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="vegan" className="ml-2 block text-sm text-gray-900">
                Vegano
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="glutenFree"
                id="glutenFree"
                checked={formData.dietaryRestrictions.glutenFree}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="glutenFree" className="ml-2 block text-sm text-gray-900">
                Sin Gluten
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="dairyFree"
                id="dairyFree"
                checked={formData.dietaryRestrictions.dairyFree}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="dairyFree" className="ml-2 block text-sm text-gray-900">
                Sin Lácteos
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="nutFree"
                id="nutFree"
                checked={formData.dietaryRestrictions.nutFree}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="nutFree" className="ml-2 block text-sm text-gray-900">
                Sin Frutos Secos
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            recipe ? 'Actualizar Receta' : 'Crear Receta'
          )}
        </button>
      </div>
    </form>
  );
} 