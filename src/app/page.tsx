import Link from "next/link";

import type { UserRole } from "@prisma/client";

import { canManageOrders, canManageProducts, canManageSuppliers, canViewAllClients } from "@/lib/auth/roles";
import { requireActiveUser } from "@/lib/auth/require-active-user";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PARTNER: "Empresario / Socio",
  SELLER: "Vendedor",
};

export default async function Home() {
  const currentUser = await requireActiveUser();
  const visibleActions = [
    { href: "/clients", label: canViewAllClients(currentUser.role) ? "Ver clientes" : "Mis clientes", visible: true, style: "ghost" as const },
    { href: "/clients/new", label: "Crear cliente", visible: true, style: "primary" as const },
    { href: "/suppliers", label: "Ver proveedores", visible: canManageSuppliers(currentUser.role), style: "ghost" as const },
    { href: "/products", label: "Ver productos", visible: canManageProducts(currentUser.role), style: "ghost" as const },
    { href: "/orders", label: "Ver órdenes", visible: canManageOrders(currentUser.role), style: "ghost" as const },
    { href: "/login", label: "Ir al login", visible: true, style: "warning" as const },
  ];

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-16 text-stone-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-8 shadow-2xl shadow-amber-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Ticket T-01
          </p>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">CRM Importadora</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                La base del proyecto ya resuelve autenticación con Supabase, perfil interno por rol y bloqueo de usuarios inactivos.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-stone-200">
              <p className="font-medium text-white">Sesión activa</p>
              <p className="mt-1">{currentUser.profile?.fullName ?? currentUser.authUser.email}</p>
              <p className="mt-1 text-stone-400">
                {currentUser.role ? roleLabels[currentUser.role] : "Perfil pendiente de configurar"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Autenticación</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              El login usa Supabase Auth con email y contraseña y resuelve el usuario autenticado desde el backend.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Perfiles y roles</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              La tabla `user_profiles` define nombre, rol y estado activo para controlar permisos internos.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Acceso seguro</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Si un usuario no tiene sesión o está inactivo, la app lo devuelve al flujo de acceso.
            </p>
          </article>
        </section>

        <section className="flex flex-wrap items-center gap-4">
          {visibleActions.filter((action) => action.visible).map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.style === "primary"
                  ? "rounded-full border border-emerald-300/40 bg-emerald-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-emerald-200"
                  : action.style === "warning"
                    ? "rounded-full border border-amber-300/40 bg-amber-300 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
                    : "rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
              }
            >
              {action.label}
            </Link>
          ))}
          <a
            href="/docs/mvp-backlog.md"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
          >
            Ver backlog MVP
          </a>
        </section>
      </div>
    </main>
  );
}
