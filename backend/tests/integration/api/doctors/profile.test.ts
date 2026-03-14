import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { clearTestDatabase } from '../../../setup/test-db';
import doctorsRoutes from '../../../../src/routes/doctors.routes';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import { AuditLog } from '../../../../src/models/audit-log.entity';
import { Doctor } from '../../../../src/models/doctor.entity';
import { User } from '../../../../src/models/user.entity';
import { createTestDoctor, createTestUser } from '../../../helpers/factories';

describe('Doctors Profile API (Integration)', () => {
  let app: Express;
  let doctorToken: string;
  let patientToken: string;
  let doctorUserId: string;
  let doctorId: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);
    testApp.use('/api/v1/doctors', doctorsRoutes);
    testApp.use(errorHandler);
    return testApp;
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    app = createTestApp();
  });

  beforeEach(async () => {
    await clearTestDatabase(AppDataSource as any);

    const doctorUser = await createTestUser(AppDataSource as any, {
      email: 'doctor-profile@test.com',
      role: 'doctor',
      firstName: 'Marta',
      lastName: 'López',
      phone: '+5215511122233',
    });
    doctorUserId = doctorUser.id;

    const doctor = await createTestDoctor(AppDataSource as any, doctorUser, {
      address: 'Av. Reforma 200',
      postalCode: '06000',
      bio: 'Médica internista',
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;

    const patientUser = await createTestUser(AppDataSource as any, {
      email: 'patient-profile@test.com',
      role: 'patient',
    });

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    doctorToken = jwt.sign(
      { sub: doctorUser.id, email: doctorUser.email, role: doctorUser.role },
      secret,
      { expiresIn: '15m' }
    );
    patientToken = jwt.sign(
      { sub: patientUser.id, email: patientUser.email, role: patientUser.role },
      secret,
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('GET /api/v1/doctors/me debe retornar el perfil del médico autenticado', async () => {
    const response = await request(app)
      .get('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(response.body.id).toBe(doctorId);
    expect(response.body.userId).toBe(doctorUserId);
    expect(response.body.email).toBe('doctor-profile@test.com');
    expect(response.body.firstName).toBe('Marta');
    expect(response.body.lastName).toBe('López');
    expect(response.body.address).toBe('Av. Reforma 200');
    expect(response.body.postalCode).toBe('06000');
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('GET /api/v1/doctors/me debe retornar 403 para usuario no doctor', async () => {
    const response = await request(app)
      .get('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);

    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('PATCH /api/v1/doctors/me debe actualizar perfil y registrar auditoría', async () => {
    const response = await request(app)
      .patch('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        firstName: 'María',
        lastName: 'García',
        phone: '+5215512345678',
        bio: 'Especialista en medicina interna',
        address: 'Av. Insurgentes 500',
        postalCode: '03100',
      })
      .expect(200);

    expect(response.body.message).toBe('Perfil médico actualizado correctamente');
    expect(response.body.doctor.firstName).toBe('María');
    expect(response.body.doctor.lastName).toBe('García');
    expect(response.body.doctor.phone).toBe('+5215512345678');
    expect(response.body.doctor.address).toBe('Av. Insurgentes 500');
    expect(response.body.doctor.postalCode).toBe('03100');

    const userRepo = AppDataSource.getRepository(User);
    const doctorRepo = AppDataSource.getRepository(Doctor);
    const auditRepo = AppDataSource.getRepository(AuditLog);

    const updatedUser = await userRepo.findOneOrFail({ where: { id: doctorUserId } });
    const updatedDoctor = await doctorRepo.findOneOrFail({ where: { id: doctorId } });
    const audit = await auditRepo.findOne({
      where: { entityId: doctorId, action: 'update_doctor_profile' },
      order: { timestamp: 'DESC' },
    });

    expect(updatedUser.firstName).toBe('María');
    expect(updatedUser.lastName).toBe('García');
    expect(updatedDoctor.address).toBe('Av. Insurgentes 500');
    expect(audit).toBeDefined();
    expect(audit?.oldValues).toContain('Av. Reforma 200');
    expect(audit?.newValues).toContain('Av. Insurgentes 500');
  });

  it('PATCH /api/v1/doctors/me debe retornar 400 con teléfono inválido', async () => {
    const response = await request(app)
      .patch('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        phone: '5512345678',
      })
      .expect(400);

    expect(response.body.code).toBe('INVALID_PROFILE_DATA');
  });

  it('PATCH /api/v1/doctors/me debe retornar 400 si intenta modificar email', async () => {
    const response = await request(app)
      .patch('/api/v1/doctors/me')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        email: 'otro@email.com',
      })
      .expect(400);

    expect(response.body.code).toBe('EMAIL_IMMUTABLE');
  });
});
