// Setup de variables de entorno antes de importar módulos
import '../setup';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('ClbncController - Recuperar Password (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /usuarios-banca-digital/recuperar-password/iniciar', () => {
    it('debe rechazar inicio de recuperación sin username', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/iniciar')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('username');
        });
    });

    it('debe rechazar inicio de recuperación con username vacío', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/iniciar')
        .send({
          username: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar inicio de recuperación con username inválido', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/iniciar')
        .send({
          username: 'noexiste@email.com',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    // Nota: Los tests con datos reales y recuperación exitosa requieren:
    // 1. Base de datos de prueba configurada
    // 2. Usuario de banca digital creado previamente
    // 3. Servicio de envío de email mockeado
    // 4. Verificación de código de verificación generado
  });

  describe('POST /usuarios-banca-digital/recuperar-password/completar', () => {
    it('debe rechazar completar recuperación sin username', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/completar')
        .send({
          codigoVerificacion: 'ABC123',
          passwordNuevo: 'newPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('username');
        });
    });

    it('debe rechazar completar recuperación sin código de verificación', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/completar')
        .send({
          username: 'usuario@email.com',
          passwordNuevo: 'newPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('codigoVerificacion');
        });
    });

    it('debe rechazar completar recuperación sin password nuevo', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/completar')
        .send({
          username: 'usuario@email.com',
          codigoVerificacion: 'ABC123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('passwordNuevo');
        });
    });

    it('debe rechazar completar recuperación con password muy corto', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/completar')
        .send({
          username: 'usuario@email.com',
          codigoVerificacion: 'ABC123',
          passwordNuevo: '12345', // Muy corto
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar completar recuperación con código inválido', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/recuperar-password/completar')
        .send({
          username: 'usuario@email.com',
          codigoVerificacion: 'INVALID',
          passwordNuevo: 'newPassword123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    // Nota: Los tests con datos reales y recuperación exitosa requieren:
    // 1. Base de datos de prueba configurada
    // 2. Usuario de banca digital creado previamente
    // 3. Código de verificación válido generado previamente
    // 4. Verificación de actualización de password
  });
});

