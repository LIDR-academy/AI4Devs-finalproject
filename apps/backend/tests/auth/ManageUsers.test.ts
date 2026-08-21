import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

describe('TK-049: Gestion Minima de Personal (crear/activar/desactivar operarios)', () => {
  const secret = 'test-secret-key-manage-users-12345';
  let userRepo: InMemoryUserRepository;
  let adminToken: string;
  let staffToken: string;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({ id: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN', pin: Pin.createFromRaw('1234'), status: 'ACTIVE', failedAttempts: 0 })
    );
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN' }, secret, { expiresIn: '1h' });
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Staff Seed', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
  });

  describe('POST /api/v1/auth/users', () => {
    it('ADMIN crea un operario exitosamente (201) y el PIN queda hasheado, nunca en texto plano', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Nuevo Cocinero', role: 'KITCHEN_STAFF', pin: '4321' });

      // ORACULO RED/RESPUESTA
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: 'Nuevo Cocinero', role: 'KITCHEN_STAFF', status: 'ACTIVE' });
      expect(response.body.id).toBeTruthy();

      // ORACULO ESTADO: el usuario persistio y el PIN nunca viaja/queda en texto plano
      const persisted = await userRepo.findById(response.body.id);
      expect(persisted).not.toBeNull();
      expect(persisted!.pin.getHash()).not.toContain('4321');
      expect(persisted!.pin.compareWithRaw('4321')).toBe(true);
    });

    it('el operario recien creado puede loguearse de inmediato con el PIN asignado (flujo end-to-end)', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const createResponse = await request(app)
        .post('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Nuevo Cocinero', role: 'KITCHEN_STAFF', pin: '9999' });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login-pin')
        .send({ userId: createResponse.body.id, pin: '9999' });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
    });

    it('rechaza con 403 Forbidden si quien crea NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Intento No Autorizado', role: 'KITCHEN_STAFF', pin: '1111' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('title', 'ForbiddenException');
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/users')
        .send({ name: 'Sin Token', role: 'KITCHEN_STAFF', pin: '1111' });

      expect(response.status).toBe(401);
    });

    it('rechaza con 400 un PIN con formato invalido (no numerico / longitud incorrecta)', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'PIN Invalido', role: 'KITCHEN_STAFF', pin: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });
  });

  describe('GET /api/v1/auth/users (TK-056)', () => {
    it('ADMIN lista los operarios existentes, sin exponer pinHash', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      userRepo.seedUser(
        new User({ id: 'usr-list-1', name: 'Operario Listado', role: 'KITCHEN_STAFF', pin: Pin.createFromRaw('2468'), status: 'ACTIVE', failedAttempts: 0 })
      );

      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const listed = response.body.find((u: { id: string }) => u.id === 'usr-list-1');
      expect(listed).toMatchObject({ id: 'usr-list-1', name: 'Operario Listado', role: 'KITCHEN_STAFF', status: 'ACTIVE' });
      expect(listed).not.toHaveProperty('pinHash');
      expect(listed).not.toHaveProperty('pin');
    });

    it('retorna lista vacia si no hay operarios (repositorio limpio)', async () => {
      const emptyRepo = new InMemoryUserRepository();
      const app = createApp({ userRepository: emptyRepo, jwtSecret: secret });
      const token = jwt.sign({ sub: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN' }, secret, { expiresIn: '1h' });

      const response = await request(app).get('/api/v1/auth/users').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('rechaza con 403 Forbidden si quien lista NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      const response = await request(app).get('/api/v1/auth/users').set('Authorization', `Bearer ${staffToken}`);
      expect(response.status).toBe(403);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      const response = await request(app).get('/api/v1/auth/users');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/auth/users/:id/status', () => {
    it('ADMIN desactiva (BLOCK) a un operario y este ya no puede loguearse (403 UserBlockedException)', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      userRepo.seedUser(
        new User({ id: 'usr-to-block-1', name: 'Operario A Desactivar', role: 'KITCHEN_STAFF', pin: Pin.createFromRaw('5555'), status: 'ACTIVE', failedAttempts: 0 })
      );

      const blockResponse = await request(app)
        .patch('/api/v1/auth/users/usr-to-block-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'BLOCK' });

      // ORACULO RED/RESPUESTA
      expect(blockResponse.status).toBe(200);
      expect(blockResponse.body).toMatchObject({ id: 'usr-to-block-1', status: 'BLOCKED' });

      // ORACULO ESTADO: el login ahora falla para ese usuario
      const loginResponse = await request(app)
        .post('/api/v1/auth/login-pin')
        .send({ userId: 'usr-to-block-1', pin: '5555' });
      expect(loginResponse.status).toBe(403);
      expect(loginResponse.body).toHaveProperty('title', 'UserBlockedException');
    });

    it('ADMIN reactiva (ACTIVATE) a un operario bloqueado y este vuelve a poder loguearse', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      userRepo.seedUser(
        new User({ id: 'usr-to-activate-1', name: 'Operario Bloqueado', role: 'KITCHEN_STAFF', pin: Pin.createFromRaw('6666'), status: 'BLOCKED', failedAttempts: 5 })
      );

      const activateResponse = await request(app)
        .patch('/api/v1/auth/users/usr-to-activate-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'ACTIVATE' });

      expect(activateResponse.status).toBe(200);
      expect(activateResponse.body).toMatchObject({ id: 'usr-to-activate-1', status: 'ACTIVE' });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login-pin')
        .send({ userId: 'usr-to-activate-1', pin: '6666' });
      expect(loginResponse.status).toBe(200);
    });

    it('retorna 404 Not Found si el usuario no existe', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });

      const response = await request(app)
        .patch('/api/v1/auth/users/usr-inexistente/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'BLOCK' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'EntityNotFoundException');
    });

    it('rechaza con 403 Forbidden si quien desactiva NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, jwtSecret: secret });
      userRepo.seedUser(
        new User({ id: 'usr-target-1', name: 'Target', role: 'KITCHEN_STAFF', pin: Pin.createFromRaw('7777'), status: 'ACTIVE', failedAttempts: 0 })
      );

      const response = await request(app)
        .patch('/api/v1/auth/users/usr-target-1/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ action: 'BLOCK' });

      expect(response.status).toBe(403);
    });
  });
});
