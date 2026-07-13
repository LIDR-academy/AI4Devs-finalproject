import type { Coachee, CoacheeFormData, Level } from "@/domain/types/coachee";
import type { PaginatedResponse } from "@/infrastructure/types/api";
import apiClient from "./apiClient";

export const coacheesRepository = {
  async get(
    status?: string,
    levelId?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Coachee>> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    if (levelId) params.set("levelId", levelId);
    const { data } = await apiClient.get<PaginatedResponse<Coachee>>(`/coachees?${params}`);
    return data;
  },

  async getById(id: string): Promise<Coachee> {
    const { data } = await apiClient.get<Coachee>(`/coachees/${id}`);
    return data;
  },

  async create(form: CoacheeFormData): Promise<Coachee> {
    const { data } = await apiClient.post<Coachee>("/coachees", {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      classTypePreference: form.classTypePreference || null,
      levelId: form.levelId || null,
    });
    return data;
  },

  async update(
    id: string,
    fields: {
      name?: string;
      email?: string;
      phone?: string;
      classTypePreference?: string | null;
      additionalInfo?: string | null;
    },
  ): Promise<Coachee> {
    const { data } = await apiClient.put<Coachee>(`/coachees/${id}`, fields);
    return data;
  },

  async updateStatus(id: string, status: string): Promise<unknown> {
    const { data } = await apiClient.patch(`/coachees/${id}/status`, { status });
    return data;
  },

  async updateLevel(id: string, levelId: string): Promise<unknown> {
    const { data } = await apiClient.patch(`/coachees/${id}/level`, { levelId });
    return data;
  },

  async getLevels(): Promise<Level[]> {
    const { data } = await apiClient.get<{ data: Level[] }>("/levels");
    return data.data;
  },
};
