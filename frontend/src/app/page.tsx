import { fetchProducts } from '../lib/api-client';
import { ProductGrid } from '../components/catalog/product-grid';
import { ResultsCounter } from '../components/catalog/results-counter';
import { CatalogEmptyState } from '../components/catalog/empty-state';
import { CatalogErrorState } from '../components/catalog/error-state';

export const metadata = {
  title: 'RunMarket — Productos para Running',
  description: 'Descubre zapatillas, ropa técnica y accesorios para running filtrados por tu perfil de corredor.',
};

export default async function CatalogPage() {
  let data: { products: Awaited<ReturnType<typeof fetchProducts>>['products']; total: number };

  try {
    data = await fetchProducts();
  } catch {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Productos para Running</h1>
        <CatalogErrorState />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Productos para Running</h1>
      <ResultsCounter total={data.total} />
      {data.products.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <ProductGrid products={data.products} />
      )}
    </main>
  );
}
