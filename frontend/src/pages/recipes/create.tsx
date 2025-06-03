import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/recipes/RecipeForm';

export default function CreateRecipePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Crear Nueva Receta
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Comparte tu receta con la comunidad
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-6">
              <div className="text-indigo-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de la Receta
                </h3>
                <p className="text-sm text-gray-500">
                  Completa todos los campos para crear tu receta
                </p>
              </div>
            </div>

            <RecipeForm
              onSuccess={() => {
                router.push('/recipes');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 