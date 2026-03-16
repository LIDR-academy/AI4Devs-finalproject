import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface HL7Patient {
  resourceType: 'Patient';
  id?: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  name?: Array<{
    family?: string;
    given?: string[];
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface HL7Observation {
  resourceType: 'Observation';
  id?: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

@Injectable()
export class HL7Service {
  private readonly logger = new Logger(HL7Service.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('FHIR_SERVER_URL') || '';
    this.clientId = this.configService.get<string>('FHIR_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('FHIR_CLIENT_SECRET') || '';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/fhir+json',
        Accept: 'application/fhir+json',
      },
    });

    // Agregar autenticación si está configurada
    if (this.clientId && this.clientSecret) {
      // TODO: Implementar OAuth2 para FHIR
      this.axiosInstance.defaults.auth = {
        username: this.clientId,
        password: this.clientSecret,
      };
    }
  }

  /**
   * Buscar paciente en servidor FHIR
   */
  async searchPatient(patientId: string): Promise<HL7Patient | null> {
    if (!this.baseUrl) {
      this.logger.warn('FHIR_SERVER_URL no configurado, saltando búsqueda');
      return null;
    }

    try {
      const response = await this.axiosInstance.get(`/Patient/${patientId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error buscando paciente en FHIR: ${error.message}`);
      return null;
    }
  }

  /**
   * Buscar pacientes por nombre
   */
  async searchPatientsByName(name: string): Promise<HL7Patient[]> {
    if (!this.baseUrl) {
      this.logger.warn('FHIR_SERVER_URL no configurado, saltando búsqueda');
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/Patient', {
        params: {
          name: name,
        },
      });
      return response.data.entry?.map((entry: any) => entry.resource) || [];
    } catch (error: any) {
      this.logger.error(`Error buscando pacientes en FHIR: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtener observaciones (resultados de laboratorio) de un paciente
   */
  async getPatientObservations(patientId: string): Promise<HL7Observation[]> {
    if (!this.baseUrl) {
      this.logger.warn('FHIR_SERVER_URL no configurado, saltando búsqueda');
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/Observation', {
        params: {
          subject: `Patient/${patientId}`,
          _sort: '-date',
        },
      });
      return response.data.entry?.map((entry: any) => entry.resource) || [];
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo observaciones en FHIR: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Crear observación (resultado de laboratorio) en servidor FHIR
   */
  async createObservation(observation: HL7Observation): Promise<HL7Observation> {
    if (!this.baseUrl) {
      throw new HttpException(
        'FHIR_SERVER_URL no configurado',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await this.axiosInstance.post('/Observation', observation);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error creando observación en FHIR: ${error.message}`);
      throw new HttpException(
        'Error al crear observación en servidor FHIR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verificar conexión con servidor FHIR
   */
  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) {
      this.logger.log('[Integration:FHIR] Health check: FHIR_SERVER_URL no configurado');
      return false;
    }

    try {
      const response = await this.axiosInstance.get('/metadata');
      const ok = response.status === 200;
      this.logger.log(`[Integration:FHIR] Health check: ${ok ? 'OK' : 'FAIL'}`);
      return ok;
    } catch (error: any) {
      this.logger.warn(`[Integration:FHIR] Health check fallido: ${error.message}`);
      return false;
    }
  }
}
