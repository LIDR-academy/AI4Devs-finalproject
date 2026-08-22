import { prismaRetentionRepository } from "@/repositories/retention.repository.prisma";
import { emitter, offerDeps } from "@/use-cases/queue/deps";
import { expireOffers, sendOfferReminders } from "@/use-cases/queue/respond-to-offer";
import { sendRetentionReminders } from "@/use-cases/subscriptions/retention-reminders";

/**
 * Los trabajos periódicos, declarados **una sola vez** (ADR-0001 §4).
 *
 * Hay dos formas de dispararlos y no pueden divergir: el proceso `node-cron` de
 * `scheduler/index.ts` y, donde no se puede tener un proceso de vida larga —el
 * despliegue serverless de ADR-0003—, una llamada HTTP a `/api/cron/:job`. Lo que cambia es **quién
 * mira el reloj**; lo que se ejecuta es esto.
 *
 * Cada trabajo devuelve un resumen contable en vez de escribir en consola: quien lo
 * dispara decide qué hacer con él —el scheduler lo registra, el endpoint lo devuelve en
 * el cuerpo— y así el resultado se puede leer desde el panel de quien programa el cron.
 */

export interface JobSummary {
  job: JobName;
  /** Línea legible para el log; el detalle contable va en `counts`. */
  summary: string;
  counts: Record<string, number>;
}

/**
 * Caduca las ofertas vencidas —re-encolando a quien no respondió, sin expulsarlo (D5)—
 * y envía los recordatorios de mitad de ventana. Van **juntos** porque miran las mismas
 * filas: separarlos solo duplicaría el sondeo.
 */
async function runOffers(): Promise<JobSummary> {
  const deps = offerDeps();
  const expired = await expireOffers(deps);
  const reminders = await sendOfferReminders(deps);
  return {
    job: "offers",
    summary: `${expired.expired} caducadas (${expired.reoffered} reofertadas), ${reminders.sent} recordatorios`,
    counts: {
      expired: expired.expired,
      reoffered: expired.reoffered,
      reminders: reminders.sent,
    },
  };
}

/** Recordatorios amables de retención (D7). La cadencia real la marca cada Set. */
async function runRetention(): Promise<JobSummary> {
  const result = await sendRetentionReminders({
    retention: prismaRetentionRepository,
    emit: emitter(),
  });
  return {
    job: "retention",
    summary: `${result.sent} enviados de ${result.candidates} candidatos`,
    counts: { candidates: result.candidates, sent: result.sent },
  };
}

/**
 * Catálogo cerrado de trabajos. Es también la lista de rutas válidas de
 * `/api/cron/:job`: un nombre que no esté aquí es un 404, no un trabajo vacío.
 */
export const JOBS = {
  offers: runOffers,
  retention: runRetention,
} as const;

export type JobName = keyof typeof JOBS;

export const JOB_NAMES = Object.keys(JOBS) as JobName[];

export function isJobName(value: string): value is JobName {
  return JOB_NAMES.includes(value as JobName);
}

export function runJob(job: JobName): Promise<JobSummary> {
  return JOBS[job]();
}
