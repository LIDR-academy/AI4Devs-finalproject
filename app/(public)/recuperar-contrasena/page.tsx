import Link from "next/link";
import { redirect } from "next/navigation";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { currentSession } from "@/http/auth-context";

import { RequestResetForm } from "./request-reset-form";

export const metadata = {
  title: "Recuperar contraseña · Clickoteca",
};

export default async function RecuperarContrasenaPage() {
  // Con la sesión abierta no hay nada que recuperar: a su superficie.
  const session = await currentSession();
  if (session) redirect(surfacePath(homeSurface(session.user.role)));

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Recuperar contraseña</h1>
        <p className="max-w-prose text-[var(--muted-foreground)]">
          Dinos con qué dirección entras y te mandamos un enlace para elegir una
          contraseña nueva. El enlace caduca en una hora y solo se puede usar una vez.
        </p>
      </div>

      <RequestResetForm />

      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/login" className="underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </p>
    </section>
  );
}
