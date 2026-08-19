import type {
  AvailableSlot,
  CancelClassResponse,
  CancelClassScope,
  CancelEnrollmentResponse,
  ClassType,
  CreateClassPayload,
  CreateClassResponse,
  EnrollResponse,
  ListClassesParams,
  ListClassesResponse,
  TrainingClass,
} from "@/domain/types/class";
import type { AssignableCoach } from "@/domain/types/coach";
import type { CoacheeDashboard } from "@/domain/types/coachee";
import apiClient from "./apiClient";

export const classesRepository = {
  async create(payload: CreateClassPayload): Promise<CreateClassResponse> {
    const { data } = await apiClient.post<CreateClassResponse>("/classes", payload);
    return data;
  },

  async list(params: ListClassesParams): Promise<ListClassesResponse> {
    const search = new URLSearchParams({
      start: params.start,
      end: params.end,
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.classType) {
      search.set("classType", params.classType);
    }
    if (params.coachId) {
      search.set("coachId", params.coachId);
    }
    const { data } = await apiClient.get<ListClassesResponse>(`/classes?${search}`);
    return data;
  },

  async get(id: string): Promise<TrainingClass> {
    const { data } = await apiClient.get<TrainingClass>(`/classes/${id}`);
    return data;
  },

  async cancel(id: string, scope: CancelClassScope): Promise<CancelClassResponse> {
    const search = new URLSearchParams({ scope });
    const { data } = await apiClient.delete<CancelClassResponse>(`/classes/${id}?${search}`);
    return data;
  },

  async join(id: string): Promise<EnrollResponse> {
    const { data } = await apiClient.post<EnrollResponse>(`/classes/${id}/enrollment`);
    return data;
  },

  async cancelEnrollment(id: string): Promise<CancelEnrollmentResponse> {
    const { data } = await apiClient.delete<CancelEnrollmentResponse>(`/classes/${id}/enrollment`);
    return data;
  },

  async getCoacheeDashboard(): Promise<CoacheeDashboard> {
    const { data } = await apiClient.get<CoacheeDashboard>("/coachee/dashboard");
    return data;
  },

  async getAssignableCoaches(): Promise<AssignableCoach[]> {
    const { data } = await apiClient.get<{ data: AssignableCoach[] }>(
      "/classes/assignable-coaches",
    );
    return data.data;
  },

  async getAvailableSlots(params: {
    date: string;
    coachId: string;
    classType: ClassType;
  }): Promise<AvailableSlot[]> {
    const search = new URLSearchParams({
      date: params.date,
      coachId: params.coachId,
      classType: params.classType,
    });
    const { data } = await apiClient.get<{
      data: { date: string; coachId: string; availableSlots: AvailableSlot[] };
    }>(`/classes/available-slots?${search}`);
    return data.data.availableSlots;
  },
};
