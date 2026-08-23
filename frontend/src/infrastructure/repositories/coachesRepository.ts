import type {
  Coach,
  CoachFinancialData,
  CoachFormData,
  CoachUpdateData,
} from "@/domain/types/coach";
import type { PaginatedResponse } from "@/infrastructure/types/api";
import apiClient from "./apiClient";

export const coachesRepository = {
  async get(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Coach>> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    const { data } = await apiClient.get<PaginatedResponse<Coach>>(`/coaches?${params}`);
    return data;
  },

  async getById(id: string): Promise<Coach> {
    const { data } = await apiClient.get<Coach>(`/coaches/${id}`);
    return data;
  },

  async create(form: CoachFormData): Promise<Coach> {
    const { data } = await apiClient.post<Coach>("/coaches", form);
    return data;
  },

  async update(id: string, fields: CoachUpdateData): Promise<Coach> {
    const { data } = await apiClient.put<Coach>(`/coaches/${id}`, fields);
    return data;
  },

  async updateStatus(id: string, status: string): Promise<unknown> {
    const { data } = await apiClient.patch(`/coaches/${id}/status`, { status });
    return data;
  },

  async getFinancialData(id: string): Promise<CoachFinancialData> {
    const { data } = await apiClient.get<CoachFinancialData>(`/coaches/${id}/financial`);
    return data;
  },
};
