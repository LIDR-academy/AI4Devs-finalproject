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
}

export const hceService = new HceService();
export default hceService;
