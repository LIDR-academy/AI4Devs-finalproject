import api from '@/utils/api';

export enum SurgeryStatus {
  PLANNED = 'planned',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SurgeryType {
  ELECTIVE = 'elective',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export interface Surgery {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
  };
  surgeonId: string;
  procedure: string;
  type: SurgeryType;
  status: SurgeryStatus;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  operatingRoomId?: string;
  preopNotes?: string;
  postopNotes?: string;
  riskScores?: {
    asa?: number;
    possum?: number;
    custom?: number;
  };
  createdAt: string;
  updatedAt: string;
  planning?: SurgicalPlanning;
  checklist?: Checklist;
}

export interface SurgicalPlanning {
  id: string;
  surgeryId: string;
  approachSelected?: string;
  analysisData?: {
    measurements?: {
      distance?: number;
      volume?: number;
      area?: number;
    };
    structures?: {
      name: string;
      coordinates: number[][];
      type: string;
    }[];
    findings?: string[];
  };
  simulationData?: {
    approach?: {
      entryPoint: number[];
      direction: number[];
      angle?: number;
    };
    trajectory?: number[][];
    riskZones?: {
      name: string;
      coordinates: number[][];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }[];
    estimatedDuration?: number;
  };
  guide3dId?: string;
  planningNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  surgeryId: string;
  preInductionComplete: boolean;
  preIncisionComplete: boolean;
  postProcedureComplete: boolean;
  checklistData: {
    preInduction?: ChecklistPhase;
    preIncision?: ChecklistPhase;
    postProcedure?: ChecklistPhase;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistPhase {
  name: string;
  items: ChecklistItem[];
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
}

export interface CreateSurgeryDto {
  patientId: string;
  procedure: string;
  type: SurgeryType;
  scheduledDate?: string;
  operatingRoomId?: string;
  preopNotes?: string;
  riskScores?: {
    asa?: number;
    possum?: number;
    custom?: number;
  };
}

class PlanningService {
  async getSurgeries(params?: {
    patientId?: string;
    surgeonId?: string;
    status?: SurgeryStatus;
  }): Promise<Surgery[]> {
    const response = await api.get<any>('/planning/surgeries', { params });
    
    // Manejar respuesta transformada
    let surgeries: Surgery[] = [];
    if (response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        surgeries = response.data.data;
      } else if (Array.isArray(response.data)) {
        surgeries = response.data;
      }
    }
    
    return surgeries;
  }

  async getSurgeryById(id: string): Promise<Surgery> {
    const response = await api.get<any>(`/planning/surgeries/${id}`);
    return response.data?.data || response.data;
  }

  async createSurgery(surgery: CreateSurgeryDto): Promise<Surgery> {
    const response = await api.post<any>('/planning/surgeries', surgery);
    return response.data?.data || response.data;
  }

  async updateSurgery(id: string, surgery: Partial<CreateSurgeryDto>): Promise<Surgery> {
    const response = await api.put<any>(`/planning/surgeries/${id}`, surgery);
    return response.data?.data || response.data;
  }

  async updateSurgeryStatus(id: string, status: SurgeryStatus): Promise<Surgery> {
    const response = await api.put<any>(`/planning/surgeries/${id}/status`, { status });
    return response.data?.data || response.data;
  }

  async getPlanningBySurgeryId(surgeryId: string): Promise<SurgicalPlanning> {
    const response = await api.get<any>(`/planning/plannings/surgery/${surgeryId}`);
    return response.data?.data || response.data;
  }

  async createPlanning(planning: any): Promise<SurgicalPlanning> {
    const response = await api.post<any>('/planning/plannings', planning);
    return response.data?.data || response.data;
  }

  async updatePlanning(id: string, planning: Partial<any>): Promise<SurgicalPlanning> {
    const response = await api.put<any>(`/planning/plannings/${id}`, planning);
    return response.data?.data || response.data;
  }

  async getChecklist(surgeryId: string): Promise<Checklist> {
    const response = await api.get<any>(`/planning/surgeries/${surgeryId}/checklist`);
    return response.data?.data || response.data;
  }

  async createChecklist(surgeryId: string): Promise<Checklist> {
    const response = await api.post<any>(`/planning/surgeries/${surgeryId}/checklist`);
    return response.data?.data || response.data;
  }

  async updateChecklistPhase(
    surgeryId: string,
    phase: 'preInduction' | 'preIncision' | 'postProcedure',
    phaseData?: ChecklistPhase,
    itemId?: string,
    checked?: boolean,
    notes?: string,
  ): Promise<Checklist> {
    const body: any = { phase };
    if (phaseData) {
      body.phaseData = phaseData;
    } else if (itemId !== undefined) {
      body.itemId = itemId;
      body.checked = checked;
      body.notes = notes;
    }
    
    const response = await api.put<any>(`/planning/surgeries/${surgeryId}/checklist/phase`, body);
    return response.data?.data || response.data;
  }

  async calculateRiskScore(surgeryId: string): Promise<{
    asa?: number;
    possum?: number;
    custom?: number;
  }> {
    const response = await api.get<any>(`/planning/surgeries/${surgeryId}/risk-score`);
    return response.data?.data || response.data;
  }
}

export const planningService = new PlanningService();
export default planningService;
