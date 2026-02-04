import api from '@/utils/api';

export interface PostopEvolution {
  id: string;
  surgeryId: string;
  evolutionDate: string;
  clinicalNotes?: string;
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
  };
  hasComplications: boolean;
  complicationsNotes?: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
  }[];
  recordedBy?: string;
  createdAt: string;
}

export interface DischargePlan {
  id: string;
  surgeryId: string;
  surgerySummary?: string;
  instructions?: string;
  customInstructions?: { title: string; content: string }[];
  medicationsAtDischarge?: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    indications?: string;
  }[];
  followUpAppointments?: {
    date: string;
    type: string;
    notes?: string;
  }[];
  status: 'draft' | 'finalized';
  generatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvolutionDto {
  surgeryId: string;
  evolutionDate: string;
  clinicalNotes?: string;
  vitalSigns?: PostopEvolution['vitalSigns'];
  hasComplications?: boolean;
  complicationsNotes?: string;
  medications?: PostopEvolution['medications'];
}

export interface CreateDischargePlanDto {
  surgerySummary?: string;
  instructions?: string;
  customInstructions?: DischargePlan['customInstructions'];
  medicationsAtDischarge?: DischargePlan['medicationsAtDischarge'];
  followUpAppointments?: DischargePlan['followUpAppointments'];
}

function unwrap<T>(response: { data?: T } & T): T {
  return (response?.data ?? response) as T;
}

export const followupService = {
  async createEvolution(dto: CreateEvolutionDto): Promise<PostopEvolution> {
    const res = await api.post<any>('/followup/evolutions', dto);
    return unwrap(res.data);
  },

  async getEvolutionsBySurgery(surgeryId: string): Promise<PostopEvolution[]> {
    const res = await api.get<any>(`/followup/evolutions/surgery/${surgeryId}`);
    return unwrap(res.data) ?? [];
  },

  async getComplicationsAlerts(surgeryId: string): Promise<PostopEvolution[]> {
    const res = await api.get<any>(`/followup/evolutions/surgery/${surgeryId}/complications`);
    return unwrap(res.data) ?? [];
  },

  async getDischargePlan(surgeryId: string): Promise<DischargePlan | null> {
    try {
      const res = await api.get<any>(`/followup/discharge-plan/${surgeryId}`);
      const raw = res.data?.data !== undefined ? res.data.data : res.data;
      if (raw === null || raw === undefined) return null;
      if (typeof raw === 'object' && !('id' in raw)) return null;
      return raw as DischargePlan;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  async createOrUpdateDischargePlan(
    surgeryId: string,
    dto: CreateDischargePlanDto,
  ): Promise<DischargePlan> {
    const res = await api.put<any>(`/followup/discharge-plan/${surgeryId}`, dto);
    return unwrap(res.data);
  },

  async finalizeDischargePlan(surgeryId: string): Promise<DischargePlan> {
    const res = await api.post<any>(`/followup/discharge-plan/${surgeryId}/finalize`);
    return unwrap(res.data);
  },

  async generateDischargePlan(surgeryId: string): Promise<DischargePlan> {
    const res = await api.post<any>(`/followup/discharge-plan/${surgeryId}/generate`);
    return unwrap(res.data);
  },

  /** Descarga el plan de alta como PDF (requiere que exista un plan para la cirugía) */
  async downloadDischargePlanPdf(surgeryId: string): Promise<void> {
    const res = await api.get<Blob>(`/followup/discharge-plan/${surgeryId}/pdf`, {
      responseType: 'blob',
    });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-alta-${surgeryId.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default followupService;
