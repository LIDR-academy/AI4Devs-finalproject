/**
 * Portal del Suscriptor (rol SUBSCRIBER). El acceso se protegerá con el middleware
 * de auth (tarea 2.1/2.2); el code-splitting por ruta de Next mantiene el código de
 * back-office fuera de este bundle (ADR-0001 §2-§3).
 */
export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Portal del suscriptor
        </p>
      </div>
      {children}
    </div>
  );
}
