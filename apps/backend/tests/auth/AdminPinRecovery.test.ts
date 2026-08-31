import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { ConsoleEmailService } from '../../src/infrastructure/notifications/ConsoleEmailService.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

describe('TK-077 / US-018: Recuperacion de PIN de Administrador por Email Token (Magic Link)', () => {
  const secret = 'test-secret-key-admin-recovery-12345';
  let userRepo: InMemoryUserRepository;
  let emailService: ConsoleEmailService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    emailService = new ConsoleEmailService();

    // 1. Admin con email configurado
    userRepo.seedUser(
      new User({
        id: 'usr-admin-1',
        name: 'Maria Silva (Administrador)',
        role: 'ADMIN',
        pin: Pin.createFromRaw('1234'),
        email: 'admin@restostock.com',
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );

    // 2. Operario de cocina (no ADMIN)
    userRepo.seedUser(
      new User({
        id: 'usr-staff-1',
        name: 'Carlos Gomez (Cocina)',
        role: 'KITCHEN_STAFF',
        pin: Pin.createFromRaw('1234'),
        email: 'cocina@restostock.com',
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
  });

  describe('POST /api/v1/auth/forgot-pin', () => {
    it('despacha un correo con token temporal de 15 minutos cuando el email pertenece a un ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'admin@restostock.com' });

      // ORACULO RED: respuesta 200 generica
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Si el correo coincide con un administrador registrado');

      // ORACULO ESTADO: se despachó el email y se persistió el tokenHash y expiresAt
      const lastEmail = emailService.getLastSentEmail();
      expect(lastEmail).not.toBeNull();
      expect(lastEmail?.to).toBe('admin@restostock.com');
      expect(lastEmail?.resetToken).toHaveLength(64);
      expect(lastEmail?.expiresInMinutes).toBe(15);
      expect(lastEmail?.resetUrl).toContain(`resetToken=${lastEmail?.resetToken}`);

      const adminUser = await userRepo.findById('usr-admin-1');
      expect(adminUser?.resetTokenHash).toBeDefined();
      expect(adminUser?.resetTokenExpires).toBeDefined();
      expect(adminUser!.resetTokenExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('mitiga enumeracion de usuarios devolviendo 200 identico si el correo no existe (OWASP)', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'desconocido@noexiste.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Si el correo coincide con un administrador registrado');

      // Ningun correo despachado
      expect(emailService.getLastSentEmail()).toBeNull();
    });

    it('no genera token ni envia correo si el email pertenece a un operario que NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'cocina@restostock.com' });

      expect(response.status).toBe(200);
      expect(emailService.getLastSentEmail()).toBeNull();
    });

    it('rechaza formato de correo invalido con 400 Bad Request', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'no-es-un-email' });

      expect(response.status).toBe(400);
      expect(response.body.detail).toContain('correo electronico');
    });
  });

  describe('POST /api/v1/auth/reset-pin', () => {
    it('restablece exitosamente el PIN del Administrador, reactiva la cuenta bloqueada y limpia el token', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      // 1. Simular bloqueo previo del admin tras 5 intentos
      const admin = await userRepo.findById('usr-admin-1');
      admin?.block();
      await userRepo.save(admin!);
      expect((await userRepo.findById('usr-admin-1'))?.isBlocked()).toBe(true);

      // 2. Solicitar recuperacion
      await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'admin@restostock.com' });

      const token = emailService.getLastSentEmail()!.resetToken;

      // 3. Ejecutar reseteo con nuevo PIN 9876
      const resetResponse = await request(app)
        .post('/api/v1/auth/reset-pin')
        .send({ token, newPin: '9876' });

      // ORACULO RED
      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.message).toContain('actualizado exitosamente');

      // ORACULO ESTADO: Administrador reactivado, intentos en 0, token consumido (one-time)
      const updatedAdmin = await userRepo.findById('usr-admin-1');
      expect(updatedAdmin?.isBlocked()).toBe(false);
      expect(updatedAdmin?.status).toBe('ACTIVE');
      expect(updatedAdmin?.failedAttempts).toBe(0);
      expect(updatedAdmin?.resetTokenHash).toBeUndefined();
      expect(updatedAdmin?.resetTokenExpires).toBeUndefined();

      // ORACULO LOGIN: el admin puede loguearse con el nuevo PIN 9876
      const loginResponse = await request(app)
        .post('/api/v1/auth/login-pin')
        .send({ userId: 'usr-admin-1', pin: '9876' });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
    });

    it('rechaza el segundo intento de uso del mismo token (One-Time Token Enforcement)', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'admin@restostock.com' });

      const token = emailService.getLastSentEmail()!.resetToken;

      // Primer uso exitoso
      await request(app)
        .post('/api/v1/auth/reset-pin')
        .send({ token, newPin: '9876' });

      // Segundo uso con el mismo token -> 401 Unauthorized
      const secondUseResponse = await request(app)
        .post('/api/v1/auth/reset-pin')
        .send({ token, newPin: '5555' });

      expect(secondUseResponse.status).toBe(401);
      expect(secondUseResponse.body.detail).toContain('inválido o ha expirado');
    });

    it('rechaza token expirado (> 15 minutos)', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      await request(app)
        .post('/api/v1/auth/forgot-pin')
        .send({ email: 'admin@restostock.com' });

      const token = emailService.getLastSentEmail()!.resetToken;

      // Manipular expiracion en el pasado
      const admin = await userRepo.findById('usr-admin-1');
      admin?.setResetToken(admin.resetTokenHash!, new Date(Date.now() - 1000));
      await userRepo.save(admin!);

      const response = await request(app)
        .post('/api/v1/auth/reset-pin')
        .send({ token, newPin: '9876' });

      expect(response.status).toBe(401);
      expect(response.body.detail).toContain('inválido o ha expirado');
    });

    it('rechaza token manipulado o inexistente con 401', async () => {
      const app = createApp({ userRepository: userRepo, emailService, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/auth/reset-pin')
        .send({ token: '11112222333344445555666677778888', newPin: '9876' });

      expect(response.status).toBe(401);
      expect(response.body.detail).toContain('inválido o ha expirado');
    });
  });
});
