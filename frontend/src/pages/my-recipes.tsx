import { useEffect, useState } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { Recipe } from '@/services/recipeService';
import { useAuthStore } from '@/store/authStore';

export default function MyRecipesPage() {
  const { user } = useAuthStore();
  const { recipes, loading, error, fetchRecipes } = useRecipeStore();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    if (user && recipes) {
      setMyRecipes(recipes.filter((r: any) => r.createdBy === user.id));
    }
  }, [recipes, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Recetas</h1>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando tus recetas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : myRecipes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No has creado recetas aún</h3>
            <p className="mt-1 text-sm text-gray-500">¡Crea tu primera receta y compártela con la comunidad!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {myRecipes.map((recipe) => {
              const r = recipe as any;
              return (
                <div key={r.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-2">{r.title}</h2>
                  <p className="mb-2 text-gray-700"><span className="font-semibold">Descripción:</span> {r.description}</p>
                  <div className="mb-2">
                    <span className="font-semibold">Ingredientes:</span>
                    <ul className="list-disc list-inside ml-4">
                      {r.ingredients && r.ingredients.map((ing: string, idx: number) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Instrucciones:</span>
                    <ol className="list-decimal list-inside ml-4">
                      {r.instructions && r.instructions.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      ⏱️ {r.cookingTime} min
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Dificultad: {r.difficulty}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Porciones: {r.servings}
                    </span>
                  </div>
                  {r.dietaryRestrictions && (
                    <div className="mb-2">
                      <span className="font-semibold">Restricciones dietéticas:</span>
                      <ul className="list-disc list-inside ml-4">
                        {Object.entries(r.dietaryRestrictions)
                          .filter(([_, value]) => value === true)
                          .map(([key]) => (
                            <li key={key}>{key}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.title} className="mt-4 rounded-lg max-h-64 object-cover" />
                  )}
                  <div className="text-xs text-gray-400 mt-4">Creada el {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 