import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryTemperatureLogRepository } from '../../src/infrastructure/kitchen/repositories/InMemoryTemperatureLogRepository.js';

describe('TK-120: Registro de Temperatura de Refrigeración al Iniciar Turno (US-033)', () => {
  const secret = 'test-secret-key-temperature-log-12345';
  let temperatureLogRepo: InMemoryTemperatureLogRepository;
  let staffToken: string;
  let adminToken: string;

  beforeEach(() => {
    temperatureLogRepo = new InMemoryTemperatureLogRepository();
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Cocinero', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });
  });

  it('201: registra dentro de rango seguro, cualquier rol autenticado', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ storageLocationId: 'loc-1', unitType: 'REFRIGERATOR', temperatureCelsius: '3.5' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ isWithinSafeRange: true, recordedByUserId: 'usr-staff-1' });
  });

  it('201: registra fuera de rango SIN bloquear (nunca 400/422 por el valor)', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ storageLocationId: 'loc-1', unitType: 'REFRIGERATOR', temperatureCelsius: '7.2' });

    expect(response.status).toBe(201);
    expect(response.body.isWithinSafeRange).toBe(false);
  });

  it('404: storageLocationId inexistente', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ storageLocationId: 'loc-inexistente', unitType: 'REFRIGERATOR', temperatureCelsius: '3.5' });

    expect(response.status).toBe(404);
  });

  it('403: GET del histórico sin rol ADMIN', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .get('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
  });

  it('200: ADMIN consulta el histórico, más reciente primero', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ storageLocationId: 'loc-1', unitType: 'FREEZER', temperatureCelsius: '-20.0' });

    const response = await request(app)
      .get('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ unitType: 'FREEZER', isWithinSafeRange: true });
  });

  it('400: rechaza un valor que desborda la columna Decimal(5,2) (FASE 4.B — antes llegaba a Postgres como 500)', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ storageLocationId: 'loc-1', unitType: 'REFRIGERATOR', temperatureCelsius: '12345.67' });

    expect(response.status).toBe(400);
  });

  it('401: sin token', async () => {
    const app = createApp({ temperatureLogRepository: temperatureLogRepo, jwtSecret: secret });

    const response = await request(app)
      .post('/api/v1/kitchen/temperature-logs')
      .send({ storageLocationId: 'loc-1', unitType: 'REFRIGERATOR', temperatureCelsius: '3.5' });

    expect(response.status).toBe(401);
  });
});
