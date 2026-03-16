import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdvancedSearch } from '../../components/recipes/AdvancedSearch';
import { SearchResults } from '../../components/recipes/SearchResults';
import { useSearch } from '../../hooks/useSearch';

export default function RecipesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const advanced = searchParams.get('advanced');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { results, loading, error, search } = useSearch();

  useEffect(() => {
    if (advanced === 'true') {
      setShowAdvancedSearch(true);
    }
  }, [advanced]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {showAdvancedSearch ? 'Búsqueda Avanzada' : 'Explorar Recetas'}
          </h1>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {showAdvancedSearch ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
          </button>
        </div>

        <AdvancedSearch
          onSearch={search}
          isSearching={loading}
          showAdvanced={showAdvancedSearch}
        />

        <div className="mt-8">
          <SearchResults
            results={results}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
} 