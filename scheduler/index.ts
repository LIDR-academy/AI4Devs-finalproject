import "dotenv/config";
import cron from "node-cron";

import { runJob, type JobName } from "@/use-cases/scheduler/jobs";

/**
 * Scheduler — proceso Node **independiente** del servidor Next (ADR-0001 §2, §4).
 * Se ejecuta como su propio servicio (systemd, un contenedor, lo que sea) para no
 * duplicarse si Next corre en varias instancias. En el despliegue actual —Vercel,
 * ADR-0003— no hay proceso de vida larga y el reloj lo pone `/api/cron/:job`.
 *
 * Solo se ocupa de **cuándo**; el **qué** vive en `use-cases/scheduler/jobs.ts`, que
 * comparte con el endpoint `/api/cron/:job` — el disparador para despliegues sin
 * proceso de vida larga. Dos relojes, un solo trabajo.
 *
 * El orden de la cola **no** se recalcula (D11): al ser la prioridad aditiva, es
 * invariante en el tiempo.
 */

const TIMEZONE = "Europe/Madrid";

/**
 * Cada 5 minutos. La ventana de confirmación se mide en horas, así que este grano da
 * una caducidad puntual sin castigar a la base con un sondeo por minuto.
 */
const OFFERS_SCHEDULE = "*/5 * * * *";

/**
 * Una vez al día a las 10:00. La cadencia real la marca la configuración de cada Set;
 * este cron solo decide cuándo se mira si toca. A media mañana, porque un recordatorio
 * "amable" de madrugada no lo es.
 */
const RETENTION_SCHEDULE = "0 10 * * *";

/** Evita que dos ejecuciones del mismo trabajo se solapen si una se alarga. */
const running = new Set<JobName>();

/**
 * Lanza un trabajo con su red de seguridad: ni se solapa consigo mismo ni un fallo
 * tumba el proceso — mañana vuelve a tocar.
 *
 * `quiet` es para el barrido de ofertas, que corre cada cinco minutos: registrar "0
 * caducadas" 288 veces al día convierte el log en ruido y esconde lo que importa.
 */
async function run(job: JobName, { quiet = false } = {}) {
  if (running.has(job)) {
    console.warn(`[scheduler] ${job}: la ejecución anterior sigue en curso.`);
    return;
  }
  running.add(job);
  try {
    const result = await runJob(job);
    const hubo = Object.values(result.counts).some((count) => count > 0);
    if (!quiet || hubo) console.log(`[scheduler] ${job}: ${result.summary}.`);
  } catch (error) {
    console.error(`[scheduler] Fallo en ${job}:`, error);
  } finally {
    running.delete(job);
  }
}

function main() {
  console.log("[scheduler] Iniciado. Timezone:", TIMEZONE);
  cron.schedule(RETENTION_SCHEDULE, () => run("retention"), { timezone: TIMEZONE });
  cron.schedule(OFFERS_SCHEDULE, () => run("offers", { quiet: true }), { timezone: TIMEZONE });
}

main();
