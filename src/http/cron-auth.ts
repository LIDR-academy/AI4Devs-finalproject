import { timingSafeEqual } from "node:crypto";

/**
 * Autorización del disparador de trabajos periódicos (`/api/cron/:job`).
 *
 * El endpoint existe porque un despliegue sin procesos de vida larga no puede correr
 * `scheduler/index.ts`: alguien de fuera —Vercel Cron, un `systemd timer`, un
 * `curl`— tiene que mirar el reloj. Eso convierte un trabajo interno en una **URL
 * pública**, y sin candado cualquiera podría dispararla en bucle: caducar ofertas
 * antes de tiempo no, porque el plazo lo decide la base, pero sí castigarla y llenar
 * de recordatorios el buzón de quien está esperando.
 *
 * El contrato es el de Vercel Cron —`Authorization: Bearer $CRON_SECRET`— porque es el
 * que ya emite el disparador de serie, y un `systemd timer` lo replica con una línea.
 *
 * **Se cierra por defecto:** sin `CRON_SECRET` configurado no se ejecuta nada. Un
 * despliegue al que se le olvidó la variable no puede acabar con el endpoint abierto,
 * que es exactamente lo que pasaría si "sin secreto" significara "sin comprobación".
 * Ese caso responde **404 y no 503**: sin secreto, aquí no hay endpoint que valga —y de
 * paso no confirma a nadie que exista un trabajo con ese nombre—. El `detail` sí lo
 * explica, porque quien está depurando su propio despliegue necesita saberlo.
 */

export type CronAuth =
  | { ok: true }
  | { ok: false; code: "NOT_FOUND" | "UNAUTHENTICATED"; detail: string };

/** Compara sin filtrar por tiempo cuántos caracteres coincidían. */
function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // `timingSafeEqual` exige la misma longitud; comparar antes filtra el tamaño del
  // secreto, que no es lo que protege el secreto.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function authorizeCron(
  header: string | null,
  secret: string | undefined
): CronAuth {
  if (!secret) {
    return {
      ok: false,
      code: "NOT_FOUND",
      detail: "Los trabajos periódicos no están configurados en este despliegue.",
    };
  }

  const prefix = "Bearer ";
  const token = header?.startsWith(prefix) ? header.slice(prefix.length) : null;
  if (!token || !equals(token, secret)) {
    return { ok: false, code: "UNAUTHENTICATED", detail: "Credencial de cron no válida." };
  }

  return { ok: true };
}
