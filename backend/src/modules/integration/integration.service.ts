import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../hce/entities/patient.entity';
import { MedicalRecord } from '../hce/entities/medical-record.entity';
import { LabResult } from '../hce/entities/lab-result.entity';
import { Image } from '../hce/entities/image.entity';
import { LabWebhookPayloadDto } from './dto/lab-webhook.dto';

const INTEGRATION_LOG_PREFIX = '[Integration]';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private configService: ConfigService,
    private orthancService: OrthancService,
    private hl7Service: HL7Service,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(LabResult)
    private labResultRepository: Repository<LabResult>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  /**
   * Procesar webhook de laboratorio: recibe resultados externos y los persiste en HCE.
   */
  async processLabWebhook(payload: LabWebhookPayloadDto): Promise<{ saved: number; patientId: string }> {
    this.logger.log(
      `${INTEGRATION_LOG_PREFIX} [Lab:Webhook] Recibido webhook para paciente ${payload.patientId}, ${payload.observations?.length ?? 0} resultado(s), sourceLabId=${payload.sourceLabId ?? 'N/A'}`,
    );
    if (!payload.observations?.length) {
      this.logger.warn(`${INTEGRATION_LOG_PREFIX} [Lab:Webhook] Payload sin observaciones, ignorando`);
      return { saved: 0, patientId: payload.patientId };
    }
    const patient = await this.patientRepository.findOne({
      where: { id: payload.patientId },
      relations: ['medicalRecords'],
    });
    if (!patient) {
      this.logger.warn(`${INTEGRATION_LOG_PREFIX} [Lab:Webhook] Paciente no encontrado: ${payload.patientId}`);
      throw new BadRequestException(`Paciente ${payload.patientId} no encontrado`);
    }
    let medicalRecord = patient.medicalRecords?.[0];
    if (!medicalRecord) {
      medicalRecord = this.medicalRecordRepository.create({ patientId: patient.id });
      medicalRecord = await this.medicalRecordRepository.save(medicalRecord);
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Lab:Webhook] Registro médico creado para paciente ${payload.patientId}`);
    }
    let saved = 0;
    for (const obs of payload.observations) {
      const testDate = obs.effectiveDateTime ? new Date(obs.effectiveDateTime) : new Date();
      const labResult = this.labResultRepository.create({
        medicalRecordId: medicalRecord.id,
        testName: obs.testName,
        results: {
          value: obs.value,
          unit: obs.unit,
          interpretation: obs.interpretation,
          code: obs.code,
          sourceLabId: payload.sourceLabId,
        },
        testDate,
      });
      await this.labResultRepository.save(labResult);
      saved++;
    }
    this.logger.log(
      `${INTEGRATION_LOG_PREFIX} [Lab:Webhook] Guardados ${saved} resultado(s) para paciente ${payload.patientId}`,
    );
    return { saved, patientId: payload.patientId };
  }

  /**
   * Sincronizar imágenes DICOM de Orthanc con paciente en HCE
   */
  async syncDicomImagesToPatient(patientId: string): Promise<void> {
    this.logger.log(`${INTEGRATION_LOG_PREFIX} [DICOM] Iniciando sincronización para paciente ${patientId}`);
    try {
      // Buscar paciente en Orthanc por ID
      const orthancPatients = await this.orthancService.searchPatients({
        PatientID: patientId,
      });

      if (orthancPatients.length === 0) {
        this.logger.warn(`${INTEGRATION_LOG_PREFIX} [DICOM] No se encontraron imágenes DICOM para paciente ${patientId}`);
        return;
      }

      // Obtener o crear registro médico del paciente
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['medicalRecords'],
      });

      if (!patient) {
        throw new Error(`Paciente ${patientId} no encontrado`);
      }

      let medicalRecord = patient.medicalRecords?.[0];
      if (!medicalRecord) {
        medicalRecord = this.medicalRecordRepository.create({
          patientId: patient.id,
        });
        medicalRecord = await this.medicalRecordRepository.save(medicalRecord);
      }

      // Para cada paciente en Orthanc, obtener estudios y series
      for (const orthancPatientId of orthancPatients) {
        const studies = await this.orthancService.getPatientStudies(
          orthancPatientId,
        );

        for (const study of studies) {
          const series = await this.orthancService.getStudySeries(study.ID);

          for (const serie of series) {
            // Guardar referencia a la imagen en la base de datos
            const image = this.imageRepository.create({
              medicalRecordId: medicalRecord.id,
              filePath: `orthanc://instances/${serie.Instances[0]}`, // Referencia a Orthanc
              imageType: serie.MainDicomTags.Modality?.toLowerCase() || 'unknown',
            });

            await this.imageRepository.save(image);
          }
        }
      }

      this.logger.log(`Imágenes DICOM sincronizadas para paciente ${patientId}`);
    } catch (error: any) {
      this.logger.error(
        `Error sincronizando imágenes DICOM: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Sincronizar resultados de laboratorio desde servidor FHIR
   */
  async syncLabResultsFromFHIR(patientId: string): Promise<void> {
    this.logger.log(`${INTEGRATION_LOG_PREFIX} [FHIR] Iniciando sincronización de laboratorio para paciente ${patientId}`);
    try {
      const observations = await this.hl7Service.getPatientObservations(patientId);

      if (observations.length === 0) {
        this.logger.warn(
          `[Integration:FHIR] No se encontraron resultados de laboratorio para paciente ${patientId}`,
        );
        return;
      }

      // Obtener o crear registro médico del paciente
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: ['medicalRecords'],
      });

      if (!patient) {
        throw new Error(`Paciente ${patientId} no encontrado`);
      }

      let medicalRecord = patient.medicalRecords?.[0];
      if (!medicalRecord) {
        medicalRecord = this.medicalRecordRepository.create({
          patientId: patient.id,
        });
        medicalRecord = await this.medicalRecordRepository.save(medicalRecord);
      }

      // Guardar resultados de laboratorio
      for (const observation of observations) {
        const testName =
          observation.code.coding[0]?.display ||
          observation.code.coding[0]?.code ||
          'Unknown Test';

        const labResult = this.labResultRepository.create({
          medicalRecordId: medicalRecord.id,
          testName: testName,
          results: {
            value: observation.valueQuantity?.value || observation.valueString,
            unit: observation.valueQuantity?.unit,
            interpretation: (observation.interpretation as any)?.[0]?.display || null,
            code: observation.code.coding[0]?.code,
            system: observation.code.coding[0]?.system,
          },
          testDate: observation.effectiveDateTime
            ? new Date(observation.effectiveDateTime)
            : new Date(),
        });

        await this.labResultRepository.save(labResult);
      }

      this.logger.log(
        `${INTEGRATION_LOG_PREFIX} [FHIR] Sincronización completada para paciente ${patientId}: ${observations.length} resultado(s)`,
      );
    } catch (error: any) {
      this.logger.error(
        `${INTEGRATION_LOG_PREFIX} [FHIR] Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Sincronizar todos los datos externos de un paciente
   */
  async syncAllExternalData(patientId: string): Promise<{
    dicomImages: number;
    labResults: number;
  }> {
    try {
      // Sincronizar imágenes DICOM
      await this.syncDicomImagesToPatient(patientId);

      // Sincronizar resultados de laboratorio
      await this.syncLabResultsFromFHIR(patientId);

      // Contar elementos sincronizados
      const patient = await this.patientRepository.findOne({
        where: { id: patientId },
        relations: [
          'medicalRecords',
          'medicalRecords.images',
          'medicalRecords.labResults',
        ],
      });

      const imagesCount =
        patient?.medicalRecords?.[0]?.images?.length || 0;
      const labResultsCount =
        patient?.medicalRecords?.[0]?.labResults?.length || 0;

      return {
        dicomImages: imagesCount,
        labResults: labResultsCount,
      };
    } catch (error: any) {
      this.logger.error(
        `${INTEGRATION_LOG_PREFIX} Error sincronizando datos externos: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verificar estado de integraciones
   */
  async checkIntegrationStatus(): Promise<{
    orthanc: boolean;
    fhir: boolean;
  }> {
    this.logger.log(`${INTEGRATION_LOG_PREFIX} Verificando estado (Orthanc, FHIR)`);
    const [orthancStatus, fhirStatus] = await Promise.all([
      this.orthancService.healthCheck(),
      this.hl7Service.healthCheck(),
    ]);

    this.logger.log(
      `${INTEGRATION_LOG_PREFIX} Estado: Orthanc=${orthancStatus ? 'OK' : 'NO DISPONIBLE'}, FHIR=${fhirStatus ? 'OK' : 'NO DISPONIBLE'}`,
    );
    return {
      orthanc: orthancStatus,
      fhir: fhirStatus,
    };
  }
}
