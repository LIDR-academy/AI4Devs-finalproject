import Link from "next/link";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Nueva contraseña · Clickoteca",
};

/**
 * Pantalla que consume el enlace del correo.
 *
 * **No se comprueba el token al pintar la página.** Podría hacerse —y diría antes si
 * el enlace ha caducado—, pero un enlace de correo lo abre cualquier cosa que lo
 * previsualice antes que la persona, y una comprobación aquí acabaría contando quién
 * tiene tokens vivos a quien solo pasaba por la URL. El veredicto llega al enviar,
 * que es cuando de verdad hay que darlo.
 */
export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Elige una contraseña nueva</h1>
        <p className="max-w-prose text-[var(--muted-foreground)]">
          Al guardarla se cerrarán todas las sesiones abiertas de tu cuenta, también en
          otros dispositivos.
        </p>
      </div>

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p role="alert" className="max-w-prose rounded-md border p-3 text-sm">
          Este enlace está incompleto. Vuelve a{" "}
          <Link href="/recuperar-contrasena" className="underline underline-offset-4">
            pedir uno nuevo
          </Link>
          .
        </p>
      )}
    </section>
  );
}
