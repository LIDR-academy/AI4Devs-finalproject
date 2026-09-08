import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import { isReminderDue } from "@/domain/subscriptions/retention-reminder";
import type { AuditRepository } from "@/repositories/audit.repository";
import type { RetentionConfig, RetentionRepository } from "@/repositories/retention.repository";
import type { SetRepository } from "@/repositories/set.repository";

import type { Emitter } from "../notifications/notify";

export interface RetentionDeps {
  retention: RetentionRepository;
  sets?: SetRepository;
  audit?: AuditRepository;
  /** Si se aporta, los recordatorios salen por el motor de notificaciones (7.1). */
  emit?: Emitter;
  now?: () => Date;
}

/** Activa o ajusta los recordatorios de un Set — solo admin. */
export async function configureRetentionReminders(
  { retention, sets, audit, now = () => new Date() }: RetentionDeps,
  input: {
    setId: string;
    enabled: boolean;
    cadenceDays: number;
    actor: { id: string; role: Role };
  }
): Promise<RetentionConfig> {
  if (!can(input.actor.role, "settings.manage")) {
    throw new ForbiddenError("Solo un administrador configura los recordatorios.");
  }

  if (sets && !(await sets.findById(input.setId))) {
    throw new NotFoundError("El set no existe.");
  }

  const config = await retention.upsertConfig({
    setId: input.setId,
    enabled: input.enabled,
    cadenceDays: input.cadenceDays,
    adminId: input.actor.id,
  });

  await audit?.record({
    actorId: input.actor.id,
    action: "retention_reminder.configured",
    entityType: "RetentionReminderConfig",
    entityId: input.setId,
    metadata: { enabled: input.enabled, cadenceDays: input.cadenceDays },
    at: now(),
  });

  return config;
}

export interface RetentionRunResult {
  candidates: number;
  sent: number;
}

/**
 * Envía los recordatorios que tocan hoy. Lo invoca el scheduler (ADR-0001 §4).
 *
 * Cada recordatorio se decide por separado y **un fallo no detiene al resto**: que no
 * se le pueda avisar a un suscriptor no es razón para dejar sin aviso a los demás.
 */
export async function sendRetentionReminders({
  retention,
  emit,
  now = () => new Date(),
}: RetentionDeps): Promise<RetentionRunResult> {
  const at = now();
  const candidates = await retention.findRetentionCandidates();
  let sent = 0;

  for (const candidate of candidates) {
    const due = isReminderDue({
      enabled: true, // la consulta ya filtró por configuración activada
      cadenceDays: candidate.cadenceDays,
      queueLength: candidate.queueLength,
      since: candidate.lastReminderAt ?? candidate.rentalStartedAt,
      now: at,
    });
    if (!due) continue;

    try {
      await retention.recordReminderSent({
        userId: candidate.userId,
        rentalId: candidate.rentalId,
        setId: candidate.setId,
        setName: candidate.setName,
        at,
      });
      // El ciclo va en el evento: este aviso **debe** repetirse cada X días, así que
      // su clave de idempotencia tiene que cambiar de un ciclo al siguiente.
      await emit?.({
        type: "retention.reminder",
        userId: candidate.userId,
        rentalId: candidate.rentalId,
        setName: candidate.setName,
        cycle: at.toISOString().slice(0, 10),
      });
      sent++;
    } catch (error) {
      console.error("[retention] No se pudo enviar el recordatorio:", candidate.rentalId, error);
    }
  }

  return { candidates: candidates.length, sent };
}
