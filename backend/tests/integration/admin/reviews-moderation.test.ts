import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../src/config/database';
import adminRoutes from '../../../src/routes/admin.routes';
import { errorHandler } from '../../../src/middleware/error-handler.middleware';
import { clearTestDatabase } from '../../setup/test-db';
import {
  createTestAppointment,
  createTestDoctor,
  createTestSlot,
  createTestUser,
} from '../../helpers/factories';
import { Review } from '../../../src/models/review.entity';
import { Doctor } from '../../../src/models/doctor.entity';

describe('Admin Reviews Moderation API (Integration)', () => {
  let app: Express;
  let adminToken: string;
  let reviewId: string;
  let doctorId: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);
    testApp.use('/api/v1/admin', adminRoutes);
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
    await clearTestDatabase(AppDataSource as never);

    const adminUser = await createTestUser(AppDataSource as never, {
      email: 'admin-review@test.com',
      role: 'admin',
    });
    const patient = await createTestUser(AppDataSource as never, {
      email: 'patient-review@test.com',
      role: 'patient',
    });
    const doctorUser = await createTestUser(AppDataSource as never, {
      email: 'doctor-review@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(AppDataSource as never, doctorUser, {
      verificationStatus: 'approved',
      ratingAverage: 0,
      totalReviews: 0,
    });
    doctorId = doctor.id;

    const slot = await createTestSlot(AppDataSource as never, doctor.id, {
      startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });
    const appointment = await createTestAppointment(AppDataSource as never, {
      patientId: patient.id,
      doctorId: doctor.id,
      slotId: slot.id,
      status: 'completed',
      appointmentDate: slot.startTime,
    });

    const review = await AppDataSource.getRepository(Review).save(
      AppDataSource.getRepository(Review).create({
        appointmentId: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id,
        rating: 5,
        comment: 'Excelente trato y seguimiento de la consulta.',
        moderationStatus: 'pending',
      })
    );
    reviewId = review.id;

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    adminToken = jwt.sign(
      { sub: adminUser.id, email: adminUser.email, role: adminUser.role },
      secret,
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('PATCH /api/v1/admin/reviews/:reviewId/approve aprueba y recalcula rating del médico', async () => {
    await request(app)
      .patch(`/api/v1/admin/reviews/${reviewId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Contenido aprobado' })
      .expect(200);

    const review = await AppDataSource.getRepository(Review).findOneOrFail({
      where: { id: reviewId },
    });
    const doctor = await AppDataSource.getRepository(Doctor).findOneOrFail({
      where: { id: doctorId },
    });

    expect(review.moderationStatus).toBe('approved');
    expect(review.moderatedBy).toBeDefined();
    expect(Number(doctor.ratingAverage)).toBeGreaterThanOrEqual(5);
    expect(doctor.totalReviews).toBe(1);
  });
});
