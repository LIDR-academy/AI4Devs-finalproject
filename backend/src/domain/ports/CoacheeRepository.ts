import type {
  Coachee,
  CoacheeStatus,
  CreateCoacheeData,
  UpdateCoacheeData,
} from "../entities/Coachee.js";

export interface CoacheeFilters {
  status?: string[];
  levelId?: string[];
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CoacheeRepository {
  create(data: CreateCoacheeData & { passwordHash: string }): Promise<Coachee>;
  findById(id: string): Promise<Coachee | null>;
  findByEmail(email: string): Promise<Coachee | null>;
  findAll(filters: CoacheeFilters): Promise<PaginatedResult<Coachee>>;
  update(id: string, data: UpdateCoacheeData): Promise<Coachee>;
  updateStatus(id: string, status: CoacheeStatus): Promise<Coachee>;
  updateLevel(id: string, levelId: string): Promise<Coachee>;
}
