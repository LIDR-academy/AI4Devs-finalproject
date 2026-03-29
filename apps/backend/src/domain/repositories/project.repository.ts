import { Project } from '../entities/project.entity';

export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findByUserId(userId: string): Promise<Project[]>;
  countActiveByUserId(userId: string): Promise<number>;
  findById(id: string): Promise<Project | null>;
  findByShareToken(token: string): Promise<Project | null>;
  update(project: Project): Promise<void>;
}

