import { authorizeCron } from "@/http/cron-auth";
import { problem, problemResponse, toProblemResponse } from "@/http/problem";
import { isJobName, runJob } from "@/use-cases/scheduler/jobs";

/**
 * Disparador HTTP de los trabajos periódicos — `GET /api/cron/:job`.
 *
 * Existe para los despliegues **sin proceso de vida larga**, donde no cabe el
 * `scheduler/index.ts` de la VM (ADR-0001 §4): allí quien mira el reloj es el cron de
 * la plataforma —Vercel Cron, un `systemd timer`, lo que sea— y esta URL es el botón.
 * Los trabajos son los mismos objetos; lo único que cambia es quién los llama.
 *
 * `GET` y no `POST` porque es lo que emite Vercel Cron, y porque el efecto no depende
 * del cuerpo. No es idempotente en el sentido estricto —caducar una oferta cambia
 * cosas— así que el candado del secreto no es decorativo.
 *
 * **Dos ejecuciones solapadas no se bloquean.** El scheduler de la VM tiene un flag en
 * memoria para eso, y aquí no serviría: cada invocación es un proceso distinto. Lo que
 * sostiene el solape es el dominio —el cierre de oferta es un CAS y devuelve `null` si
 * otro llegó antes—, con un margen conocido: dos barridos a la vez podrían llegar a
 * enviar dos veces **un recordatorio**. Se acepta a cambio de no montar un cerrojo
 * distribuido para un aviso amable.
 */

// Nunca cacheada: es un efecto, no una lectura.
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ job: string }> }
) {
  const { job } = await params;
  const instance = `/api/cron/${job}`;

  const auth = authorizeCron(request.headers.get("authorization"), process.env.CRON_SECRET);
  // La credencial se comprueba **antes** que el nombre del trabajo: al revés, la
  // respuesta distinguiría trabajos que existen de los que no para quien no ha
  // acreditado nada.
  if (!auth.ok) {
    return problemResponse(problem(auth.code, auth.detail, { instance }));
  }

  if (!isJobName(job)) {
    return problemResponse(
      problem("NOT_FOUND", "No hay ningún trabajo periódico con ese nombre.", { instance })
    );
  }

  try {
    const result = await runJob(job);
    // Se registra igual que en la VM: en un despliegue serverless el log de la
    // invocación es lo único que queda cuando algo va mal de madrugada.
    console.log(`[cron] ${result.job}: ${result.summary}`);
    return Response.json(result);
  } catch (error) {
    return toProblemResponse(error, instance);
  }
}
