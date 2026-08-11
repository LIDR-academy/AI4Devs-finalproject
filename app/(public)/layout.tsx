import Link from "next/link";

/**
 * Superficie pública (visitante no autenticado): landing, proyección pública del
 * catálogo, planes/condiciones y alta. No expone disponibilidad ni cola (design.md
 * D13; spec accounts-roles "Acceso público no autenticado").
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Clickoteca
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/planes" className="hover:underline">
            Planes
          </Link>
          <Link href="/portal" className="hover:underline">
            Acceder
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-8">{children}</main>
      <footer className="py-6 text-sm text-[var(--muted-foreground)]">
        © Clickoteca — proyecto AI4Devs.
      </footer>
    </div>
  );
}
