import { z } from "zod";

import { requireSession } from "@/http/auth-context";
import { parseJsonBody } from "@/http/parse-body";
import { toProblemResponse } from "@/http/problem";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaRetentionRepository } from "@/repositories/retention.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { configureRetentionReminders } from "@/use-cases/subscriptions/retention-reminders";

const ConfigSchema = z.object({
  enabled: z.boolean(),
  cadenceDays: z.number().int().min(1).max(90),
});

/** Recordatorios de retención de un Set — solo admin (D7). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;
  try {
    const { user } = await requireSession();
    const data = await parseJsonBody(request, ConfigSchema);

    const config = await configureRetentionReminders(
      {
        retention: prismaRetentionRepository,
        sets: prismaSetRepository,
        audit: prismaAuditRepository,
      },
      { setId, ...data, actor: { id: user.id, role: user.role } }
    );

    return Response.json({ config });
  } catch (error) {
    return toProblemResponse(error, `/api/sets/${setId}/retention-reminder`);
  }
}
