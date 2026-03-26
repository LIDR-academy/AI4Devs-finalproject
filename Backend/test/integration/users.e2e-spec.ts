import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { registerAndGetToken, loginAndGetToken } from '../helpers/auth.helper';
import { truncateTestTables } from '../helpers/db.helper';
import {
  defaultRegisterPayload,
  buildRegisterPayload,
  buildUpdateUserPayload,
} from '../fixtures/users.fixture';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await truncateTestTables(app);
  });

  beforeEach(async () => {
    const tokens = await registerAndGetToken(app, {
      ...defaultRegisterPayload,
      email: 'users-e2e@travelsplit.test',
    });
    accessToken = tokens.accessToken;
    userId = tokens.userId;
  });

  describe('GET /api/users', () => {
    it('should return 200 and list of users when requested', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const user = res.body.find((u: { id: string }) => u.id === userId);
      expect(user).toBeDefined();
      expect(user).toHaveProperty('nombre');
      expect(user).toHaveProperty('email');
      expect(user).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 and user when id exists', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200);
      expect(res.body.id).toBe(userId);
      expect(res.body).toHaveProperty('nombre');
      expect(res.body).toHaveProperty('email');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174099';
      await request(app.getHttpServer())
        .get(`/api/users/${nonExistentUuid}`)
        .expect(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 200 and update user when authorized', async () => {
      const payload = buildUpdateUserPayload({ nombre: 'Updated E2E Name' });
      const res = await request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.id).toBe(userId);
    });

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .send(buildUpdateUserPayload())
        .expect(401);
    });

    it('should return 403 when updating another user', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-user@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(buildUpdateUserPayload({ nombre: 'Hacked' }))
        .expect(403);
    });
  });
});
