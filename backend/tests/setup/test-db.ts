import { DataSource } from 'typeorm';
import { User } from '../../src/models/user.entity';
import { AuditLog } from '../../src/models/audit-log.entity';
import { Doctor } from '../../src/models/doctor.entity';
import { Specialty } from '../../src/models/specialty.entity';
import { Slot } from '../../src/models/slot.entity';
import { Appointment } from '../../src/models/appointment.entity';
import { AppointmentHistory } from '../../src/models/appointment-history.entity';
import { VerificationDocument } from '../../src/models/verification-document.entity';
import { DoctorSchedule } from '../../src/models/doctor-schedule.entity';
import { Review } from '../../src/models/review.entity';

export async function createTestDataSource(): Promise<DataSource> {
  return new DataSource({
    type: 'mysql',
    host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '3306'),
    username: process.env.TEST_DB_USER || process.env.DB_USER || 'citaya_user',
    password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'citaya_password_dev',
    database: process.env.TEST_DB_NAME || 'citaya_test',
    entities: [
      User,
      AuditLog,
      Doctor,
      Specialty,
      Slot,
      Appointment,
      AppointmentHistory,
      Review,
      VerificationDocument,
      DoctorSchedule,
    ],
    synchronize: false, // Usar migraciones
    logging: false,
    migrations: ['src/migrations/**/*.ts'],
    migrationsTableName: 'migrations',
  });
}

export async function setupTestDatabase(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  await dataSource.runMigrations();
}

export async function teardownTestDatabase(dataSource: DataSource): Promise<void> {
  if (dataSource.isInitialized) {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM REVIEWS');
    await dataSource.query('DELETE FROM APPOINTMENT_HISTORY');
    await dataSource.query('DELETE FROM APPOINTMENTS');
    await dataSource.query('DELETE FROM SLOTS');
    await dataSource.query('DELETE FROM DOCTOR_SCHEDULES');
    await dataSource.query('DELETE FROM VERIFICATION_DOCUMENTS');
    await dataSource.query('DELETE FROM audit_logs');
    await dataSource.query('DELETE FROM DOCTOR_SPECIALTIES');
    await dataSource.query('DELETE FROM DOCTORS');
    await dataSource.query('DELETE FROM USERS');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    await dataSource.destroy();
  }
}

export async function clearTestDatabase(dataSource: DataSource): Promise<void> {
  if (dataSource.isInitialized) {
    try {
      // Eliminar en orden para respetar foreign keys
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await dataSource.query('DELETE FROM REVIEWS');
      await dataSource.query('DELETE FROM APPOINTMENT_HISTORY');
      await dataSource.query('DELETE FROM APPOINTMENTS');
      await dataSource.query('DELETE FROM SLOTS');
      await dataSource.query('DELETE FROM DOCTOR_SCHEDULES');
      await dataSource.query('DELETE FROM VERIFICATION_DOCUMENTS');
      await dataSource.query('DELETE FROM audit_logs');
      await dataSource.query('DELETE FROM DOCTOR_SPECIALTIES');
      await dataSource.query('DELETE FROM DOCTORS');
      await dataSource.query('DELETE FROM USERS');
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      // No eliminamos SPECIALTIES para mantener datos de prueba
    } catch (error) {
      // Si hay un error, intentar sin deshabilitar foreign keys
      // Esto puede fallar si hay datos relacionados, pero es mejor que fallar silenciosamente
      console.warn('Error al limpiar base de datos con foreign keys deshabilitadas, intentando sin deshabilitarlas:', error);
      await dataSource.query('DELETE FROM APPOINTMENT_HISTORY');
      await dataSource.query('DELETE FROM REVIEWS');
      await dataSource.query('DELETE FROM APPOINTMENTS');
      await dataSource.query('DELETE FROM SLOTS');
      await dataSource.query('DELETE FROM DOCTOR_SCHEDULES');
      await dataSource.query('DELETE FROM VERIFICATION_DOCUMENTS');
      await dataSource.query('DELETE FROM audit_logs');
      await dataSource.query('DELETE FROM DOCTOR_SPECIALTIES');
      await dataSource.query('DELETE FROM DOCTORS');
      await dataSource.query('DELETE FROM USERS');
    }
  }
}
