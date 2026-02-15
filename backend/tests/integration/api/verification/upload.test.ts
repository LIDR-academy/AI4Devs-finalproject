import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { clearTestDatabase } from '../../../setup/test-db';
import doctorsRoutes from '../../../../src/routes/doctors.routes';
import verificationRoutes from '../../../../src/routes/verification.routes';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import { AuditLog } from '../../../../src/models/audit-log.entity';
import { VerificationDocument } from '../../../../src/models/verification-document.entity';
import { createTestDoctor, createTestUser } from '../../../helpers/factories';

const ONE_MB = 1024 * 1024;
const VALID_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF',
  'utf-8'
);
const MALWARE_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\nEICAR-STANDARD-ANTIVIRUS-TEST-FILE\n%%EOF',
  'utf-8'
);

describe('Verification Documents API (Integration)', () => {
  let app: Express;
  let uploadsPath: string;
  let doctorToken: string;
  let adminToken: string;
  let patientToken: string;
  let doctorUserId: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);
    testApp.use('/api/v1/doctors', doctorsRoutes);
    testApp.use('/api/v1/verification-documents', verificationRoutes);
    testApp.use(errorHandler);
    return testApp;
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';
    process.env.MAX_FILE_SIZE_MB = '10';
    process.env.PUBLIC_API_URL = 'http://localhost:4000';
    uploadsPath = await fs.mkdtemp(path.join(os.tmpdir(), 'citaya-verification-'));
    process.env.UPLOADS_PATH = uploadsPath;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    app = createTestApp();
  });

  beforeEach(async () => {
    await clearTestDatabase(AppDataSource as never);

    const doctorUser = await createTestUser(AppDataSource as never, {
      email: 'doctor-verif@test.com',
      role: 'doctor',
    });
    doctorUserId = doctorUser.id;
    await createTestDoctor(AppDataSource as never, doctorUser, {
      verificationStatus: 'pending',
    });

    const adminUser = await createTestUser(AppDataSource as never, {
      email: 'admin-verif@test.com',
      role: 'admin',
    });
    const patientUser = await createTestUser(AppDataSource as never, {
      email: 'patient-verif@test.com',
      role: 'patient',
    });

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    doctorToken = jwt.sign(
      { sub: doctorUser.id, email: doctorUser.email, role: doctorUser.role },
      secret,
      { expiresIn: '15m' }
    );
    adminToken = jwt.sign(
      { sub: adminUser.id, email: adminUser.email, role: adminUser.role },
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
    await fs.rm(uploadsPath, { recursive: true, force: true });
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('POST /api/v1/doctors/verification debe subir archivo válido y crear auditoría', async () => {
    const response = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'cedula')
      .attach('document', VALID_PDF_BUFFER, {
        filename: 'cedula.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(response.body.document).toBeDefined();
    expect(response.body.document.documentType).toBe('cedula');
    expect(response.body.document.status).toBe('pending');

    const docRepo = AppDataSource.getRepository(VerificationDocument);
    const auditRepo = AppDataSource.getRepository(AuditLog);
    const dbDoc = await docRepo.findOneOrFail({ where: { id: response.body.document.id } });
    const audit = await auditRepo.findOne({
      where: {
        action: 'upload_verification_document',
        entityId: response.body.document.id,
        userId: doctorUserId,
      },
    });

    expect(dbDoc.mimeType).toBe('application/pdf');
    expect(dbDoc.status).toBe('pending');
    expect(audit).toBeDefined();

    const stat = await fs.stat(dbDoc.filePath);
    expect(stat.isFile()).toBe(true);
  });

  it('POST /api/v1/doctors/verification debe rechazar tipo inválido', async () => {
    const response = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'other')
      .attach('document', Buffer.from('MZ'), {
        filename: 'malware.exe',
        contentType: 'application/octet-stream',
      })
      .expect(400);

    expect(response.body.code).toBe('INVALID_FILE_TYPE');
  });

  it('POST /api/v1/doctors/verification debe rechazar tamaño excedido', async () => {
    const response = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'cedula')
      .attach('document', Buffer.alloc(11 * ONE_MB, 1), {
        filename: 'large.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);

    expect(response.body.code).toBe('FILE_TOO_LARGE');
  });

  it('POST /api/v1/doctors/verification debe rechazar malware detectado', async () => {
    const response = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'diploma')
      .attach('document', MALWARE_PDF_BUFFER, {
        filename: 'infected.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);

    expect(response.body.code).toBe('MALWARE_DETECTED');
  });

  it('GET /api/v1/doctors/verification debe listar documentos del doctor', async () => {
    await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'other')
      .attach('document', VALID_PDF_BUFFER, {
        filename: 'constancia.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const response = await request(app)
      .get('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBe(1);
    expect(response.body.documents[0].status).toBe('pending');
  });

  it('GET signed-url admin debe generar URL y permitir descarga temporal', async () => {
    const uploadResponse = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'cedula')
      .attach('document', VALID_PDF_BUFFER, {
        filename: 'id-card.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const documentId = uploadResponse.body.document.id as string;
    const signedResponse = await request(app)
      .get(`/api/v1/verification-documents/${documentId}/signed-url`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(signedResponse.body.signedUrl).toContain('/api/v1/verification-documents/file/');

    const url = new URL(signedResponse.body.signedUrl);
    const streamResponse = await request(app).get(url.pathname).expect(200);
    expect(streamResponse.header['content-type']).toContain('application/pdf');
  });

  it('GET signed-url admin debe retornar 403 para rol no admin', async () => {
    const uploadResponse = await request(app)
      .post('/api/v1/doctors/verification')
      .set('Authorization', `Bearer ${doctorToken}`)
      .field('documentType', 'cedula')
      .attach('document', VALID_PDF_BUFFER, {
        filename: 'id-card.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    await request(app)
      .get(`/api/v1/verification-documents/${uploadResponse.body.document.id}/signed-url`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);
  });
});
