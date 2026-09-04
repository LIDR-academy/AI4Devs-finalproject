import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryConsumptionReasonRepository } from '../../src/infrastructure/kitchen/repositories/InMemoryConsumptionReasonRepository.js';

const JWT_SECRET = 'test-secret-consumption-reasons-12345';
const tokenFor = (role: string): string => `Bearer ${jwt.sign({ sub: `usr-${role}`, name: role, role }, JWT_SECRET, { expiresIn: '1h' })}`;

describe('US-030 (TK-107): catálogo de motivos de consumo (HTTP)', () => {
  let reasonRepo: InMemoryConsumptionReasonRepository;

  beforeEach(() => {
    reasonRepo = new InMemoryConsumptionReasonRepository(false);
  });

  it('Escenario 1: GET lista solo los motivos activos, para cualquier autenticado', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });

    await request(app)
      .post('/api/v1/consumption-reasons')
      .set('Authorization', tokenFor('ADMIN'))
      .send({ label: 'Preparación de plato' });
    const toDeactivate = await request(app)
      .post('/api/v1/consumption-reasons')
      .set('Authorization', tokenFor('ADMIN'))
      .send({ label: 'Motivo viejo' });
    await request(app)
      .put(`/api/v1/consumption-reasons/${toDeactivate.body.id}`)
      .set('Authorization', tokenFor('ADMIN'))
      .send({ isActive: false });

    const res = await request(app).get('/api/v1/consumption-reasons').set('Authorization', tokenFor('KITCHEN_STAFF'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].label).toBe('Preparación de plato');
  });

  it('Escenario 2: ADMIN crea un motivo (201, activo por defecto)', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });
    const res = await request(app)
      .post('/api/v1/consumption-reasons')
      .set('Authorization', tokenFor('ADMIN'))
      .send({ label: 'Ajuste de porción' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ label: 'Ajuste de porción', isActive: true });
    expect(res.body.id).toBeTruthy();
  });

  it('Escenario 3: ADMIN desactiva un motivo — desaparece del listado activo, no se borra', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });
    const created = await request(app)
      .post('/api/v1/consumption-reasons')
      .set('Authorization', tokenFor('ADMIN'))
      .send({ label: 'Cortesía a cliente' });

    const updated = await request(app)
      .put(`/api/v1/consumption-reasons/${created.body.id}`)
      .set('Authorization', tokenFor('ADMIN'))
      .send({ isActive: false });
    expect(updated.status).toBe(200);
    expect(updated.body.isActive).toBe(false);

    const activeList = await request(app).get('/api/v1/consumption-reasons').set('Authorization', tokenFor('ADMIN'));
    expect(activeList.body).toHaveLength(0);

    const fullList = await request(app)
      .get('/api/v1/consumption-reasons?includeInactive=true')
      .set('Authorization', tokenFor('ADMIN'));
    expect(fullList.body).toHaveLength(1);
    expect(fullList.body[0].id).toBe(created.body.id);
  });

  it('Escenario 4: rol no-ADMIN no puede crear/editar (403); el GET simple sigue permitido', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });
    const staffToken = tokenFor('KITCHEN_STAFF');

    const create = await request(app).post('/api/v1/consumption-reasons').set('Authorization', staffToken).send({ label: 'x' });
    expect(create.status).toBe(403);

    const update = await request(app).put('/api/v1/consumption-reasons/whatever').set('Authorization', staffToken).send({ isActive: false });
    expect(update.status).toBe(403);

    const list = await request(app).get('/api/v1/consumption-reasons').set('Authorization', staffToken);
    expect(list.status).toBe(200);

    const includeInactiveAsStaff = await request(app)
      .get('/api/v1/consumption-reasons?includeInactive=true')
      .set('Authorization', staffToken);
    expect(includeInactiveAsStaff.status).toBe(403);
  });

  it('crear con etiqueta vacía → 400', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });
    const res = await request(app).post('/api/v1/consumption-reasons').set('Authorization', tokenFor('ADMIN')).send({ label: '' });
    expect(res.status).toBe(400);
  });

  it('editar un motivo inexistente → 404', async () => {
    const app = createApp({ consumptionReasonRepository: reasonRepo, jwtSecret: JWT_SECRET });
    const res = await request(app)
      .put('/api/v1/consumption-reasons/nope')
      .set('Authorization', tokenFor('ADMIN'))
      .send({ label: 'x' });
    expect(res.status).toBe(404);
  });
});
