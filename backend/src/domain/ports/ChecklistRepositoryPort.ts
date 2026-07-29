/**
 * ChecklistRepositoryPort — domain-side interface for persisting
 * and reading Checklists. FR-024: ensures every process has a
 * default checklist auto-attached.
 */

export interface StoredChecklistItem {
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

export interface StoredChecklist {
  id: string;
  processId: string;
  items: StoredChecklistItem[];
}

export interface ChecklistRepositoryPort {
  /**
   * Find the existing checklist for a process, or create a default
   * one from the CHECKLIST_TEMPLATE if none exists. Idempotent.
   */
  ensureForProcess(processId: string): Promise<StoredChecklist>;

  findByProcessId(processId: string): Promise<StoredChecklist | null>;

  findById(id: string, userId: string): Promise<StoredChecklist | null>;

  toggleItem(itemId: string, completed: boolean): Promise<StoredChecklistItem | null>;
}
