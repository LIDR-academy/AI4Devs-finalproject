import api from '@/utils/api';

export interface OperatingRoom {
  id: string;
  name: string;
  code?: string;
  description?: string;
  floor?: string;
  building?: string;
  isActive: boolean;
  equipment?: {
    anesthesiaMachine?: boolean;
    ventilator?: boolean;
    monitoringSystem?: boolean;
    surgicalLights?: number;
    [key: string]: any;
  };
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatingRoomDto {
  name: string;
  code?: string;
  description?: string;
  floor?: string;
  building?: string;
  isActive?: boolean;
  equipment?: {
    anesthesiaMachine?: boolean;
    ventilator?: boolean;
    monitoringSystem?: boolean;
    surgicalLights?: number;
    [key: string]: any;
  };
  capacity?: number;
}

class OperatingRoomService {
  async getOperatingRooms(activeOnly?: boolean): Promise<OperatingRoom[]> {
    const params: any = {};
    if (activeOnly) {
      params.activeOnly = 'true';
    }

    const response = await api.get<any>('/planning/operating-rooms', { params });

    // Manejar respuesta transformada
    let rooms: OperatingRoom[] = [];
    if (response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        rooms = response.data.data;
      } else if (Array.isArray(response.data)) {
        rooms = response.data;
      }
    }

    return rooms;
  }

  async getOperatingRoomById(id: string): Promise<OperatingRoom> {
    const response = await api.get<any>(`/planning/operating-rooms/${id}`);
    return response.data?.data || response.data;
  }

  async createOperatingRoom(room: CreateOperatingRoomDto): Promise<OperatingRoom> {
    const response = await api.post<any>('/planning/operating-rooms', room);
    return response.data?.data || response.data;
  }

  async updateOperatingRoom(
    id: string,
    room: Partial<CreateOperatingRoomDto>,
  ): Promise<OperatingRoom> {
    const response = await api.put<any>(`/planning/operating-rooms/${id}`, room);
    return response.data?.data || response.data;
  }

  async deleteOperatingRoom(id: string): Promise<void> {
    await api.delete(`/planning/operating-rooms/${id}`);
  }
}

export const operatingRoomService = new OperatingRoomService();
export default operatingRoomService;
