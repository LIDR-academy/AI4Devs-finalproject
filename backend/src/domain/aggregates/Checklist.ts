/**
 * Checklist aggregate. FR-024: auto-attached to PurchaseProcess.
 */
export interface ChecklistItemData {
  id: string;
  stage: string;
  title: string;
  description: string;
  documentsNeeded: string[];
  estimatedDays: number;
  completed: boolean;
  completedAt: Date | null;
  sortOrder: number;
}

export class Checklist {
  private constructor(
    public readonly id: string,
    public readonly processId: string,
    public readonly items: ChecklistItemData[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get progress(): number {
    if (this.items.length === 0) return 0;
    return this.items.filter((i) => i.completed).length / this.items.length;
  }

  static fromPrisma(row: {
    id: string;
    processId: string;
    createdAt: Date;
    updatedAt: Date;
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
  }): Checklist {
    return new Checklist(
      row.id,
      row.processId,
      row.items.map((i) => ({
        id: i.id,
        stage: i.stage,
        title: i.title,
        description: i.description,
        documentsNeeded: Array.isArray(i.documentsNeeded) ? (i.documentsNeeded as string[]) : [],
        estimatedDays: i.estimatedDays,
        completed: i.completed,
        completedAt: i.completedAt,
        sortOrder: i.sortOrder,
      })),
      row.createdAt,
      row.updatedAt,
    );
  }
}
