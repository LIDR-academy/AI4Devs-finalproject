/**
 * Condiciones legales. En el MVP son **texto de relleno** a propósito (PRD §4.1):
 * el flujo de aceptación es real y queda registrado, el contenido legal no lo es.
 */
export function Terms() {
  return (
    <details className="rounded-md border p-3 text-sm">
      <summary className="cursor-pointer font-medium">
        Condiciones del servicio
      </summary>
      <div className="mt-2 max-h-40 space-y-2 overflow-y-auto text-[var(--muted-foreground)]">
        <p>
          <strong>Texto de ejemplo — sin validez legal.</strong> Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
          et dolore magna aliqua.
        </p>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <p>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </div>
    </details>
  );
}
