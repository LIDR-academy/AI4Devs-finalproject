import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface OrthancPatient {
  ID: string;
  IsStable: boolean;
  LastUpdate: string;
  MainDicomTags: {
    PatientID?: string;
    PatientName?: string;
    PatientBirthDate?: string;
    PatientSex?: string;
  };
  Studies: string[];
  Type: 'Patient';
}

export interface OrthancStudy {
  ID: string;
  IsStable: boolean;
  LastUpdate: string;
  MainDicomTags: {
    StudyDate?: string;
    StudyTime?: string;
    StudyDescription?: string;
    AccessionNumber?: string;
    StudyInstanceUID?: string;
  };
  PatientMainDicomTags: {
    PatientID?: string;
    PatientName?: string;
  };
  Series: string[];
  Type: 'Study';
}

export interface OrthancSeries {
  ID: string;
  IsStable: boolean;
  LastUpdate: string;
  MainDicomTags: {
    SeriesDate?: string;
    SeriesTime?: string;
    SeriesDescription?: string;
    Modality?: string;
    SeriesInstanceUID?: string;
  };
  Instances: string[];
  Type: 'Series';
}

export interface OrthancInstance {
  ID: string;
  FileSize: number;
  FileUuid: string;
  MainDicomTags: {
    SOPInstanceUID?: string;
    InstanceNumber?: string;
  };
  Type: 'Instance';
}

@Injectable()
export class OrthancService {
  private readonly logger = new Logger(OrthancService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('ORTHANC_URL') ||
      'http://localhost:8042';
    this.username =
      this.configService.get<string>('ORTHANC_USERNAME') || 'orthanc';
    this.password =
      this.configService.get<string>('ORTHANC_PASSWORD') || 'orthanc';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      auth: {
        username: this.username,
        password: this.password,
      },
    });
  }

  /**
   * Obtener todos los pacientes
   */
  async getPatients(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get('/patients');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error obteniendo pacientes: ${error.message}`);
      throw new HttpException(
        'Error al obtener pacientes de Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener información de un paciente
   */
  async getPatient(patientId: string): Promise<OrthancPatient> {
    try {
      const response = await this.axiosInstance.get(`/patients/${patientId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error obteniendo paciente ${patientId}: ${error.message}`);
      if (error.response?.status === 404) {
        throw new HttpException('Paciente no encontrado', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error al obtener paciente de Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Buscar pacientes por nombre o ID
   */
  async searchPatients(query: {
    PatientName?: string;
    PatientID?: string;
  }): Promise<string[]> {
    try {
      const response = await this.axiosInstance.post('/tools/find', {
        Level: 'Patient',
        Query: query,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error buscando pacientes: ${error.message}`);
      throw new HttpException(
        'Error al buscar pacientes en Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener estudios de un paciente
   */
  async getPatientStudies(patientId: string): Promise<OrthancStudy[]> {
    try {
      const patient = await this.getPatient(patientId);
      const studies: OrthancStudy[] = [];

      for (const studyId of patient.Studies) {
        const study = await this.getStudy(studyId);
        studies.push(study);
      }

      return studies;
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo estudios del paciente ${patientId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener información de un estudio
   */
  async getStudy(studyId: string): Promise<OrthancStudy> {
    try {
      const response = await this.axiosInstance.get(`/studies/${studyId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error obteniendo estudio ${studyId}: ${error.message}`);
      if (error.response?.status === 404) {
        throw new HttpException('Estudio no encontrado', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error al obtener estudio de Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener series de un estudio
   */
  async getStudySeries(studyId: string): Promise<OrthancSeries[]> {
    try {
      const study = await this.getStudy(studyId);
      const series: OrthancSeries[] = [];

      for (const seriesId of study.Series) {
        const seriesData = await this.getSeries(seriesId);
        series.push(seriesData);
      }

      return series;
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo series del estudio ${studyId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener información de una serie
   */
  async getSeries(seriesId: string): Promise<OrthancSeries> {
    try {
      const response = await this.axiosInstance.get(`/series/${seriesId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error obteniendo serie ${seriesId}: ${error.message}`);
      if (error.response?.status === 404) {
        throw new HttpException('Serie no encontrada', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error al obtener serie de Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener instancias de una serie
   */
  async getSeriesInstances(seriesId: string): Promise<OrthancInstance[]> {
    try {
      const series = await this.getSeries(seriesId);
      const instances: OrthancInstance[] = [];

      for (const instanceId of series.Instances) {
        const instance = await this.getInstance(instanceId);
        instances.push(instance);
      }

      return instances;
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo instancias de la serie ${seriesId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener información de una instancia
   */
  async getInstance(instanceId: string): Promise<OrthancInstance> {
    try {
      const response = await this.axiosInstance.get(`/instances/${instanceId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo instancia ${instanceId}: ${error.message}`,
      );
      if (error.response?.status === 404) {
        throw new HttpException(
          'Instancia no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Error al obtener instancia de Orthanc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener archivo DICOM de una instancia
   */
  async getInstanceFile(instanceId: string): Promise<Buffer> {
    try {
      const response = await this.axiosInstance.get(
        `/instances/${instanceId}/file`,
        {
          responseType: 'arraybuffer',
        },
      );
      return Buffer.from(response.data);
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo archivo de instancia ${instanceId}: ${error.message}`,
      );
      throw new HttpException(
        'Error al obtener archivo DICOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener preview/thumbnail de una instancia
   */
  async getInstancePreview(instanceId: string): Promise<Buffer> {
    try {
      const response = await this.axiosInstance.get(
        `/instances/${instanceId}/preview`,
        {
          responseType: 'arraybuffer',
        },
      );
      return Buffer.from(response.data);
    } catch (error: any) {
      this.logger.error(
        `Error obteniendo preview de instancia ${instanceId}: ${error.message}`,
      );
      throw new HttpException(
        'Error al obtener preview de imagen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Subir archivo DICOM a Orthanc
   */
  async uploadDicomFile(file: Buffer): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/instances', file, {
        headers: {
          'Content-Type': 'application/dicom',
        },
      });
      return response.data.ID;
    } catch (error: any) {
      this.logger.error(`Error subiendo archivo DICOM: ${error.message}`);
      throw new HttpException(
        'Error al subir archivo DICOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verificar conexión con Orthanc
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/system');
      const ok = response.status === 200;
      this.logger.log(`[Integration:Orthanc] Health check: ${ok ? 'OK' : 'FAIL'}`);
      return ok;
    } catch (error: any) {
      this.logger.warn(`[Integration:Orthanc] Health check fallido: ${error.message}`);
      return false;
    }
  }
}
