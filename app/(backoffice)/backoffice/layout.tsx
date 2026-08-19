import { LogoutButton } from "@/components/auth/logout-button";
import { roleLabel } from "@/lib/status";
import { requireSurfacePage } from "@/http/auth-context";

/**
 * Back-office (roles OPERATOR / ADMIN). Segmentado por rol vía route group + `proxy`
 * de auth, con `requireSurfacePage` como respaldo en el propio render (ADR-0001
 * §2-§3): su código no viaja al navegador del suscriptor sin autorización.
 */
export default async function BackofficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSurfacePage("backoffice");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Back-office
          </p>
          <p className="text-sm font-medium">
            {user.fullName} · {roleLabel(user.role)}
          </p>
        </div>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
