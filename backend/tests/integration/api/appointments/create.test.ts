import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { Specialty } from '../../../../src/models/specialty.entity';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import appointmentsRoutes from '../../../../src/routes/appointments.routes';
import { notificationQueue } from '../../../../src/config/queue';
import { clearTestDatabase } from '../../../setup/test-db';
import {
  createTestUser,
  createTestDoctor,
  createTestSlot,
} from '../../../helpers/factories';

describe('Appointments Create API (Integration)', () => {
  let app: Express;
  let testDataSource = AppDataSource;
  let specialty: Specialty;
  let patientToken: string;
  let doctorId: string;
  let slotId: string;
  let appointmentDate: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);

    testApp.use('/api/v1/appointments', appointmentsRoutes);
    testApp.use(errorHandler);

    return testApp;
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();
      } catch (error) {
        console.error('Error inicializando base de datos en tests:', error);
        throw error;
      }
    }

    testDataSource = AppDataSource;
    app = createTestApp();

    await clearTestDatabase(testDataSource);

    const specialtyRepository = testDataSource.getRepository(Specialty);
    specialty = specialtyRepository.create({
      nameEs: 'Cardiología',
      nameEn: 'Cardiology',
      isActive: true,
    });
    specialty = await specialtyRepository.save(specialty);

    const patientUser = await createTestUser(testDataSource, {
      email: 'patient@test.com',
      role: 'patient',
    });

    const payload = {
      sub: patientUser.id,
      email: patientUser.email,
      role: patientUser.role,
    };
    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    patientToken = jwt.sign(payload, secret, { expiresIn: '15m' });

    const doctorUser = await createTestUser(testDataSource, {
      email: 'doctor@test.com',
      role: 'doctor',
    });

    const doctor = await createTestDoctor(testDataSource, doctorUser, {
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;

    const slot = await createTestSlot(testDataSource, doctorId);
    slotId = slot.id;

    const date = new Date(slot.startTime);
    appointmentDate = date.toISOString();
  });

  afterAll(async () => {
    await notificationQueue.close();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/v1/appointments', () => {
    it('debe retornar 201 y crear cita exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          slotId,
          appointmentDate,
          notes: 'Primera consulta',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'confirmed');
      expect(response.body).toHaveProperty('message', 'Cita reservada correctamente');
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.slotId).toBe(slotId);
    });

    it('debe retornar 409 si el slot ya fue reservado', async () => {
      const slot2 = await createTestSlot(testDataSource, doctorId, {
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const patient2 = await createTestUser(testDataSource, {
        email: 'patient2@test.com',
        role: 'patient',
      });
      const token2 = jwt.sign(
        { sub: patient2.id, email: patient2.email, role: patient2.role },
        process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          doctorId,
          slotId: slot2.id,
          appointmentDate: slot2.startTime.toISOString(),
        });
      expect(response.status).toBe(201);

      const response2 = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          slotId: slot2.id,
          appointmentDate: slot2.startTime.toISOString(),
        });

      expect(response2.status).toBe(409);
      expect(response2.body.code).toBe('SLOT_NOT_AVAILABLE');
    });

    it('debe retornar 401 sin token', async () => {
      const slot3 = await createTestSlot(testDataSource, doctorId, {
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/v1/appointments')
        .send({
          doctorId,
          slotId: slot3.id,
          appointmentDate: slot3.startTime.toISOString(),
        });

      expect(response.status).toBe(401);
    });

    it('debe retornar 400 con datos inválidos', async () => {
      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: 'invalid-uuid',
          slotId,
          appointmentDate: 'invalid-date',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_APPOINTMENT_DATA');
    });

    it('debe retornar 400 si el paciente ya tiene cita activa', async () => {
      // El paciente ya tiene cita del primer test; crear slot nuevo e intentar segunda reserva
      const slot5 = await createTestSlot(testDataSource, doctorId, {
        startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId,
          slotId: slot5.id,
          appointmentDate: slot5.startTime.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('ACTIVE_APPOINTMENT_EXISTS');
    });

    it('debe prevenir doble booking cuando dos pacientes reservan simultáneamente', async () => {
      const slot6 = await createTestSlot(testDataSource, doctorId, {
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const patientConcurrent1 = await createTestUser(testDataSource, {
        email: 'patient-concurrent1@test.com',
        role: 'patient',
      });
      const patientConcurrent2 = await createTestUser(testDataSource, {
        email: 'patient-concurrent2@test.com',
        role: 'patient',
      });
      const token1 = jwt.sign(
        { sub: patientConcurrent1.id, email: patientConcurrent1.email, role: patientConcurrent1.role },
        process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        { expiresIn: '15m' },
      );
      const token2 = jwt.sign(
        { sub: patientConcurrent2.id, email: patientConcurrent2.email, role: patientConcurrent2.role },
        process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        { expiresIn: '15m' },
      );

      const appointmentPayload = {
        doctorId,
        slotId: slot6.id,
        appointmentDate: slot6.startTime.toISOString(),
      };

      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/v1/appointments')
          .set('Authorization', `Bearer ${token1}`)
          .send(appointmentPayload),
        request(app)
          .post('/api/v1/appointments')
          .set('Authorization', `Bearer ${token2}`)
          .send(appointmentPayload),
      ]);

      const successCount = [response1, response2].filter((r) => r.status === 201).length;
      const conflictCount = [response1, response2].filter((r) => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(1);
    });
  });
});
