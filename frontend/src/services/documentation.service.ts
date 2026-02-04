import api from '@/utils/api';

export interface Documentation {
  id: string;
  surgeryId: string;
  preoperativeNotes?: string;
  intraoperativeNotes?: string;
  postoperativeNotes?: string;
  procedureDetails?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    anesthesiaType?: string;
    complications?: string[];
    bloodLoss?: number;
    vitalSigns?: {
      time: string;
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    }[];
    medications?: {
      name: string;
      dosage: string;
      time: string;
    }[];
  };
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  createdBy: string;
  lastModifiedBy?: string;
  changeHistory?: {
    timestamp: string;
    userId: string;
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
  lastSavedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentationDto {
  surgeryId: string;
  preoperativeNotes?: string;
  intraoperativeNotes?: string;
  postoperativeNotes?: string;
  procedureDetails?: Documentation['procedureDetails'];
  status?: Documentation['status'];
}

class DocumentationService {
  async create(data: CreateDocumentationDto): Promise<Documentation> {
    const response = await api.post<any>('/documentation', data);
    return response.data?.data || response.data;
  }

  async getBySurgeryId(surgeryId: string): Promise<Documentation> {
    const response = await api.get<any>(`/documentation/surgery/${surgeryId}`);
    return response.data?.data || response.data;
  }

  async update(id: string, data: Partial<CreateDocumentationDto>): Promise<Documentation> {
    const response = await api.put<any>(`/documentation/${id}`, data);
    return response.data?.data || response.data;
  }

  async getChangeHistory(id: string): Promise<any[]> {
    const response = await api.get<any>(`/documentation/${id}/history`);
    return response.data?.data || response.data;
  }

  async complete(id: string): Promise<Documentation> {
    const response = await api.put<any>(`/documentation/${id}/complete`);
    return response.data?.data || response.data;
  }
}

export default new DocumentationService();
