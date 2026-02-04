import api from '@/utils/api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  medicalRecords?: MedicalRecord[];
  allergies?: Allergy[];
  medications?: Medication[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  medicalHistory?: string | null;
  familyHistory?: string | null;
  currentCondition?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AllergySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  severity: AllergySeverity;
  notes?: string | null;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
}

export interface MedicalHistoryResponse {
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'phone' | 'address'>;
  medicalRecords: MedicalRecord[];
  allergies: Allergy[];
  medications: Medication[];
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
}

class HceService {
  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    firstName?: string;
    lastName?: string;
    id?: string;
  }): Promise<PatientListResponse> {
    // El backend espera firstName, lastName, id como query params
    const queryParams: Record<string, string> = {};
    if (params?.firstName) queryParams.firstName = params.firstName;
    if (params?.lastName) queryParams.lastName = params.lastName;
    if (params?.id) queryParams.id = params.id;
    
    const response = await api.get<any>('/hce/patients', { params: queryParams });
    
    // El TransformInterceptor envuelve la respuesta en { data: [...], statusCode, timestamp }
    let patients: Patient[] = [];
    if (response.data) {
      // Si está envuelto en { data: [...] }
      if (response.data.data && Array.isArray(response.data.data)) {
        patients = response.data.data;
      } 
      // Si es un array directo
      else if (Array.isArray(response.data)) {
        patients = response.data;
      }
    }
    
    return {
      data: patients,
      total: patients.length,
    };
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get<any>(`/hce/patients/${id}`);
    // Manejar respuesta transformada
    return response.data?.data || response.data;
  }

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const response = await api.post<any>('/hce/patients', patient);
    // Manejar respuesta transformada
    return response.data?.data || response.data;
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const response = await api.put<any>(`/hce/patients/${id}`, patient);
    // Manejar respuesta transformada
    return response.data?.data || response.data;
  }

  async deletePatient(id: string): Promise<void> {
    await api.delete(`/hce/patients/${id}`);
  }

  async getMedicalHistory(patientId: string): Promise<MedicalHistoryResponse> {
    const response = await api.get<any>(`/hce/patients/${patientId}/medical-history`);
    return response.data?.data ?? response.data;
  }

  async updateMedicalRecord(
    patientId: string,
    data: { medicalHistory?: string; familyHistory?: string; currentCondition?: string },
  ): Promise<MedicalRecord> {
    const response = await api.put<any>(`/hce/patients/${patientId}/medical-record`, data);
    return response.data?.data ?? response.data;
  }

  async addAllergy(data: {
    patientId: string;
    allergen: string;
    severity: AllergySeverity;
    notes?: string;
  }): Promise<Allergy> {
    const response = await api.post<any>('/hce/allergies', data);
    return response.data?.data ?? response.data;
  }

  async updateAllergy(
    allergyId: string,
    data: { allergen?: string; severity?: AllergySeverity; notes?: string },
  ): Promise<Allergy> {
    const response = await api.put<any>(`/hce/allergies/${allergyId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteAllergy(allergyId: string): Promise<void> {
    await api.delete(`/hce/allergies/${allergyId}`);
  }

  async addMedication(data: {
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }): Promise<Medication> {
    const response = await api.post<any>('/hce/medications', data);
    return response.data?.data ?? response.data;
  }

  async updateMedication(
    medicationId: string,
    data: { name?: string; dosage?: string; frequency?: string; startDate?: string; endDate?: string },
  ): Promise<Medication> {
    const response = await api.put<any>(`/hce/medications/${medicationId}`, data);
    return response.data?.data ?? response.data;
  }

  async deleteMedication(medicationId: string): Promise<void> {
    await api.delete(`/hce/medications/${medicationId}`);
  }
}

export const hceService = new HceService();
export default hceService;
