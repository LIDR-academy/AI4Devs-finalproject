import "dotenv/config";
import cron from "node-cron";

/**
 * Scheduler — proceso Node **independiente** del servidor Next (ADR-0001 §2, §4).
 * Se ejecuta como su propio servicio (systemd en la VM) para no duplicarse si Next
 * corre en varias instancias.
 *
 * Responsabilidades (se implementan con sus capabilities):
 *   - Caducidad de ventanas de confirmación de ofertas de reserva (tarea 6.4).
 *   - Recordatorios de retención configurables (tarea 4.5).
 *   - Recordatorio a mitad de ventana de confirmación (tarea 6.4).
 *
 * Reutiliza los mismos casos de uso que la API (`src/use-cases`), invocándolos
 * fuera del contexto HTTP. Aquí solo queda el cableado del cron.
 */

const TIMEZONE = "Europe/Madrid";

function registerJobs() {
  // Placeholder: cada minuto. Los jobs reales se registran con sus tareas.
  cron.schedule(
    "* * * * *",
    () => {
      // TODO(6.4/4.5): invocar casos de uso de caducidad y recordatorios.
    },
    { timezone: TIMEZONE }
  );
}

function main() {
  console.log("[scheduler] Iniciado. Timezone:", TIMEZONE);
  registerJobs();
}

main();
