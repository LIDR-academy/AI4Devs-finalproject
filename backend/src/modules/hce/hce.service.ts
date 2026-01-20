import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { Allergy } from './entities/allergy.entity';
import { Medication } from './entities/medication.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { EncryptionService } from './services/encryption.service';

@Injectable()
export class HceService {
  private readonly logger = new Logger(HceService.name);

  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Allergy)
    private allergyRepository: Repository<Allergy>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Crear nuevo paciente
   */
  async createPatient(createPatientDto: CreatePatientDto, userId: string): Promise<Patient> {
    try {
      // Verificar si ya existe un paciente con el mismo SSN (si se proporciona)
      if (createPatientDto.ssn) {
        const existingPatient = await this.findPatientBySSN(createPatientDto.ssn);
        if (existingPatient) {
          throw new BadRequestException('Ya existe un paciente con este número de seguridad social');
        }
      }

      const patient = this.patientRepository.create({
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        gender: createPatientDto.gender,
        phone: createPatientDto.phone,
        email: createPatientDto.email,
        address: createPatientDto.address,
        createdBy: userId,
      });

      // Encriptar SSN si se proporciona
      if (createPatientDto.ssn) {
        patient.ssnEncrypted = this.encryptionService.encrypt(createPatientDto.ssn);
      }

      const savedPatient = await this.patientRepository.save(patient);

      // Crear registro médico inicial
      const medicalRecord = this.medicalRecordRepository.create({
        patientId: savedPatient.id,
      });
      await this.medicalRecordRepository.save(medicalRecord);

      this.logger.log(`Paciente creado: ${savedPatient.id} por usuario ${userId}`);

      return savedPatient;
    } catch (error) {
      this.logger.error(`Error creando paciente: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Buscar paciente por ID
   */
  async findPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['medicalRecords', 'allergies', 'medications'],
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return patient;
  }

  /**
   * Buscar pacientes con filtros
   */
  async searchPatients(searchDto: SearchPatientDto): Promise<Patient[]> {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    if (searchDto.id) {
      queryBuilder.where('patient.id = :id', { id: searchDto.id });
    } else {
      if (searchDto.firstName) {
        queryBuilder.andWhere('patient.firstName ILIKE :firstName', {
          firstName: `%${searchDto.firstName}%`,
        });
      }

      if (searchDto.lastName) {
        queryBuilder.andWhere('patient.lastName ILIKE :lastName', {
          lastName: `%${searchDto.lastName}%`,
        });
      }

      // Búsqueda por SSN (requiere desencriptar, solo para administradores)
      // Por ahora, no implementamos búsqueda por SSN por seguridad
    }

    return queryBuilder.getMany();
  }

  /**
   * Actualizar paciente
   */
  async updatePatient(
    id: string,
    updatePatientDto: UpdatePatientDto,
    userId: string,
  ): Promise<Patient> {
    const patient = await this.findPatientById(id);

    // Verificar duplicado de SSN si se actualiza
    if (updatePatientDto.ssn) {
      const existingPatient = await this.findPatientBySSN(updatePatientDto.ssn);
      if (existingPatient && existingPatient.id !== id) {
        throw new BadRequestException('Ya existe otro paciente con este número de seguridad social');
      }
      patient.ssnEncrypted = this.encryptionService.encrypt(updatePatientDto.ssn);
    }

    Object.assign(patient, {
      firstName: updatePatientDto.firstName ?? patient.firstName,
      lastName: updatePatientDto.lastName ?? patient.lastName,
      dateOfBirth: updatePatientDto.dateOfBirth
        ? new Date(updatePatientDto.dateOfBirth)
        : patient.dateOfBirth,
      gender: updatePatientDto.gender ?? patient.gender,
      phone: updatePatientDto.phone ?? patient.phone,
      email: updatePatientDto.email ?? patient.email,
      address: updatePatientDto.address ?? patient.address,
    });

    const updatedPatient = await this.patientRepository.save(patient);
    this.logger.log(`Paciente actualizado: ${id} por usuario ${userId}`);

    return updatedPatient;
  }

  /**
   * Eliminar paciente (soft delete)
   */
  async deletePatient(id: string, userId: string): Promise<void> {
    const patient = await this.findPatientById(id);
    await this.patientRepository.remove(patient);
    this.logger.log(`Paciente eliminado: ${id} por usuario ${userId}`);
  }

  /**
   * Agregar alergia a paciente
   */
  async addAllergy(createAllergyDto: CreateAllergyDto): Promise<Allergy> {
    const patient = await this.findPatientById(createAllergyDto.patientId);

    const allergy = this.allergyRepository.create({
      patientId: patient.id,
      allergen: createAllergyDto.allergen,
      severity: createAllergyDto.severity,
      notes: createAllergyDto.notes,
    });

    return this.allergyRepository.save(allergy);
  }

  /**
   * Agregar medicación a paciente
   */
  async addMedication(createMedicationDto: CreateMedicationDto): Promise<Medication> {
    const patient = await this.findPatientById(createMedicationDto.patientId);

    const medication = this.medicationRepository.create({
      patientId: patient.id,
      name: createMedicationDto.name,
      dosage: createMedicationDto.dosage,
      frequency: createMedicationDto.frequency,
      startDate: new Date(createMedicationDto.startDate),
      endDate: createMedicationDto.endDate ? new Date(createMedicationDto.endDate) : null,
    });

    return this.medicationRepository.save(medication);
  }

  /**
   * Obtener historia clínica completa del paciente
   */
  async getPatientMedicalHistory(patientId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: [
        'medicalRecords',
        'medicalRecords.labResults',
        'medicalRecords.images',
        'allergies',
        'medications',
      ],
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${patientId} no encontrado`);
    }

    return {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
      },
      medicalRecords: patient.medicalRecords,
      allergies: patient.allergies,
      medications: patient.medications.filter(
        (med) => !med.endDate || new Date(med.endDate) > new Date(),
      ), // Solo medicaciones activas
    };
  }

  /**
   * Buscar paciente por SSN (privado, para validación)
   */
  private async findPatientBySSN(ssn: string): Promise<Patient | null> {
    // Esta es una búsqueda ineficiente pero segura
    // En producción, considerar usar hash para búsqueda
    const patients = await this.patientRepository.find({
      where: {},
    });

    for (const patient of patients) {
      if (patient.ssnEncrypted) {
        try {
          const decryptedSSN = this.encryptionService.decrypt(patient.ssnEncrypted);
          if (decryptedSSN === ssn) {
            return patient;
          }
        } catch (error) {
          // Continuar con siguiente paciente si hay error de desencriptación
          continue;
        }
      }
    }

    return null;
  }
}
