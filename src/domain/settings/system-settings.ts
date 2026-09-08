/**
 * Parámetros configurables del sistema (PRD §15.1).
 *
 * Se guardan como clave-valor en `SystemSetting`, pero el resto del código los usa a
 * través de este catálogo **tipado y con valor por defecto**: una regla de negocio no
 * puede quedarse sin valor porque alguien no haya sembrado una fila, y un `Json` de
 * la base no debería propagarse como `unknown` hasta el dominio.
 *
 * **Aquí solo entra lo que alguien lee.** Hubo un `premiumQueueBonusDays` que no leía
 * nadie —la ventaja en cola sale del plan (`Plan.queueBonus`), que es lo que
 * `join-queue` congela al encolar— y en la pantalla de configuración se veía como un
 * mando más: se ajustaba, se guardaba y no cambiaba nada. Retirado al construir HU-16.
 * Una fila suya que siga en la base es inofensiva: `resolveSettings` solo recorre las
 * claves de este catálogo.
 */

export const SYSTEM_SETTINGS = {
  /** D5 — ventana de confirmación de una oferta; el recordatorio sale a la mitad. */
  offerConfirmationWindowHours: 48,
  /** D5 — desplazamiento aplicado a quien deja caducar la oferta. */
  expiredOfferPenaltyDays: 7,
  /** D7 — límite de colas simultáneas por usuario. */
  maxQueuesPerUser: 1,
  /** D7 — antigüedad mínima de suscripción para sets restringidos, en meses. */
  restrictedSetMinMonths: 3,
  /** D7 — cadencia por defecto de los recordatorios de retención, en días. */
  retentionReminderCadenceDays: 7,
} as const;

export type SystemSettingKey = keyof typeof SYSTEM_SETTINGS;

export type SystemSettings = { [K in SystemSettingKey]: number };

export const SYSTEM_SETTING_KEYS = Object.keys(SYSTEM_SETTINGS) as SystemSettingKey[];

/**
 * Combina los valores guardados con los de por defecto, descartando lo que no sea un
 * número utilizable. Un valor corrupto en la base **no** debe tumbar una regla de
 * negocio: se ignora y se usa el de por defecto, que es un comportamiento conocido.
 */
export function resolveSettings(stored: Record<string, unknown>): SystemSettings {
  const resolved = {} as SystemSettings;
  for (const key of SYSTEM_SETTING_KEYS) {
    resolved[key] = toUsableNumber(stored[key]) ?? SYSTEM_SETTINGS[key];
  }
  return resolved;
}

/**
 * Convierte a número solo lo que de verdad lo es. Devuelve `null` para todo lo demás.
 *
 * El descarte explícito de `null`, `undefined` y la cadena vacía **no es redundante**:
 * `Number(null)` y `Number("")` valen 0, un valor perfectamente finito que se colaría
 * como configuración válida y pondría un parámetro a cero sin que nadie lo pidiera.
 */
function toUsableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return null;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}
