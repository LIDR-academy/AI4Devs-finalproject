
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export class Project {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly architectId: string,
    public readonly status: ProjectStatus,
    public readonly description?: string | null,
    public readonly shareToken?: string | null,
    public readonly isPublic: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null
  ) {}
}
