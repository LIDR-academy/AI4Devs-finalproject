import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

describe('TK-002: Authenticate By PIN TDD Suite', () => {
  let userRepo: InMemoryUserRepository;
  const jwtSecret = 'test_jwt_secret_key_123456';
  let sampleUser: User;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    sampleUser = new User({
      id: 'usr-carlos-1',
      name: 'Carlos Gomez',
      role: 'KITCHEN_STAFF',
      pin: Pin.createFromRaw('1234'),
      status: 'ACTIVE',
      failedAttempts: 0,
    });
    userRepo.seedUser(sampleUser);
  });

  it('debe autenticar exitosamente con PIN correcto "1234" y retornar token JWT (200 OK)', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret });
    const response = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId: 'usr-carlos-1', pin: '1234' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toEqual({
      id: 'usr-carlos-1',
      name: 'Carlos Gomez',
      role: 'KITCHEN_STAFF',
      mustChangePin: true,
    });

    // Garantizar que el hash del PIN NUNCA se retorna
    expect(response.body.user).not.toHaveProperty('pinHash');
  });

  it('debe rechazar la autenticacion con PIN incorrecto "9999" (401 Unauthorized)', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret });
    const response = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId: 'usr-carlos-1', pin: '9999' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'InvalidPinException');
    expect(response.body.message).toMatch(/PIN de acceso invalido/);
  });

  it('debe bloquear al usuario tras 5 intentos fallidos consecutivos (403 Forbidden)', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret });

    // 5 intentos fallidos
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login-pin')
        .send({ userId: 'usr-carlos-1', pin: '0000' });
    }

    // El sexto intento debe ser bloqueado con 403
    const response = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId: 'usr-carlos-1', pin: '1234' });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'UserBlockedException');
    expect(response.body.message).toMatch(/bloqueado/);
  });

  it('debe rechazar con 400 Bad Request si el PIN no cumple el esquema Zod (no numerico o < 4 digitos)', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret });

    const response = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId: 'usr-carlos-1', pin: 'abc' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'ValidationError');
  });
});
