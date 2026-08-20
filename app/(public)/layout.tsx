import Link from "next/link";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { currentSession } from "@/http/auth-context";

/**
 * Superficie pública (visitante no autenticado): landing, proyección pública del
 * catálogo, planes/condiciones y alta. No expone disponibilidad ni cola (design.md
 * D13; spec accounts-roles "Acceso público no autenticado").
 */
export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // La superficie es pública, pero quien la mira puede tener sesión: desde que existe
  // la ficha de set, un suscriptor navega el catálogo **estando dentro**. Ofrecerle
  // "Acceder" ahí le manda a un formulario que no necesita.
  const session = await currentSession();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Clickoteca
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/catalogo" className="hover:underline">
            Catálogo
          </Link>
          <Link href="/planes" className="hover:underline">
            Planes
          </Link>
          {/* Sin sesión, a `/login` y no a `/portal`: el proxy acabaría redirigiendo
              igual, pero mandar a alguien a una ruta protegida para que rebote es un
              rodeo. Con sesión, a **su** superficie —la del rol—, que es de donde ha
              salido para venir a mirar el catálogo. */}
          {session ? (
            <Link href={surfacePath(homeSurface(session.user.role))} className="hover:underline">
              {session.user.role === "SUBSCRIBER" ? "Mi portal" : "Back-office"}
            </Link>
          ) : (
            <Link href="/login" className="hover:underline">
              Acceder
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 py-8">{children}</main>
      <footer className="py-6 text-sm text-[var(--muted-foreground)]">
        © Clickoteca — proyecto AI4Devs.
      </footer>
    </div>
  );
}
