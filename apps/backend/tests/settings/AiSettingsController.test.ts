import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryAiConfigurationRepository } from '../../src/infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';

describe('TK-123: Endpoints de Configuración de IA (/api/v1/settings/ai) (US-034)', () => {
  const secret = 'test-secret-key-ai-settings-12345-long';
  let aiConfigRepo: InMemoryAiConfigurationRepository;
  let staffToken: string;
  let adminToken: string;

  beforeEach(() => {
    aiConfigRepo = new InMemoryAiConfigurationRepository();
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Cocinero', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });
  });

  it('401: rechaza llamadas no autenticadas a GET /api/v1/settings/ai', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app).get('/api/v1/settings/ai');

    expect(res.status).toBe(401);
  });

  it('403: rechaza acceso a usuarios sin rol ADMIN', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app)
      .get('/api/v1/settings/ai')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });

  it('200: ADMIN consulta la configuración de IA con clave enmascarada', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app)
      .get('/api/v1/settings/ai')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('provider', 'HEURISTIC');
    expect(res.body).toHaveProperty('modelName');
    expect(res.body).toHaveProperty('temperature', 0.0);
    expect(res.body).toHaveProperty('hasApiKey', false);
    expect(res.body.apiKey).toBeUndefined();
    expect(res.body.encryptedApiKey).toBeUndefined();
  });

  it('400: rechaza actualización con temperatura mayor a 0.2 (Guard 9)', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app)
      .put('/api/v1/settings/ai')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        temperature: 0.5,
      });

    expect(res.status).toBe(400);
  });

  it('200: ADMIN actualiza proveedor, modelo y clave cifrada', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app)
      .put('/api/v1/settings/ai')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        provider: 'GEMINI',
        modelName: 'gemini-2.5-flash',
        apiKey: 'secret-gemini-key-xyz',
        temperature: 0.1,
        replenishmentOn: true,
        rescueRecipesOn: true,
        anomalyAuditOn: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('GEMINI');
    expect(res.body.hasApiKey).toBe(true);
    expect(res.body.apiKey).toBeUndefined();

    // Comprobar que en base de datos quedó cifrada
    const rawInDb = await aiConfigRepo.getConfig();
    expect(rawInDb.encryptedApiKey).not.toBe('secret-gemini-key-xyz');
    expect(rawInDb.encryptedApiKey).toContain(':');
  });

  it('200: POST /api/v1/settings/ai/test ejecuta ping diagnóstico con HEURISTIC', async () => {
    const app = createApp({ aiConfigRepository: aiConfigRepo, jwtSecret: secret });
    const res = await request(app)
      .post('/api/v1/settings/ai/test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Motor Heurístico Local');
    expect(res.body.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
