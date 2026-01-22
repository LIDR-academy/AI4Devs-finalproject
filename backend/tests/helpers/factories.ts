import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/models/user.entity';
import { AuditLog } from '../../src/models/audit-log.entity';
import { Doctor } from '../../src/models/doctor.entity';
import { Specialty } from '../../src/models/specialty.entity';

export async function createTestUser(
  dataSource: DataSource,
  overrides: Partial<User> = {},
): Promise<User> {
  const userRepository = dataSource.getRepository(User);
  
  const defaultUser = {
    email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    password: await bcrypt.hash('password123', 12),
    firstName: 'Test',
    lastName: 'User',
    role: 'patient' as const,
    emailVerified: false,
    ...overrides,
  };

  return await userRepository.save(userRepository.create(defaultUser));
}

export async function createTestAuditLog(
  dataSource: DataSource,
  overrides: Partial<AuditLog> = {},
): Promise<AuditLog> {
  const auditLogRepository = dataSource.getRepository(AuditLog);
  
  const defaultLog = {
    action: 'register',
    entityType: 'user',
    entityId: 'test-entity-id',
    userId: 'test-user-id',
    ipAddress: '192.168.1.1',
    ...overrides,
  };

  return await auditLogRepository.save(auditLogRepository.create(defaultLog));
}

export async function createTestDoctor(
  dataSource: DataSource,
  user: User,
  overrides: Partial<Doctor> = {},
): Promise<Doctor> {
  const doctorRepository = dataSource.getRepository(Doctor);
  const userRepository = dataSource.getRepository(User);

  // Verificar que el usuario existe en la base de datos antes de crear el doctor
  // Reintentar hasta 3 veces con delays crecientes para manejar problemas de timing
  let existingUser = await userRepository.findOne({ where: { id: user.id } });
  if (!existingUser) {
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      existingUser = await userRepository.findOne({ where: { id: user.id } });
      if (existingUser) break;
    }
  }
  
  if (!existingUser) {
    throw new Error(`Usuario con id ${user.id} no existe en la base de datos después de 3 intentos. Email: ${user.email}`);
  }

  const defaultDoctor = {
    userId: user.id,
    address: 'Av. Reforma 123, Col. Centro',
    postalCode: '06000',
    latitude: 19.4326,
    longitude: -99.1332,
    bio: 'Médico especialista',
    verificationStatus: 'pending' as const,
    ratingAverage: 0.0,
    totalReviews: 0,
    ...overrides,
  };

  const doctor = doctorRepository.create(defaultDoctor);
  return await doctorRepository.save(doctor);
}

export async function createTestSpecialty(
  dataSource: DataSource,
  overrides: Partial<Specialty> = {},
): Promise<Specialty> {
  const specialtyRepository = dataSource.getRepository(Specialty);

  const defaultSpecialty = {
    nameEs: 'Medicina General',
    nameEn: 'General Medicine',
    isActive: true,
    ...overrides,
  };

  return await specialtyRepository.save(specialtyRepository.create(defaultSpecialty));
}

export async function assignSpecialtyToDoctor(
  dataSource: DataSource,
  doctor: Doctor,
  specialty: Specialty,
): Promise<void> {
  // Usar query directa para evitar problemas con relaciones
  // Verificar que el doctor existe (con reintentos)
  const doctorRepo = dataSource.getRepository(Doctor);
  let existingDoctor = await doctorRepo.findOne({
    where: { id: doctor.id },
  });
  
  // Reintentar hasta 3 veces con delays crecientes
  if (!existingDoctor) {
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      existingDoctor = await doctorRepo.findOne({
        where: { id: doctor.id },
      });
      if (existingDoctor) break;
    }
    
    if (!existingDoctor) {
      throw new Error(`Doctor con id ${doctor.id} no existe después de 3 intentos`);
    }
  }

  // Verificar que la especialidad existe
  const specialtyRepo = dataSource.getRepository(Specialty);
  const existingSpecialty = await specialtyRepo.findOne({
    where: { id: specialty.id },
  });
  
  if (!existingSpecialty) {
    throw new Error(`Specialty con id ${specialty.id} no existe`);
  }

  // Insertar directamente en la tabla de relación
  try {
    await dataSource.query(
      `INSERT IGNORE INTO DOCTOR_SPECIALTIES (doctor_id, specialty_id, is_primary, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [doctor.id, specialty.id, false]
    );
  } catch (error: any) {
    // Si ya existe, no hacer nada (INSERT IGNORE ya lo maneja)
    // Solo lanzar error si es otro tipo de error
    if (error.code !== 'ER_DUP_ENTRY' && !error.message?.includes('Duplicate entry')) {
      throw error;
    }
  }
}
