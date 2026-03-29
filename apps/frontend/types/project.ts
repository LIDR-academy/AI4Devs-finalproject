export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  architectId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
}

export const PROJECT_LIMITS = {
  FREE: 3,
  // PREMIUM: Infinity // Future proofing
};
