import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HceService } from './hce.service';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { Allergy } from './entities/allergy.entity';
import { Medication } from './entities/medication.entity';
import { EncryptionService } from './services/encryption.service';
import { MetricsService } from '../monitoring/metrics.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { v4 as uuidv4 } from 'uuid';

describe('HceService', () => {
  let service: HceService;
  let patientRepository: Repository<Patient>;
  let medicalRecordRepository: Repository<MedicalRecord>;
  let encryptionService: EncryptionService;
  let metricsService: MetricsService;

  const queryBuilderInstance = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn(),
  };
  const mockPatientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilderInstance),
  };

  const mockMedicalRecordRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAllergyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockMedicationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockEncryptionService = {
    encrypt: jest.fn((text: string) => Buffer.from(`encrypted-${text}`)),
    decrypt: jest.fn((buffer: Buffer) => buffer.toString().replace('encrypted-', '')),
    hash: jest.fn((text: string) => `hashed-${text}`),
  };

  const mockMetricsService = {
    recordPatientCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HceService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockMedicalRecordRepository,
        },
        {
          provide: getRepositoryToken(Allergy),
          useValue: mockAllergyRepository,
        },
        {
          provide: getRepositoryToken(Medication),
          useValue: mockMedicationRepository,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<HceService>(HceService);
    patientRepository = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    medicalRecordRepository = module.get<Repository<MedicalRecord>>(
      getRepositoryToken(MedicalRecord),
    );
    encryptionService = module.get<EncryptionService>(EncryptionService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockPatientRepository.find.mockResolvedValue([]); // findPatientBySSN usa find(); por defecto ninguno
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createPatient', () => {
    const userId = uuidv4();
    const createPatientDto: CreatePatientDto = {
      firstName: 'Juan',
      lastName: 'Pérez',
      dateOfBirth: '1990-01-01',
      gender: 'M',
      phone: '123456789',
      email: 'juan@example.com',
    };

    it('debería crear un paciente exitosamente', async () => {
      const patientId = uuidv4();
      const savedPatient = {
        id: patientId,
        ...createPatientDto,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientRepository.findOne.mockResolvedValue(null); // No existe paciente con mismo SSN
      mockPatientRepository.create.mockReturnValue(savedPatient);
      mockPatientRepository.save.mockResolvedValue(savedPatient);
      mockMedicalRecordRepository.create.mockReturnValue({ patientId });
      mockMedicalRecordRepository.save.mockResolvedValue({ patientId });

      const result = await service.createPatient(createPatientDto, userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(patientId);
      expect(mockPatientRepository.save).toHaveBeenCalled();
      expect(mockMetricsService.recordPatientCreated).toHaveBeenCalled();
    });

    it('debería encriptar SSN si se proporciona', async () => {
      const patientWithSSN = {
        ...createPatientDto,
        ssn: '123456789',
      };
      const patientId = uuidv4();
      const savedPatient = {
        id: patientId,
        ...createPatientDto,
        ssnEncrypted: Buffer.from('encrypted-123456789'),
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        createdBy: userId,
      };

      mockPatientRepository.findOne.mockResolvedValue(null);
      mockPatientRepository.create.mockReturnValue(savedPatient);
      mockPatientRepository.save.mockResolvedValue(savedPatient);
      mockMedicalRecordRepository.create.mockReturnValue({ patientId });
      mockMedicalRecordRepository.save.mockResolvedValue({ patientId });

      await service.createPatient(patientWithSSN, userId);

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('123456789');
    });

    it('debería lanzar BadRequestException si ya existe un paciente con el mismo SSN', async () => {
      const patientWithSSN = {
        ...createPatientDto,
        ssn: '123456789',
      };

      mockPatientRepository.find.mockResolvedValue([
        { id: uuidv4(), ssnEncrypted: Buffer.from('encrypted-123456789') },
      ]);

      await expect(service.createPatient(patientWithSSN, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findPatientById', () => {
    it('debería retornar un paciente si existe', async () => {
      const patientId = uuidv4();
      const patient = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);

      const result = await service.findPatientById(patientId);

      expect(result).toEqual(patient);
      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: patientId },
        relations: ['medicalRecords', 'allergies', 'medications'],
      });
    });

    it('debería lanzar NotFoundException si el paciente no existe', async () => {
      const patientId = uuidv4();

      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.findPatientById(patientId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePatient', () => {
    it('debería actualizar un paciente existente', async () => {
      const patientId = uuidv4();
      const userId = uuidv4();
      const updateDto: UpdatePatientDto = {
        firstName: 'Juan Carlos',
      };

      const existingPatient = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      const updatedPatient = {
        ...existingPatient,
        ...updateDto,
      };

      mockPatientRepository.findOne.mockResolvedValue(existingPatient);
      mockPatientRepository.save.mockResolvedValue(updatedPatient);

      const result = await service.updatePatient(patientId, updateDto, userId);

      expect(result.firstName).toBe('Juan Carlos');
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el paciente no existe', async () => {
      const patientId = uuidv4();
      const updateDto: UpdatePatientDto = { firstName: 'Juan' };

      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePatient(patientId, updateDto, uuidv4())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería permitir actualizar SSN si es el mismo paciente (no lanzar por duplicado)', async () => {
      const patientId = uuidv4();
      const userId = uuidv4();
      const updateDto: UpdatePatientDto = { ssn: '123456789' };
      const existingPatient = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        ssnEncrypted: Buffer.from('encrypted-123456789'),
        medicalRecords: [],
        allergies: [],
        medications: [],
      };
      const updatedPatient = { ...existingPatient, ssnEncrypted: Buffer.from('encrypted-123456789') };

      mockPatientRepository.findOne.mockResolvedValue(existingPatient);
      mockPatientRepository.find.mockResolvedValue([existingPatient]); // mismo paciente con ese SSN
      mockPatientRepository.save.mockResolvedValue(updatedPatient);

      const result = await service.updatePatient(patientId, updateDto, userId);

      expect(result).toBeDefined();
      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('123456789');
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el SSN actualizado ya pertenece a otro paciente', async () => {
      const patientId = uuidv4();
      const otherPatientId = uuidv4();
      const updateDto: UpdatePatientDto = { ssn: '123456789' };
      const currentPatient = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        ssnEncrypted: null,
        medicalRecords: [],
        allergies: [],
        medications: [],
      };
      const otherPatient = {
        id: otherPatientId,
        firstName: 'Otro',
        lastName: 'Paciente',
        ssnEncrypted: Buffer.from('encrypted-123456789'),
        medicalRecords: [],
        allergies: [],
        medications: [],
      };

      mockPatientRepository.findOne.mockResolvedValue(currentPatient);
      mockPatientRepository.find.mockResolvedValue([currentPatient, otherPatient]);

      const err = await service
        .updatePatient(patientId, updateDto, uuidv4())
        .then(() => null, (e) => e);
      expect(err).toBeInstanceOf(BadRequestException);
      expect((err as BadRequestException).message).toBe(
        'Ya existe otro paciente con este número de seguridad social',
      );
    });
  });

  describe('searchPatients', () => {
    it('debería retornar lista vacía si no hay filtros que coincidan', async () => {
      const result = await service.searchPatients({});

      expect(result).toEqual([]);
      expect(mockPatientRepository.createQueryBuilder).toHaveBeenCalledWith('patient');
      expect(queryBuilderInstance.getMany).toHaveBeenCalled();
    });

    it('debería filtrar por id si se proporciona', async () => {
      const patientId = uuidv4();
      queryBuilderInstance.getMany.mockResolvedValue([{ id: patientId, firstName: 'Juan' }]);

      const result = await service.searchPatients({ id: patientId });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(patientId);
      expect(queryBuilderInstance.where).toHaveBeenCalledWith('patient.id = :id', {
        id: patientId,
      });
    });

    it('debería filtrar por firstName y lastName', async () => {
      queryBuilderInstance.getMany.mockResolvedValue([
        { firstName: 'Juan', lastName: 'Pérez' },
      ]);

      const result = await service.searchPatients({
        firstName: 'Juan',
        lastName: 'Pérez',
      });

      expect(result).toHaveLength(1);
      expect(queryBuilderInstance.andWhere).toHaveBeenCalledWith(
        'patient.firstName ILIKE :firstName',
        { firstName: '%Juan%' },
      );
      expect(queryBuilderInstance.andWhere).toHaveBeenCalledWith(
        'patient.lastName ILIKE :lastName',
        { lastName: '%Pérez%' },
      );
    });
  });

  describe('deletePatient', () => {
    it('debería eliminar un paciente existente', async () => {
      const patientId = uuidv4();
      const patient = { id: patientId, firstName: 'Juan', lastName: 'Pérez' };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockPatientRepository.remove.mockResolvedValue(patient);

      await service.deletePatient(patientId, uuidv4());

      expect(mockPatientRepository.remove).toHaveBeenCalledWith(patient);
    });

    it('debería lanzar NotFoundException si el paciente no existe', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePatient(uuidv4(), uuidv4())).rejects.toThrow(NotFoundException);
    });
  });

  describe('addAllergy', () => {
    it('debería agregar alergia a paciente', async () => {
      const patientId = uuidv4();
      const dto: CreateAllergyDto = {
        patientId,
        allergen: 'Penicilina',
        severity: 'high',
        notes: 'Anafilaxia',
      };
      const savedAllergy = { id: uuidv4(), ...dto };

      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
      mockAllergyRepository.create.mockReturnValue(savedAllergy);
      mockAllergyRepository.save.mockResolvedValue(savedAllergy);

      const result = await service.addAllergy(dto);

      expect(result.allergen).toBe('Penicilina');
      expect(mockAllergyRepository.save).toHaveBeenCalled();
    });
  });

  describe('addMedication', () => {
    it('debería agregar medicación a paciente', async () => {
      const patientId = uuidv4();
      const dto: CreateMedicationDto = {
        patientId,
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'cada 8h',
        startDate: '2024-01-01',
      };
      const savedMed = { id: uuidv4(), ...dto };

      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
      mockMedicationRepository.create.mockReturnValue(savedMed);
      mockMedicationRepository.save.mockResolvedValue(savedMed);

      const result = await service.addMedication(dto);

      expect(result.name).toBe('Paracetamol');
      expect(mockMedicationRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateMedicalRecord', () => {
    it('debería actualizar registro médico existente', async () => {
      const patientId = uuidv4();
      const record = { id: uuidv4(), patientId, medicalHistory: null };
      const updateDto: UpdateMedicalRecordDto = { medicalHistory: 'Antecedentes' };

      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
      mockMedicalRecordRepository.findOne.mockResolvedValue(record);
      mockMedicalRecordRepository.save.mockResolvedValue({ ...record, ...updateDto });

      const result = await service.updateMedicalRecord(patientId, updateDto);

      expect(result.medicalHistory).toBe('Antecedentes');
    });

    it('debería crear registro médico si no existe', async () => {
      const patientId = uuidv4();
      const newRecord = { id: uuidv4(), patientId, medicalHistory: 'Nuevo' };

      mockPatientRepository.findOne.mockResolvedValue({ id: patientId });
      mockMedicalRecordRepository.findOne.mockResolvedValue(null);
      mockMedicalRecordRepository.create.mockReturnValue(newRecord);
      mockMedicalRecordRepository.save.mockResolvedValue(newRecord);

      const result = await service.updateMedicalRecord(patientId, {
        medicalHistory: 'Nuevo',
      });

      expect(mockMedicalRecordRepository.create).toHaveBeenCalledWith({ patientId });
      expect(result).toBeDefined();
    });
  });

  describe('updateAllergy', () => {
    it('debería actualizar alergia', async () => {
      const allergyId = uuidv4();
      const allergy = { id: allergyId, allergen: 'Polen', severity: 'low' };
      const updateDto: UpdateAllergyDto = { severity: 'high' };

      mockAllergyRepository.findOne.mockResolvedValue(allergy);
      mockAllergyRepository.save.mockResolvedValue({ ...allergy, ...updateDto });

      const result = await service.updateAllergy(allergyId, updateDto);

      expect(result.severity).toBe('high');
    });

    it('debería lanzar NotFoundException si alergia no existe', async () => {
      mockAllergyRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAllergy(uuidv4(), {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAllergy', () => {
    it('debería eliminar alergia', async () => {
      const allergyId = uuidv4();
      mockAllergyRepository.findOne.mockResolvedValue({ id: allergyId });
      mockAllergyRepository.remove.mockResolvedValue(undefined);

      await service.deleteAllergy(allergyId);

      expect(mockAllergyRepository.remove).toHaveBeenCalled();
    });
  });

  describe('updateMedication', () => {
    it('debería actualizar medicación', async () => {
      const medId = uuidv4();
      const medication = { id: medId, name: 'Ibuprofeno', dosage: '400mg' };
      const updateDto: UpdateMedicationDto = { dosage: '600mg' };

      mockMedicationRepository.findOne.mockResolvedValue(medication);
      mockMedicationRepository.save.mockResolvedValue({ ...medication, ...updateDto });

      const result = await service.updateMedication(medId, updateDto);

      expect(result.dosage).toBe('600mg');
    });

    it('debería lanzar NotFoundException si medicación no existe', async () => {
      mockMedicationRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMedication(uuidv4(), {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMedication', () => {
    it('debería eliminar medicación', async () => {
      const medId = uuidv4();
      mockMedicationRepository.findOne.mockResolvedValue({ id: medId });
      mockMedicationRepository.remove.mockResolvedValue(undefined);

      await service.deleteMedication(medId);

      expect(mockMedicationRepository.remove).toHaveBeenCalled();
    });
  });

  describe('getPatientMedicalHistory', () => {
    it('debería retornar historia clínica completa', async () => {
      const patientId = uuidv4();
      const patient = {
        id: patientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        phone: '123',
        address: 'Calle 1',
        medicalRecords: [{ id: uuidv4(), patientId }],
        allergies: [],
        medications: [{ id: uuidv4(), endDate: null }],
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);

      const result = await service.getPatientMedicalHistory(patientId);

      expect(result.patient.firstName).toBe('Juan');
      expect(result.medicalRecords).toHaveLength(1);
      expect(result.allergies).toEqual([]);
      expect(result.medications).toHaveLength(1);
    });

    it('debería lanzar NotFoundException si paciente no existe', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.getPatientMedicalHistory(uuidv4())).rejects.toThrow(NotFoundException);
    });
  });
});
