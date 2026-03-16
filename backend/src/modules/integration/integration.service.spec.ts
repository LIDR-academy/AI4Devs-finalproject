import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { IntegrationService } from './integration.service';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { Patient } from '../hce/entities/patient.entity';
import { MedicalRecord } from '../hce/entities/medical-record.entity';
import { LabResult } from '../hce/entities/lab-result.entity';
import { Image } from '../hce/entities/image.entity';
import { v4 as uuidv4 } from 'uuid';

describe('IntegrationService', () => {
  let service: IntegrationService;
  let orthancService: OrthancService;
  let hl7Service: HL7Service;
  let patientRepository: Repository<Patient>;
  let medicalRecordRepository: Repository<MedicalRecord>;
  let labResultRepository: Repository<LabResult>;
  let imageRepository: Repository<Image>;

  const patientId = uuidv4();
  const medicalRecordId = uuidv4();

  const mockPatient = {
    id: patientId,
    firstName: 'Juan',
    lastName: 'Pérez',
    medicalRecords: [{ id: medicalRecordId, patientId }],
  } as unknown as Patient;

  const mockPatientWithoutRecord = {
    id: patientId,
    firstName: 'Juan',
    lastName: 'Pérez',
    medicalRecords: [],
  } as unknown as Patient;

  const mockObservation = {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [{ code: 'GLU', display: 'Glucosa', system: 'http://loinc.org' }],
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: '2025-01-15T10:00:00Z',
    valueQuantity: { value: 95, unit: 'mg/dL' },
  };

  const mockOrthancStudy = {
    ID: 'study-1',
    Series: ['series-1'],
    Type: 'Study',
  };

  const mockOrthancSeries = {
    ID: 'series-1',
    Instances: ['instance-1'],
    MainDicomTags: { Modality: 'CT' },
    Type: 'Series',
  };

  beforeEach(async () => {
    const mockPatientRepo = {
      findOne: jest.fn(),
    };
    const mockMedicalRecordRepo = {
      create: jest.fn((dto) => ({ ...dto, id: medicalRecordId })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || medicalRecordId })),
    };
    const mockLabResultRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const mockImageRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve(entity)),
      count: jest.fn().mockResolvedValue(0),
    };

    const mockOrthancService = {
      searchPatients: jest.fn(),
      getPatientStudies: jest.fn(),
      getStudySeries: jest.fn(),
      healthCheck: jest.fn().mockResolvedValue(true),
    };

    const mockHL7Service = {
      getPatientObservations: jest.fn(),
      healthCheck: jest.fn().mockResolvedValue(true),
    };

    const mockConfigService = { get: jest.fn((key: string) => undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(MedicalRecord), useValue: mockMedicalRecordRepo },
        { provide: getRepositoryToken(LabResult), useValue: mockLabResultRepo },
        { provide: getRepositoryToken(Image), useValue: mockImageRepo },
        { provide: OrthancService, useValue: mockOrthancService },
        { provide: HL7Service, useValue: mockHL7Service },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
    orthancService = module.get<OrthancService>(OrthancService);
    hl7Service = module.get<HL7Service>(HL7Service);
    patientRepository = module.get(getRepositoryToken(Patient));
    medicalRecordRepository = module.get(getRepositoryToken(MedicalRecord));
    labResultRepository = module.get(getRepositoryToken(LabResult));
    imageRepository = module.get(getRepositoryToken(Image));

    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('syncDicomImagesToPatient', () => {
    it('no debe lanzar cuando Orthanc no devuelve pacientes', async () => {
      (orthancService.searchPatients as jest.Mock).mockResolvedValue([]);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      await expect(service.syncDicomImagesToPatient(patientId)).resolves.not.toThrow();
      expect(orthancService.searchPatients).toHaveBeenCalledWith({ PatientID: patientId });
    });

    it('debe crear registro médico si no existe y sincronizar imágenes cuando Orthanc devuelve datos', async () => {
      (orthancService.searchPatients as jest.Mock).mockResolvedValue(['orthanc-patient-id']);
      (orthancService.getPatientStudies as jest.Mock).mockResolvedValue([mockOrthancStudy]);
      (orthancService.getStudySeries as jest.Mock).mockResolvedValue([mockOrthancSeries]);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(mockPatientWithoutRecord);
      (imageRepository.count as jest.Mock).mockResolvedValue(1);

      await service.syncDicomImagesToPatient(patientId);

      expect(medicalRecordRepository.create).toHaveBeenCalledWith({ patientId });
      expect(medicalRecordRepository.save).toHaveBeenCalled();
      expect(imageRepository.create).toHaveBeenCalled();
      expect(imageRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar si el paciente no existe', async () => {
      (orthancService.searchPatients as jest.Mock).mockResolvedValue(['orthanc-patient-id']);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.syncDicomImagesToPatient(patientId)).rejects.toThrow(
        `Paciente ${patientId} no encontrado`,
      );
    });
  });

  describe('syncLabResultsFromFHIR', () => {
    it('no debe lanzar cuando FHIR no devuelve observaciones', async () => {
      (hl7Service.getPatientObservations as jest.Mock).mockResolvedValue([]);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      await expect(service.syncLabResultsFromFHIR(patientId)).resolves.not.toThrow();
      expect(hl7Service.getPatientObservations).toHaveBeenCalledWith(patientId);
    });

    it('debe guardar resultados de laboratorio cuando FHIR devuelve observaciones', async () => {
      (hl7Service.getPatientObservations as jest.Mock).mockResolvedValue([mockObservation]);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(mockPatient);

      await service.syncLabResultsFromFHIR(patientId);

      expect(labResultRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          medicalRecordId,
          testName: 'Glucosa',
          results: expect.objectContaining({
            value: 95,
            unit: 'mg/dL',
          }),
        }),
      );
      expect(labResultRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar si el paciente no existe', async () => {
      (hl7Service.getPatientObservations as jest.Mock).mockResolvedValue([mockObservation]);
      (patientRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.syncLabResultsFromFHIR(patientId)).rejects.toThrow(
        `Paciente ${patientId} no encontrado`,
      );
    });
  });

  describe('syncAllExternalData', () => {
    it('debe invocar sync DICOM y FHIR y devolver conteos', async () => {
      (orthancService.searchPatients as jest.Mock).mockResolvedValue([]);
      (hl7Service.getPatientObservations as jest.Mock).mockResolvedValue([]);

      const patientWithCounts = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        medicalRecords: [
          {
            id: medicalRecordId,
            patientId,
            images: [{ id: 'img1' }],
            labResults: [{ id: 'lab1' }, { id: 'lab2' }],
          },
        ],
      };
      (patientRepository.findOne as jest.Mock).mockImplementation((options: any) => {
        // Última llamada (con relations de images/labResults) devuelve conteos
        const hasRelations = options?.relations?.some((r: string) => r.includes('images') || r.includes('labResults'));
        return Promise.resolve(hasRelations ? patientWithCounts : mockPatient);
      });

      const result = await service.syncAllExternalData(patientId);

      expect(result).toEqual({ dicomImages: 1, labResults: 2 });
      expect(orthancService.searchPatients).toHaveBeenCalledWith({ PatientID: patientId });
      expect(hl7Service.getPatientObservations).toHaveBeenCalledWith(patientId);
    });
  });

  describe('checkIntegrationStatus', () => {
    it('debe devolver estado de Orthanc y FHIR', async () => {
      (orthancService.healthCheck as jest.Mock).mockResolvedValue(true);
      (hl7Service.healthCheck as jest.Mock).mockResolvedValue(false);

      const result = await service.checkIntegrationStatus();

      expect(result).toEqual({ orthanc: true, fhir: false });
      expect(orthancService.healthCheck).toHaveBeenCalled();
      expect(hl7Service.healthCheck).toHaveBeenCalled();
    });
  });

  describe('processLabWebhook', () => {
    it('debe guardar resultados y devolver conteo cuando el paciente existe', async () => {
      (patientRepository.findOne as jest.Mock).mockResolvedValue(mockPatient);
      const payload = {
        patientId,
        sourceLabId: 'LAB-001',
        observations: [
          { testName: 'Hemoglobina', value: 14.5, unit: 'g/dL', effectiveDateTime: '2026-01-27T10:00:00Z' },
          { testName: 'Creatinina', value: 1.0, unit: 'mg/dL' },
        ],
      };

      const result = await service.processLabWebhook(payload);

      expect(result).toEqual({ saved: 2, patientId });
      expect(labResultRepository.create).toHaveBeenCalledTimes(2);
      expect(labResultRepository.save).toHaveBeenCalledTimes(2);
    });

    it('debe lanzar BadRequestException cuando el paciente no existe', async () => {
      (patientRepository.findOne as jest.Mock).mockResolvedValue(null);
      const payload = {
        patientId,
        observations: [{ testName: 'Glucosa', value: 95, unit: 'mg/dL' }],
      };

      await expect(service.processLabWebhook(payload)).rejects.toThrow('Paciente');
    });

    it('debe devolver saved: 0 cuando observations está vacío', async () => {
      const payload = { patientId, observations: [] };

      const result = await service.processLabWebhook(payload);

      expect(result).toEqual({ saved: 0, patientId });
      expect(labResultRepository.save).not.toHaveBeenCalled();
    });
  });
});
