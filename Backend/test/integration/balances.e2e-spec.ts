import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { registerAndGetToken } from '../helpers/auth.helper';
import { truncateTestTables } from '../helpers/db.helper';
import { buildCreateTripPayload } from '../fixtures/trips.fixture';
import { buildRegisterPayload } from '../fixtures/users.fixture';

describe('BalancesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tripId: string;

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
    const tokens = await registerAndGetToken(
      app,
      buildRegisterPayload({
        email: 'balances-e2e@travelsplit.test',
      }),
    );
    accessToken = tokens.accessToken;
    const createRes = await request(app.getHttpServer())
      .post('/api/trips')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateTripPayload())
      .expect(201);
    tripId = createRes.body.id;
  });

  describe('GET /api/trips/:trip_id/balances', () => {
    it('should return 200 and balances for participant', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/balances`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('trip_id', tripId);
      expect(res.body).toHaveProperty('balances');
      expect(Array.isArray(res.body.balances)).toBe(true);
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-bal@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/balances`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/balances`)
        .expect(401);
    });

    it('should return 403 when trip does not exist', async () => {
      const nonExistent = '123e4567-e89b-12d3-a456-426614174099';
      await request(app.getHttpServer())
        .get(`/api/trips/${nonExistent}/balances`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('POST /api/trips/:trip_id/balances/settle', () => {
    it('should return 200 and settle result for participant', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/balances/settle`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('trip_id', tripId);
      expect(res.body).toHaveProperty('transactions');
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-settle@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/balances/settle`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/balances/settle`)
        .expect(401);
    });
  });
});
