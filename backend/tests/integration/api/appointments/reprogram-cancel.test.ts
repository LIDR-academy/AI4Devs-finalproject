import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import appointmentsRoutes from '../../../../src/routes/appointments.routes';
import { notificationQueue } from '../../../../src/config/queue';
import { clearTestDatabase } from '../../../setup/test-db';
import {
  createTestAppointment,
  createTestDoctor,
  createTestSlot,
  createTestUser,
} from '../../../helpers/factories';

describe('Appointments Reprogram/Cancel API (Integration)', () => {
  let app: Express;
  let testDataSource = AppDataSource;
  let patientId: string;
  let patientToken: string;
  let otherPatientToken: string;
  let doctorId: string;

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
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    testDataSource = AppDataSource;
    app = createTestApp();

    await clearTestDatabase(testDataSource);

    const patientUser = await createTestUser(testDataSource, {
      email: 'hu5-patient@test.com',
      role: 'patient',
    });
    patientId = patientUser.id;

    patientToken = jwt.sign(
      { sub: patientUser.id, email: patientUser.email, role: patientUser.role },
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      { expiresIn: '15m' }
    );

    const otherPatient = await createTestUser(testDataSource, {
      email: 'hu5-other-patient@test.com',
      role: 'patient',
    });
    otherPatientToken = jwt.sign(
      { sub: otherPatient.id, email: otherPatient.email, role: otherPatient.role },
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      { expiresIn: '15m' }
    );

    const doctorUser = await createTestUser(testDataSource, {
      email: 'hu5-doctor@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(testDataSource, doctorUser, {
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;
  });

  afterAll(async () => {
    await notificationQueue.close();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('debe cancelar cita y liberar slot', async () => {
    const slot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });

    const appointment = await createTestAppointment(testDataSource, {
      patientId,
      doctorId,
      slotId: slot.id,
      appointmentDate: slot.startTime,
      status: 'confirmed',
    });

    const response = await request(app)
      .patch(`/api/v1/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        status: 'cancelled',
        cancellationReason: 'Cambio de planes',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('cancelled');

    const slotRepo = testDataSource.getRepository('SLOTS');
    const updatedSlot = await slotRepo.findOne({ where: { id: slot.id } as any });
    expect(updatedSlot).not.toBeNull();
    expect(updatedSlot!.isAvailable).toBe(true);
  });

  it('debe reprogramar cita al nuevo slot y liberar el anterior', async () => {
    const oldSlot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });
    const newSlot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });

    const appointment = await createTestAppointment(testDataSource, {
      patientId,
      doctorId,
      slotId: oldSlot.id,
      appointmentDate: oldSlot.startTime,
      status: 'confirmed',
    });

    const response = await request(app)
      .patch(`/api/v1/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        slotId: newSlot.id,
        appointmentDate: newSlot.startTime.toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.slotId).toBe(newSlot.id);

    const slotRepo = testDataSource.getRepository('SLOTS');
    const oldSlotAfter = await slotRepo.findOne({ where: { id: oldSlot.id } as any });
    const newSlotAfter = await slotRepo.findOne({ where: { id: newSlot.id } as any });
    expect(oldSlotAfter).not.toBeNull();
    expect(newSlotAfter).not.toBeNull();
    expect(oldSlotAfter!.isAvailable).toBe(true);
    expect(newSlotAfter!.isAvailable).toBe(false);
  });

  it('debe retornar 403 si otro paciente intenta cancelar cita ajena', async () => {
    const slot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });
    const appointment = await createTestAppointment(testDataSource, {
      patientId,
      doctorId,
      slotId: slot.id,
      appointmentDate: slot.startTime,
      status: 'confirmed',
    });

    const response = await request(app)
      .patch(`/api/v1/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${otherPatientToken}`)
      .send({ status: 'cancelled' });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN_APPOINTMENT');
  });

  it('debe retornar 409 al reprogramar a slot no disponible', async () => {
    const patientConflict = await createTestUser(testDataSource, {
      email: 'hu5-conflict-patient@test.com',
      role: 'patient',
    });
    const patientConflictToken = jwt.sign(
      {
        sub: patientConflict.id,
        email: patientConflict.email,
        role: patientConflict.role,
      },
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      { expiresIn: '15m' }
    );

    const oldSlot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });
    const newSlot = await createTestSlot(testDataSource, doctorId, {
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      isAvailable: false,
    });
    const appointment = await createTestAppointment(testDataSource, {
      patientId: patientConflict.id,
      doctorId,
      slotId: oldSlot.id,
      appointmentDate: oldSlot.startTime,
      status: 'confirmed',
    });

    const response = await request(app)
      .patch(`/api/v1/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${patientConflictToken}`)
      .send({
        slotId: newSlot.id,
        appointmentDate: newSlot.startTime.toISOString(),
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('SLOT_NOT_AVAILABLE');
  });

  it('debe listar citas del paciente autenticado', async () => {
    const response = await request(app)
      .get('/api/v1/appointments?status=confirmed&page=1&limit=5')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.appointments)).toBe(true);
    expect(response.body.pagination).toBeDefined();
  });
});
