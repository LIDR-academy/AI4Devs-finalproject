import { Injectable, Logger } from '@nestjs/common';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../hce/entities/patient.entity';
import { MedicalRecord } from '../hce/entities/medical-record.entity';
import { LabResult } from '../hce/entities/lab-result.entity';
import { Image } from '../hce/entities/image.entity';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
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
   * Sincronizar imágenes DICOM de Orthanc con paciente en HCE
   */
  async syncDicomImagesToPatient(patientId: string): Promise<void> {
    try {
      // Buscar paciente en Orthanc por ID
      const orthancPatients = await this.orthancService.searchPatients({
        PatientID: patientId,
      });

      if (orthancPatients.length === 0) {
        this.logger.warn(`No se encontraron imágenes DICOM para paciente ${patientId}`);
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
    try {
      const observations = await this.hl7Service.getPatientObservations(patientId);

      if (observations.length === 0) {
        this.logger.warn(
          `No se encontraron resultados de laboratorio para paciente ${patientId}`,
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
        `Resultados de laboratorio sincronizados para paciente ${patientId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error sincronizando resultados de laboratorio: ${error.message}`,
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
        `Error sincronizando datos externos: ${error.message}`,
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
    const [orthancStatus, fhirStatus] = await Promise.all([
      this.orthancService.healthCheck(),
      this.hl7Service.healthCheck(),
    ]);

    return {
      orthanc: orthancStatus,
      fhir: fhirStatus,
    };
  }
}
