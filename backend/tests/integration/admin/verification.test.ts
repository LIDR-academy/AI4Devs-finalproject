import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../src/config/database';
import adminRoutes from '../../../src/routes/admin.routes';
import { errorHandler } from '../../../src/middleware/error-handler.middleware';
import { clearTestDatabase } from '../../setup/test-db';
import { createTestDoctor, createTestUser } from '../../helpers/factories';
import { Doctor } from '../../../src/models/doctor.entity';

describe('Admin Verification API (Integration)', () => {
  let app: Express;
  let adminToken: string;
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
      email: 'admin-verification@test.com',
      role: 'admin',
    });
    const doctorUser = await createTestUser(AppDataSource as never, {
      email: 'doctor-verification-admin@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(AppDataSource as never, doctorUser, {
      verificationStatus: 'pending',
    });
    doctorId = doctor.id;

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

  it('PATCH /api/v1/admin/verification/:doctorId/approve actualiza estado', async () => {
    await request(app)
      .patch(`/api/v1/admin/verification/${doctorId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Documentación completa' })
      .expect(200);

    const dbDoctor = await AppDataSource.getRepository(Doctor).findOneOrFail({
      where: { id: doctorId },
    });
    expect(dbDoctor.verificationStatus).toBe('approved');
    expect(dbDoctor.verifiedBy).toBeDefined();
    expect(dbDoctor.verifiedAt).toBeDefined();
  });
});
