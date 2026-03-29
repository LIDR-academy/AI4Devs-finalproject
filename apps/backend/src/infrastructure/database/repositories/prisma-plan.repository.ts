import { PrismaClient } from '@prisma/client';
import { IPlanRepository } from '@/domain/plans/plan.repository';
import { Plan, PlanStatus, Layer, LayerStatus, LayerType } from '@trace/core';
import { env } from '@/config/env';

export class PrismaPlanRepository implements IPlanRepository {
  constructor(private prisma: PrismaClient) {}

  private toPublicUrl(pathStr: string): string {
    if (!pathStr || pathStr.startsWith('http')) return pathStr;
    const marker = '/uploads/';
    const index = pathStr.indexOf(marker);
    if (index !== -1) {
      return `${env.BASE_URL}/uploads/${pathStr.substring(index + marker.length)}`;
    }
    return pathStr;
  }

  private mapLayerToEntity(l: any): Layer {
    return new Layer(
      l.id,
      l.planId,
      l.name,
      this.toPublicUrl(l.imageUrl),
      l.type as unknown as LayerType,
      l.status === 'ACTIVE' ? LayerStatus.READY : (l.status as unknown as LayerStatus),
      l.createdAt,
      l.updatedAt
    );
  }

  async findLatestVersion(projectId: string, sheetName: string): Promise<Plan | null> {
    const planModel = await this.prisma.plan.findFirst({
      where: {
        projectId,
        sheetName,
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!planModel) return null;

    return this.mapToEntity(planModel);
  }

  async save(plan: Plan): Promise<Plan> {
    // If id exists, update (not needed for this specific story yet, but good practice)
    // Here we focus on Create.
    const created = await this.prisma.plan.create({
      data: {
        projectId: plan.projectId,
        sheetName: plan.sheetName,
        version: plan.version,
        status: plan.status as any, // Cast to Prisma Enum
      },
    });

    return this.mapToEntity(created);
  }

  async findByProject(projectId: string): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      where: { projectId },
      orderBy: { sheetName: 'asc' },
      include: { layers: true },
    });
    return plans.map(p => {
      const plan = this.mapToEntity(p);
      plan.layers = (p.layers ?? []).map(l => this.mapLayerToEntity(l));
      return plan;
    });
  }

  async findById(planId: string): Promise<Plan | null> {
    const model = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { layers: true },
    });
    if (!model) return null;

    const plan = this.mapToEntity(model);
    plan.layers = (model.layers ?? []).map(l => this.mapLayerToEntity(l));
    return plan;
  }

  private mapToEntity(model: any): Plan {
    return new Plan(
      model.id,
      model.projectId,
      model.sheetName,
      model.version,
      model.status as PlanStatus,
      model.createdAt,
      model.updatedAt
    );
  }
}
