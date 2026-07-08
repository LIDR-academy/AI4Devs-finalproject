/**
 * ChecklistRepository — Prisma implementation of the
 * ChecklistRepositoryPort. FR-024: ensureForProcess creates a
 * default checklist from CHECKLIST_TEMPLATE if the process
 * doesn't have one yet.
 */
import { PrismaClient } from '@prisma/client';
import { CHECKLIST_TEMPLATE } from '../../domain/services/ChecklistTemplate';
import type {
  ChecklistRepositoryPort,
  StoredChecklist,
  StoredChecklistItem,
} from '../../domain/ports/ChecklistRepositoryPort';

export class ChecklistRepository implements ChecklistRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureForProcess(processId: string): Promise<StoredChecklist> {
    const existing = await this.findByProcessId(processId);
    if (existing) return existing;

    await this.prisma.checklist.create({
      data: {
        processId,
        items: {
          create: CHECKLIST_TEMPLATE.map((item) => ({
            stage: item.stage,
            title: item.title,
            description: item.description,
            documentsNeeded: item.documentsNeeded as unknown as object,
            estimatedDays: item.estimatedDays,
            sortOrder: item.sortOrder,
          })),
        },
      },
    });
    const created = await this.findByProcessId(processId);
    if (!created) {
      throw new Error(`Failed to create checklist for process ${processId}`);
    }
    return created;
  }

  async findByProcessId(processId: string): Promise<StoredChecklist | null> {
    const row = await this.prisma.checklist.findFirst({
      where: { processId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) return null;
    return this.toStored(row);
  }

  async findById(id: string, userId: string): Promise<StoredChecklist | null> {
    const row = await this.prisma.checklist.findFirst({
      where: { id, process: { userId } },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!row) return null;
    return this.toStored(row);
  }

  async toggleItem(itemId: string, completed: boolean): Promise<StoredChecklistItem | null> {
    try {
      const row = await this.prisma.checklistItem.update({
        where: { id: itemId },
        data: { completed, completedAt: completed ? new Date() : null },
      });
      return this.toStoredItem(row);
    } catch {
      return null;
    }
  }

  private toStored(row: {
    id: string;
    processId: string;
    items: Array<{
      id: string;
      stage: string;
      title: string;
      description: string;
      documentsNeeded: unknown;
      estimatedDays: number;
      completed: boolean;
      completedAt: Date | null;
      sortOrder: number;
    }>;
  }): StoredChecklist {
    return {
      id: row.id,
      processId: row.processId,
      items: row.items.map((i) => this.toStoredItem(i)),
    };
  }

  private toStoredItem(i: {
    id: string;
    stage: string;
    title: string;
    description: string;
    documentsNeeded: unknown;
    estimatedDays: number;
    completed: boolean;
    completedAt: Date | null;
    sortOrder: number;
  }): StoredChecklistItem {
    return {
      id: i.id,
      stage: i.stage,
      title: i.title,
      description: i.description,
      documentsNeeded: Array.isArray(i.documentsNeeded)
        ? (i.documentsNeeded as string[])
        : [],
      estimatedDays: i.estimatedDays,
      completed: i.completed,
      completedAt: i.completedAt,
      sortOrder: i.sortOrder,
    };
  }
}
