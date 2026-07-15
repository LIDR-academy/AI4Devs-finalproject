import type {
  Coach,
  CoachFinancialData,
  CoachStatus,
  CreateCoachData,
  UpdateCoachData,
} from "../entities/Coach.js";

export interface CoachFilters {
  status?: string[];
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

export interface CoachRepository {
  create(data: CreateCoachData & { passwordHash: string }): Promise<Coach>;
  findById(id: string): Promise<Coach | null>;
  findByEmail(email: string): Promise<Coach | null>;
  findAll(filters: CoachFilters): Promise<PaginatedResult<Coach>>;
  update(id: string, data: UpdateCoachData): Promise<Coach>;
  updateStatus(id: string, status: CoachStatus): Promise<Coach>;
  findFinancialData(id: string): Promise<CoachFinancialData | null>;
}
