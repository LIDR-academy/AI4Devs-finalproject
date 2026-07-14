import Link from "next/link";

import { ClientForm } from "@/app/clients/new/client-form";
import { requireActiveUser } from "@/lib/auth/require-active-user";

export default async function NewClientPage() {
  const currentUser = await requireActiveUser();

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="text-sm font-medium text-stone-600 underline">
          Volver al panel
        </Link>

        <header className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Ticket T-03
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Crear cliente
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            El cliente queda en estado prospecto y se asigna automáticamente al usuario que lo crea. Usuario actual: {currentUser.profile?.fullName ?? currentUser.authUser.email}.
          </p>
        </header>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm">
          <ClientForm />
        </section>
      </div>
    </main>
  );
}
