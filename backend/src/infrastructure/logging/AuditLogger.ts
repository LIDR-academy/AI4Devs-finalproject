import type { PrismaClient } from "@prisma/client";

export class AuditLogger {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async log(params: {
    actorId: string;
    action: string;
    resource: string;
    resourceId?: string;
    outcome: "SUCCESS" | "DENIED";
  }): Promise<void> {
    await this.prisma.securityAuditLog.create({
      data: {
        actor_id: params.actorId,
        action: params.action,
        resource: params.resource,
        resource_id: params.resourceId ?? null,
        outcome: params.outcome,
      },
    });
  }
}
