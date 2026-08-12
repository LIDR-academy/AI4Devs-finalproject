import "dotenv/config";
import cron from "node-cron";

import { prismaRetentionRepository } from "@/repositories/retention.repository.prisma";
import { emitter, offerDeps } from "@/use-cases/queue/deps";
import { expireOffers, sendOfferReminders } from "@/use-cases/queue/respond-to-offer";
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
 *   - Recordatorios de retención (tarea 4.5).
 *   - Caducidad de ventanas de confirmación de ofertas (tarea 6.4).
 *   - Recordatorio a mitad de ventana de confirmación (tarea 6.4).
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

/** Evita que dos ejecuciones se solapen si una se alarga más que su intervalo. */
let retentionRunning = false;

async function runRetentionReminders() {
  if (retentionRunning) {
    console.warn("[scheduler] Recordatorios de retención: la ejecución anterior sigue en curso.");
    return;
  }
  retentionRunning = true;
  try {
    const result = await sendRetentionReminders({
      retention: prismaRetentionRepository,
      emit: emitter(),
    });
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

let offersRunning = false;

/**
 * Caduca las ofertas vencidas —re-encolando a quien no respondió, sin expulsarlo— y
 * envía los recordatorios de mitad de ventana. Van juntos porque miran las mismas
 * filas y separarlos solo duplicaría el sondeo.
 */
async function runOfferJobs() {
  if (offersRunning) {
    console.warn("[scheduler] Ofertas: la ejecución anterior sigue en curso.");
    return;
  }
  offersRunning = true;
  try {
    const deps = offerDeps();
    const expired = await expireOffers(deps);
    const reminders = await sendOfferReminders(deps);
    if (expired.expired > 0 || reminders.sent > 0) {
      console.log(
        `[scheduler] Ofertas: ${expired.expired} caducadas (${expired.reoffered} reofertadas), ${reminders.sent} recordatorios.`
      );
    }
  } catch (error) {
    console.error("[scheduler] Fallo en el barrido de ofertas:", error);
  } finally {
    offersRunning = false;
  }
}

function registerJobs() {
  cron.schedule(RETENTION_SCHEDULE, runRetentionReminders, { timezone: TIMEZONE });
  cron.schedule(OFFERS_SCHEDULE, runOfferJobs, { timezone: TIMEZONE });
}

function main() {
  console.log("[scheduler] Iniciado. Timezone:", TIMEZONE);
  registerJobs();
}

main();
