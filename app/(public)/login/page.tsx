import { redirect } from "next/navigation";

import { homeSurface, surfacePath } from "@/domain/auth/roles";
import { currentSession } from "@/http/auth-context";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Iniciar sesión · Clickoteca",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Quien ya tiene sesión no debería ver el formulario: se le manda a su superficie.
  const session = await currentSession();
  if (session) redirect(surfacePath(homeSurface(session.user.role)));

  const { next } = await searchParams;

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Iniciar sesión</h1>
        <p className="text-[var(--muted-foreground)]">
          Accede con tu cuenta de Clickoteca.
        </p>
      </div>
      <LoginForm next={next} />
    </section>
  );
}
