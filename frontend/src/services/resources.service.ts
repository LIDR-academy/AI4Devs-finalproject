import api from '@/utils/api';

export interface StaffAssignment {
  id: string;
  surgeryId: string;
  userId: string;
  role: string;
  notes?: string | null;
  createdAt: string;
}

export const resourcesService = {
  async getAssignmentsBySurgery(surgeryId: string): Promise<StaffAssignment[]> {
    const { data } = await api.get<StaffAssignment[] | { data?: StaffAssignment[] }>(
      `/resources/staff-assignments/surgery/${surgeryId}`,
    );
    const list = Array.isArray(data) ? data : (data as any)?.data;
    return Array.isArray(list) ? list : [];
  },

  async createStaffAssignment(payload: {
    surgeryId: string;
    userId: string;
    role: string;
    notes?: string;
  }): Promise<StaffAssignment> {
    const { data } = await api.post<StaffAssignment>(
      '/resources/staff-assignments',
      payload,
    );
    return data;
  },

  async removeStaffAssignment(id: string): Promise<void> {
    await api.delete(`/resources/staff-assignments/${id}`);
  },
};
