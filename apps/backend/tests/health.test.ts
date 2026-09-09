import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/infrastructure/http/app.js';
import { getEnvironment } from '../src/infrastructure/config/environment.js';

describe('TK-001: Backend Core & Health Check TDD', () => {
  it('debe responder 200 OK en el endpoint /health', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('system', 'RestoStock Backend Core');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('debe validar las variables de entorno con Zod y lanzar error Fail-Fast si faltan requeridas', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      // DATABASE_URL y JWT_SECRET ausentes deliberadamente
    };

    expect(() => getEnvironment(invalidEnv)).toThrowError(/Error de configuracion de entorno Fail-Fast/);
  });

  it('debe parsear correctamente un entorno valido', () => {
    const validEnv = {
      NODE_ENV: 'test',
      PORT: '4000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/restostock_test',
      JWT_SECRET: 'super_secret_jwt_key_123',
    };

    const parsed = getEnvironment(validEnv);
    expect(parsed.PORT).toBe(4000);
    expect(parsed.NODE_ENV).toBe('test');
    expect(parsed.DATABASE_URL).toBe(validEnv.DATABASE_URL);
  });
});
