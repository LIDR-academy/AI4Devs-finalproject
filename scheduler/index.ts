import "dotenv/config";
import cron from "node-cron";

import { prismaRetentionRepository } from "@/repositories/retention.repository.prisma";
import { sendRetentionReminders } from "@/use-cases/subscriptions/retention-reminders";

/**
 * Scheduler — proceso Node **independiente** del servidor Next (ADR-0001 §2, §4).
 * Se ejecuta como su propio servicio (systemd en la VM) para no duplicarse si Next
 * corre en varias instancias.
 *
 * Solo se ocupa de lo genuinamente temporal. El orden de la cola **no** se recalcula
 * (D11): al ser la prioridad aditiva, es invariante en el tiempo.
 *
 * Responsabilidades:
 *   - Recordatorios de retención (tarea 4.5) — implementado.
 *   - Caducidad de ventanas de confirmación de ofertas (tarea 6.4) — pendiente.
 *   - Recordatorio a mitad de ventana de confirmación (tarea 6.4) — pendiente.
 */

const TIMEZONE = "Europe/Madrid";

/**
 * Una vez al día a las 10:00. La cadencia real la marca la configuración de cada Set;
 * este cron solo decide cuándo se mira si toca. A media mañana, porque un recordatorio
 * "amable" de madrugada no lo es.
 */
const RETENTION_SCHEDULE = "0 10 * * *";

/** Evita que dos ejecuciones se solapen si una se alarga más que su intervalo. */
let retentionRunning = false;

async function runRetentionReminders() {
  if (retentionRunning) {
    console.warn("[scheduler] Recordatorios de retención: la ejecución anterior sigue en curso.");
    return;
  }
  retentionRunning = true;
  try {
    const result = await sendRetentionReminders({ retention: prismaRetentionRepository });
    console.log(
      `[scheduler] Recordatorios de retención: ${result.sent} enviados de ${result.candidates} candidatos.`
    );
  } catch (error) {
    // Un fallo no puede tumbar el proceso: mañana vuelve a tocar.
    console.error("[scheduler] Fallo en los recordatorios de retención:", error);
  } finally {
    retentionRunning = false;
  }
}

function registerJobs() {
  cron.schedule(RETENTION_SCHEDULE, runRetentionReminders, { timezone: TIMEZONE });
  // TODO(6.4): caducidad de ofertas y recordatorio a mitad de ventana.
}

function main() {
  console.log("[scheduler] Iniciado. Timezone:", TIMEZONE);
  registerJobs();
}

main();
