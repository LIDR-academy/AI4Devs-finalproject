import { redirect } from "next/navigation";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { currentSession } from "@/http/auth-context";

import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Crear cuenta · Clickoteca",
};

export default async function RegisterPage() {
  // Con sesión abierta, darse de alta no tiene sentido: a su superficie.
  const session = await currentSession();
  if (session) redirect(surfacePath(homeSurface(session.user.role)));

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="max-w-prose text-[var(--muted-foreground)]">
          Necesitamos una dirección de envío para mandarte los sets y una tarjeta para
          la suscripción. En este MVP el pago está simulado.
        </p>
      </div>
      <RegisterForm />
    </section>
  );
}
