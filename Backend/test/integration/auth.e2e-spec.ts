import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { truncateTestTables } from '../helpers/db.helper';
import {
  defaultRegisterPayload,
  defaultLoginPayload,
  buildRegisterPayload,
} from '../fixtures/users.fixture';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await truncateTestTables(app);
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 and create user with accessToken when valid payload', async () => {
      const payload = buildRegisterPayload({
        email: 'register-new@travelsplit.test',
      });
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        nombre: payload.nombre,
        email: payload.email,
      });
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 409 when email already exists', async () => {
      const payload = buildRegisterPayload({
        email: 'duplicate@travelsplit.test',
      });
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...payload, nombre: 'Other Name' })
        .expect(409);
    });

    it('should return 400 when validation fails', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nombre: 'A',
          email: 'invalid-email',
          contraseña: 'short',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(defaultRegisterPayload)
        .expect(201);
    });

    it('should return 200 and accessToken with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(defaultLoginPayload)
        .expect(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toMatchObject({
        email: defaultRegisterPayload.email,
      });
    });

    it('should return 401 when password is wrong', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: defaultRegisterPayload.email,
          contraseña: 'WrongPass123',
        })
        .expect(401);
    });

    it('should return 401 when email is not registered', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'unknown@travelsplit.test',
          contraseña: 'TestPass123',
        })
        .expect(401);
    });

    it('should return 400 when body is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'not-an-email', contraseña: '' })
        .expect(400);
    });
  });
});
