import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRecipeStore } from '@/store/recipeStore';
import RecipeForm from '@/components/recipes/RecipeForm';
import { Recipe } from '@/services/recipeService';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { getRecipe } = useRecipeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const data = await getRecipe(id);
          setRecipe(data);
        } catch (error) {
          console.error('Error al cargar la receta:', error);
          router.push('/recipes');
        } finally {
          setLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [id, getRecipe, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Receta no encontrada</h2>
            <p className="mt-2 text-sm text-gray-500">
              La receta que buscas no existe o no tienes permiso para verla.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/recipes')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Volver a las recetas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Editar Receta</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
            <RecipeForm
              recipe={recipe}
              onSuccess={() => {
                setIsEditing(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                Tiempo de cocción: {recipe.cookingTime} minutos | Dificultad: {recipe.difficulty}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Editar
            </button>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">{recipe.description}</p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredientes</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instrucciones</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="text-gray-700">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 