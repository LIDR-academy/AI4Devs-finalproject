'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              Error de la aplicación
            </h1>
            <p className="text-sm text-slate-600">
              No se pudo cargar la página. Recarga o intenta de nuevo.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
