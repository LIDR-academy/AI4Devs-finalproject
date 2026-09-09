import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

describe('TK-071 / Guard 36: Flujo de Prueba de Creación de Usuario y Cambio Obligatorio de PIN', () => {
  const secret = 'test-secret-key-strict-pin-rotation-12345';
  let userRepo: InMemoryUserRepository;
  let adminToken: string;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({
        id: 'usr-admin-test',
        name: 'Administrador General',
        role: 'ADMIN',
        pin: Pin.createFromRaw('1234'),
        status: 'ACTIVE',
        failedAttempts: 0,
        mustChangePin: false,
      })
    );
    adminToken = jwt.sign(
      { sub: 'usr-admin-test', name: 'Administrador General', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );
  });

  it('Paso 1: El Administrador crea un nuevo operario "Juan Perez"', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret: secret });

    const createResponse = await request(app)
      .post('/api/v1/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan Perez (Nuevo)', role: 'KITCHEN_STAFF', pin: '1111' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('id');
    expect(createResponse.body).toMatchObject({ name: 'Juan Perez (Nuevo)', role: 'KITCHEN_STAFF', status: 'ACTIVE' });
  });

  it('Paso 2: El nuevo usuario inicia sesión y la API responde mustChangePin: true', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret: secret });

    // 1. Crear usuario
    const createResponse = await request(app)
      .post('/api/v1/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan Perez', role: 'KITCHEN_STAFF', pin: '1111' });

    const userId = createResponse.body.id;

    // 2. Primer login con PIN asignado '1111'
    const loginResponse = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId, pin: '1111' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.mustChangePin).toBe(true);
  });

  it('Paso 3: El nuevo usuario cambia su PIN obligatorio (1111 -> 5555) y mustChangePin pasa a false', async () => {
    const app = createApp({ userRepository: userRepo, jwtSecret: secret });

    // 1. Crear usuario
    const createResponse = await request(app)
      .post('/api/v1/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan Perez', role: 'KITCHEN_STAFF', pin: '1111' });

    const userId = createResponse.body.id;

    // 2. Login inicial
    const loginResponse = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId, pin: '1111' });

    const userToken = loginResponse.body.accessToken;

    // 3. Ejecutar cambio de PIN a '5555'
    const changePinResponse = await request(app)
      .post('/api/v1/auth/change-pin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, currentPin: '1111', newPin: '5555' });

    expect(changePinResponse.status).toBe(200);
    expect(changePinResponse.body.message).toMatch(/PIN actualizado exitosamente/);
    expect(changePinResponse.body.success).toBe(true);



    // 4. Verificar que el PIN anterior '1111' ya NO funciona
    const oldLoginResponse = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId, pin: '1111' });

    expect(oldLoginResponse.status).toBe(401);

    // 5. Verificar que el nuevo PIN '5555' funciona y mustChangePin es false
    const newLoginResponse = await request(app)
      .post('/api/v1/auth/login-pin')
      .send({ userId, pin: '5555' });

    expect(newLoginResponse.status).toBe(200);
    expect(newLoginResponse.body.user.mustChangePin).toBe(false);
  });
});
