import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../../src/infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { Remanente } from '../../src/domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

/**
 * TK-093 (AUDIT-SEC-001 F-3): las rutas de mutación de cocina/stock declaran su rol
 * permitido a nivel de ruta. Un JWT válido pero con un rol fuera de {ADMIN, KITCHEN_STAFF}
 * — p. ej. el centinela UNASSIGNED de TK-092, o un rol nuevo de US-015 sin permisos —
 * recibe 403, no pasa por estar sólo autenticado.
 */
describe('TK-093: RBAC explícito por ruta en mutaciones de cocina y stock', () => {
  const secret = 'test-secret-per-route-rbac-12345';
  let stockRepo: InMemoryStockRepository;
  let queryRepo: InMemoryRemanenteQueryRepository;

  const tokenFor = (role: string): string =>
    jwt.sign({ sub: `usr-${role}`, name: role, role }, secret, { expiresIn: '1h' });

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-1', name: 'Queso', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity('10.000') })
    );
    stockRepo.seedRemanente(
      new Remanente({
        id: 'rem-1',
        insumoId: 'ins-1',
        currentQuantity: new DecimalQuantity('2.000'),
        initialQuantity: new DecimalQuantity('2.000'),
        location: 'KITCHEN_FRIDGE',
        status: 'ACTIVE',
        expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      })
    );
    queryRepo = new InMemoryRemanenteQueryRepository(stockRepo);
  });

  const app = () => createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, jwtSecret: secret });

  it('un rol desconocido (UNASSIGNED) recibe 403 en POST /kitchen/remanentes/:id/consume', async () => {
    const res = await request(app())
      .post('/api/v1/kitchen/remanentes/rem-1/consume')
      .set('Authorization', `Bearer ${tokenFor('UNASSIGNED')}`)
      .send({ quantity: '0.250' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('title', 'ForbiddenException');
  });

  it('un rol desconocido recibe 403 en POST /stock/extraction', async () => {
    const res = await request(app())
      .post('/api/v1/stock/extraction')
      .set('Authorization', `Bearer ${tokenFor('AUDITOR_READONLY')}`)
      .send({ insumoId: 'ins-1', quantity: '1.000', toLocation: 'KITCHEN_FRIDGE' });

    expect(res.status).toBe(403);
  });

  it('KITCHEN_STAFF NO recibe 403 en las mismas rutas (pasa el guard de rol)', async () => {
    const consume = await request(app())
      .post('/api/v1/kitchen/remanentes/rem-1/consume')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`)
      .send({ quantity: '0.250' });
    expect(consume.status).not.toBe(403);
    expect(consume.status).not.toBe(401);

    const extraction = await request(app())
      .post('/api/v1/stock/extraction')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`)
      .send({ insumoId: 'ins-1', quantity: '1.000', toLocation: 'KITCHEN_FRIDGE' });
    expect(extraction.status).not.toBe(403);
    expect(extraction.status).not.toBe(401);
  });

  it('las 4 rutas de mutación de cocina rechazan el rol desconocido con 403', async () => {
    const t = `Bearer ${tokenFor('UNASSIGNED')}`;
    const routes: Array<[string, object]> = [
      ['/api/v1/kitchen/remanentes/rem-1/consume', { quantity: '0.1' }],
      ['/api/v1/kitchen/remanentes/rem-1/discard', { reason: 'EXPIRATION' }],
      ['/api/v1/kitchen/shift-reconciliation', { counts: [] }],
      ['/api/v1/kitchen/recipes/rec-1/consume', { portions: 1 }],
    ];
    for (const [path, body] of routes) {
      const res = await request(app()).post(path).set('Authorization', t).send(body);
      expect(res.status, `${path} debe ser 403`).toBe(403);
    }
  });
});
