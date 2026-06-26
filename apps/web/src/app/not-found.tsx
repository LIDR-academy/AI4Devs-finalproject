import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Página no encontrada</h1>
        <p className="text-sm text-slate-600">
          La ruta solicitada no existe o ya no está disponible.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
