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
  searchParams: Promise<{ next?: string; restablecida?: string }>;
}) {
  // Quien ya tiene sesión no debería ver el formulario: se le manda a su superficie.
  const session = await currentSession();
  if (session) redirect(surfacePath(homeSurface(session.user.role)));

  const { next, restablecida } = await searchParams;

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Iniciar sesión</h1>
        <p className="text-[var(--muted-foreground)]">
          Accede con tu cuenta de Clickoteca.
        </p>
      </div>
      {restablecida ? (
        // Llega desde `/restablecer-contrasena`, que cierra todas las sesiones: sin
        // este aviso, encontrarse el formulario de acceso parecería que algo falló.
        <p role="status" className="max-w-prose rounded-md border p-3 text-sm">
          Tu contraseña ha cambiado. Entra con la nueva.
        </p>
      ) : null}
      <LoginForm next={next} />
    </section>
  );
}
