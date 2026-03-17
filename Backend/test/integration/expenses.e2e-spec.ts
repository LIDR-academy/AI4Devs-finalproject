import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { registerAndGetToken } from '../helpers/auth.helper';
import { truncateTestTables } from '../helpers/db.helper';
import { buildCreateTripPayload } from '../fixtures/trips.fixture';
import { buildCreateExpensePayload } from '../fixtures/expenses.fixture';
import { buildRegisterPayload } from '../fixtures/users.fixture';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
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
        email: 'expenses-e2e@travelsplit.test',
      }),
    );
    accessToken = tokens.accessToken;
    userId = tokens.userId;
    const createRes = await request(app.getHttpServer())
      .post('/api/trips')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(buildCreateTripPayload())
      .expect(201);
    tripId = createRes.body.id;
  });

  describe('GET /api/trips/:trip_id/expenses', () => {
    it('should return 200 and list expenses for trip', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('expenses');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.expenses)).toBe(true);
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-exp@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses`)
        .expect(401);
    });
  });

  describe('POST /api/trips/:trip_id/expenses', () => {
    it('should return 201 and create expense when participant', async () => {
      const payload = buildCreateExpensePayload([{ user_id: userId }]);
      const res = await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(payload.title);
      expect(res.body.amount).toBe(payload.amount);
      expect(res.body.trip_id).toBe(tripId);
      expect(res.body.payer_id).toBe(userId);
    });

    it('should return 400 when beneficiaries is empty', async () => {
      const payload = buildCreateExpensePayload([]);
      await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-exp2@travelsplit.test',
        }),
      );
      const payload = buildCreateExpensePayload([{ user_id: other.userId }]);
      await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(payload)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      const payload = buildCreateExpensePayload([{ user_id: userId }]);
      await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/expenses`)
        .send(payload)
        .expect(401);
    });
  });

  describe('GET /api/trips/:trip_id/expenses/:expense_id', () => {
    let expenseId: string;

    beforeEach(async () => {
      const payload = buildCreateExpensePayload([{ user_id: userId }]);
      const createRes = await request(app.getHttpServer())
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      expenseId = createRes.body.id;
    });

    it('should return 200 and expense detail when participant', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.id).toBe(expenseId);
      expect(res.body.trip_id).toBe(tripId);
    });

    it('should return 404 when expense does not exist', async () => {
      const nonExistent = '123e4567-e89b-12d3-a456-426614174099';
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses/${nonExistent}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-exp3@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .expect(403);
    });
  });
});
