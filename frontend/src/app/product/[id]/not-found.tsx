import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      <p className="text-gray-500 mb-8">
        El producto que buscas no existe o ha sido eliminado.
      </p>
      <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
        Volver al catálogo
      </Link>
    </main>
  );
}
