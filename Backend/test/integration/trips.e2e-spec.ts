import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { registerAndGetToken } from '../helpers/auth.helper';
import { truncateTestTables } from '../helpers/db.helper';
import {
  buildCreateTripPayload,
  buildJoinTripPayload,
  buildUpdateTripPayload,
} from '../fixtures/trips.fixture';
import { buildRegisterPayload } from '../fixtures/users.fixture';

describe('TripsController (e2e)', () => {
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
        email: 'trips-e2e@travelsplit.test',
      }),
    );
    accessToken = tokens.accessToken;
    userId = tokens.userId;
  });

  describe('POST /api/trips', () => {
    it('should return 201 and create trip when authenticated', async () => {
      const payload = buildCreateTripPayload({ name: 'E2E Trip' });
      const res = await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(payload.name);
      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('currency');
      tripId = res.body.id;
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/trips')
        .send(buildCreateTripPayload())
        .expect(401);
    });

    it('should return 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '', currency: 'COP' })
        .expect(400);
    });
  });

  describe('GET /api/trips', () => {
    it('should return 200 and list trips for user', async () => {
      await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buildCreateTripPayload())
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/api/trips').expect(401);
    });
  });

  describe('GET /api/trips/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buildCreateTripPayload())
        .expect(201);
      tripId = createRes.body.id;
    });

    it('should return 200 and trip detail when participant', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toHaveProperty('id', tripId);
      expect(res.body).toHaveProperty('name');
    });

    it('should return 403 when user is not participant', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'other-trips@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/trips/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buildCreateTripPayload())
        .expect(201);
      tripId = createRes.body.id;
    });

    it('should return 200 when creator updates trip', async () => {
      const payload = buildUpdateTripPayload({ name: 'Updated Trip Name' });
      const res = await request(app.getHttpServer())
        .patch(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);
      expect(res.body.name).toBe(payload.name);
    });

    it('should return 403 when non-creator updates trip', async () => {
      const getRes = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const code = getRes.body.code;
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'member-trips@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .post('/api/trips/join')
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(buildJoinTripPayload({ code }))
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(buildUpdateTripPayload())
        .expect(403);
    });
  });

  describe('POST /api/trips/join', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/trips')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buildCreateTripPayload())
        .expect(201);
      tripId = createRes.body.id;
    });

    it('should return 200 when joining with valid code', async () => {
      const getRes = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const code = getRes.body.code;
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'joiner@travelsplit.test',
        }),
      );
      const joinRes = await request(app.getHttpServer())
        .post('/api/trips/join')
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(buildJoinTripPayload({ code }))
        .expect(200);
      expect(joinRes.body.id).toBe(tripId);
    });

    it('should return 409 when already participant', async () => {
      const getRes = await request(app.getHttpServer())
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/trips/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buildJoinTripPayload({ code: getRes.body.code }))
        .expect(409);
    });

    it('should return 404 when code is invalid', async () => {
      const other = await registerAndGetToken(
        app,
        buildRegisterPayload({
          email: 'joiner2@travelsplit.test',
        }),
      );
      await request(app.getHttpServer())
        .post('/api/trips/join')
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send(buildJoinTripPayload({ code: '00000000' }))
        .expect(404);
    });
  });
});
