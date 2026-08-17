import type {
  AvailableSlot,
  ClassType,
  CreateClassPayload,
  CreateClassResponse,
} from "@/domain/types/class";
import type { AssignableCoach } from "@/domain/types/coach";
import apiClient from "./apiClient";

export const classesRepository = {
  async create(payload: CreateClassPayload): Promise<CreateClassResponse> {
    const { data } = await apiClient.post<CreateClassResponse>("/classes", payload);
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
