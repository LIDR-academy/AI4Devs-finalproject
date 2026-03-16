import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HceController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Obtener token de autenticación
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123',
      });
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/hce/patients (POST)', () => {
    it('debería crear un paciente exitosamente', async () => {
      const createPatientDto = {
        firstName: 'Test',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        phone: '123456789',
        email: 'testpatient@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/hce/patients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPatientDto)
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.firstName).toBe(createPatientDto.firstName);
      expect(response.body.data.id).toBeDefined();
      
      patientId = response.body.data.id;
    });

    it('debería rechazar creación sin autenticación', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/hce/patients')
        .send({
          firstName: 'Test',
          lastName: 'Patient',
          dateOfBirth: '1990-01-01',
          gender: 'M',
        })
        .expect(401);
    });

    it('debería validar campos requeridos', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/hce/patients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Test',
          // Faltan campos requeridos
        })
        .expect(400);
    });
  });

  describe('/api/v1/hce/patients (GET)', () => {
    it('debería listar pacientes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/hce/patients')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('/api/v1/hce/patients/:id (GET)', () => {
    it('debería obtener un paciente por ID', async () => {
      if (!patientId) {
        // Crear paciente si no existe
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/hce/patients')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: 'Test',
            lastName: 'Patient',
            dateOfBirth: '1990-01-01',
            gender: 'M',
          });
        patientId = createResponse.body.data.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/hce/patients/${patientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(patientId);
    });

    it('debería retornar 404 para paciente inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/api/v1/hce/patients/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
