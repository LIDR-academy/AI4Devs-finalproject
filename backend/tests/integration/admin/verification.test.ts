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
import { VerificationDocument } from '../../../src/models/verification-document.entity';

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

  it('PATCH /api/v1/admin/verification/:doctorId/approve deja doctor en pending si existe documento no aprobado', async () => {
    const documentsRepo = AppDataSource.getRepository(VerificationDocument);

    await documentsRepo.save(
      documentsRepo.create({
        doctorId,
        filePath: '/tmp/doc-1.pdf',
        originalFilename: 'doc-1.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: '1024',
        documentType: 'cedula',
        status: 'approved',
      })
    );

    await documentsRepo.save(
      documentsRepo.create({
        doctorId,
        filePath: '/tmp/doc-2.pdf',
        originalFilename: 'doc-2.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: '1024',
        documentType: 'diploma',
        status: 'rejected',
      })
    );

    await request(app)
      .patch(`/api/v1/admin/verification/${doctorId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Falta re-subir diploma' })
      .expect(200);

    const dbDoctor = await AppDataSource.getRepository(Doctor).findOneOrFail({
      where: { id: doctorId },
    });
    expect(dbDoctor.verificationStatus).toBe('pending');
  });

  it('GET /api/v1/admin/verification?status=pending incluye doctores con documento pendiente aunque estado doctor sea approved', async () => {
    const doctorRepo = AppDataSource.getRepository(Doctor);
    const documentsRepo = AppDataSource.getRepository(VerificationDocument);

    await doctorRepo.update({ id: doctorId }, { verificationStatus: 'approved' });
    await documentsRepo.save(
      documentsRepo.create({
        doctorId,
        filePath: '/tmp/doc-pending.pdf',
        originalFilename: 'doc-pending.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: '1024',
        documentType: 'cedula',
        status: 'pending',
      })
    );

    const response = await request(app)
      .get('/api/v1/admin/verification?status=pending&page=1&limit=20')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.some((item: { doctorId: string }) => item.doctorId === doctorId)).toBe(
      true
    );
  });
});
