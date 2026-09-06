import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRecipeRepository } from '../../src/infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { InMemoryRemanenteQueryRepository } from '../../src/infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryAiConfigurationRepository } from '../../src/infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';
import { AiConfiguration } from '../../src/domain/settings/entities/AiConfiguration.js';

describe('TK-122: Endpoint de Recetas de Rescate Inteligentes (POST /api/v1/recipes/rescue-suggestions)', () => {
  const secret = 'test-secret-rescue-recipes-122';
  let userRepo: InMemoryUserRepository;
  let stockRepo: InMemoryStockRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let remanenteQueryRepo: InMemoryRemanenteQueryRepository;
  let aiConfigRepo: InMemoryAiConfigurationRepository;
  let staffToken: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({
        id: 'usr-chef-1',
        name: 'Chef Operativo',
        role: 'KITCHEN_STAFF',
        pin: Pin.createFromRaw('1234'),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );

    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-espinaca-1',
        name: 'Espinaca Fresca',
        unitOfMeasure: 'KG',
        warehouseStock: new DecimalQuantity(10),
      })
    );

    recipeRepo = new InMemoryRecipeRepository();
    remanenteQueryRepo = new InMemoryRemanenteQueryRepository();
    remanenteQueryRepo.seedRemanente({
      id: 'rem-espinaca-1',
      insumoId: 'ins-espinaca-1',
      insumoName: 'Espinaca Fresca',
      unitOfMeasure: 'KG',
      currentQuantity: '1.200',
      initialQuantity: '3.000',
      location: 'Cocina Fría',
      expirationDate: new Date(Date.now() + 18 * 3600 * 1000), // 18h restante
      status: 'ACTIVE',
      createdAt: new Date(),
      hoursRemaining: 18,
      isCriticalAlert: true,
    });

    aiConfigRepo = new InMemoryAiConfigurationRepository();
    await aiConfigRepo.saveConfig(
      new AiConfiguration({
        id: 'ai-default',
        provider: 'HEURISTIC',
        modelName: 'heuristic-rules-engine',
        endpointUrl: null,
        encryptedApiKey: null,
        temperature: 0.0,
        replenishmentOn: false,
        rescueRecipesOn: true,
        anomalyAuditOn: false,
      })
    );

    staffToken = jwt.sign(
      { sub: 'usr-chef-1', name: 'Chef Operativo', role: 'KITCHEN_STAFF' },
      secret,
      { expiresIn: '1h' }
    );
  });

  function buildApp() {
    return createApp({
      userRepository: userRepo,
      stockRepository: stockRepo,
      recipeRepository: recipeRepo,
      remanenteQueryRepository: remanenteQueryRepo,
      jwtSecret: secret,
    });
  }

  it('rechaza con 401 si no se envía token de autenticación', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/v1/recipes/rescue-suggestions');
    expect(res.status).toBe(401);
  });

  it('devuelve 200 OK con propuestas estructuradas de rescate', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/v1/recipes/rescue-suggestions')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('source');
    expect(res.body).toHaveProperty('proposals');
    expect(Array.isArray(res.body.proposals)).toBe(true);
    expect(res.body.proposals.length).toBeGreaterThanOrEqual(1);

    const first = res.body.proposals[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('ingredients');
    expect(first.ingredients.length).toBeGreaterThanOrEqual(1);
    expect(first).toHaveProperty('preventedWasteEstimate');
  });
});
