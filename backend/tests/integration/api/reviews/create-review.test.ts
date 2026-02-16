import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import appointmentsRoutes from '../../../../src/routes/appointments.routes';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import { clearTestDatabase } from '../../../setup/test-db';
import {
  createTestAppointment,
  createTestDoctor,
  createTestSlot,
  createTestUser,
} from '../../../helpers/factories';

describe('Reviews Create API (Integration)', () => {
  let app: Express;
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

  async function createAppointmentForReview(
    status: 'completed' | 'confirmed' = 'completed'
  ) {
    const slot = await createTestSlot(AppDataSource as any, doctorId, {
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });

    return createTestAppointment(AppDataSource as any, {
      patientId,
      doctorId,
      slotId: slot.id,
      appointmentDate: slot.startTime,
      status,
    });
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    app = createTestApp();
    await clearTestDatabase(AppDataSource as any);

    const patient = await createTestUser(AppDataSource as any, {
      email: 'hu9-patient@test.com',
      role: 'patient',
    });
    patientId = patient.id;
    patientToken = jwt.sign(
      { sub: patient.id, email: patient.email, role: patient.role },
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      { expiresIn: '15m' }
    );

    const otherPatient = await createTestUser(AppDataSource as any, {
      email: 'hu9-other-patient@test.com',
      role: 'patient',
    });
    otherPatientToken = jwt.sign(
      { sub: otherPatient.id, email: otherPatient.email, role: otherPatient.role },
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      { expiresIn: '15m' }
    );

    const doctorUser = await createTestUser(AppDataSource as any, {
      email: 'hu9-doctor@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(AppDataSource as any, doctorUser, {
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('debe crear reseña pendiente exitosamente', async () => {
    const appointment = await createAppointmentForReview('completed');

    const response = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 5,
        comment: 'Excelente atención del médico, muy profesional y puntual.',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.moderationStatus).toBe('pending');
    expect(response.body.appointmentId).toBe(appointment.id);
  });

  it('debe retornar 403 si la cita pertenece a otro paciente', async () => {
    const appointment = await createAppointmentForReview('completed');

    const response = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${otherPatientToken}`)
      .send({
        rating: 4,
        comment: 'Muy buen trato y diagnóstico claro.',
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN_REVIEW_APPOINTMENT');
  });

  it('debe retornar 400 si la cita no está completada', async () => {
    const appointment = await createAppointmentForReview('confirmed');

    const response = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 4,
        comment: 'Buena atención general.',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('APPOINTMENT_NOT_COMPLETED');
  });

  it('debe retornar 409 cuando ya existe reseña para la cita', async () => {
    const appointment = await createAppointmentForReview('completed');

    await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 5,
        comment: 'Primera reseña válida de prueba.',
      });

    const duplicate = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 3,
        comment: 'Intento de reseña duplicada para misma cita.',
      });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe('REVIEW_ALREADY_EXISTS');
  });

  it('debe retornar 400 para rating/comentario inválidos', async () => {
    const appointment = await createAppointmentForReview('completed');

    const response = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 6,
        comment: 'corto',
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_REVIEW_DATA');
  });

  it('debe sanitizar HTML/JS en comentario', async () => {
    const appointment = await createAppointmentForReview('completed');

    const response = await request(app)
      .post(`/api/v1/appointments/${appointment.id}/reviews`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        rating: 5,
        comment: 'Excelente <script>alert("xss")</script> servicio <b>gracias</b> doctor.',
      });

    expect(response.status).toBe(201);
    expect(response.body.comment).not.toContain('<script>');
    expect(response.body.comment).not.toContain('<b>');
    expect(response.body.comment).toContain('Excelente');
  });
});
