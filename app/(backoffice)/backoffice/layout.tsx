/**
 * Back-office (roles OPERATOR / ADMIN). Segmentado por rol vía route group +
 * middleware de auth; su código no viaja al navegador del suscriptor sin
 * autorización (separación de superficies, ADR-0001 §2-§3).
 */
export default function BackofficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 border-b pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Back-office
        </p>
      </div>
      {children}
    </div>
  );
}
