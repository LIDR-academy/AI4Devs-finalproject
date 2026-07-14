import Link from "next/link";

import { signInWithPassword } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    reason?: string;
  }>;
};

const reasonMessages: Record<string, string> = {
  inactive: "Tu usuario está inactivo. Contacta a un administrador.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;
  const reasonMessage = params.reason ? reasonMessages[params.reason] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
          CRM Importadora
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          Acceso interno
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Inicia sesión con tu cuenta para acceder a clientes, proveedores, productos y órdenes.
        </p>

        {reasonMessage ? (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {reasonMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {errorMessage}
          </p>
        ) : null}

        <form action={signInWithPassword} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-stone-800">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none ring-0 transition focus:border-stone-950"
              type="email"
              name="email"
              placeholder="nombre@empresa.com"
              required
            />
          </label>

          <label className="block text-sm font-medium text-stone-800">
            Contraseña
            <input
              className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none ring-0 transition focus:border-stone-950"
              type="password"
              name="password"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-500">
          Primera configuración pendiente. Usa usuarios de Supabase Auth y crea su perfil interno en la base de datos.
        </p>

        <Link className="mt-4 inline-flex text-sm font-medium text-stone-700 underline" href="/">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}