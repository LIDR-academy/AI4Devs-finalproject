// Setup de variables de entorno antes de importar módulos
import '../setup';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('ClbncController - Login (e2e)', () => {
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

  describe('POST /usuarios-banca-digital/login', () => {
    it('debe rechazar login sin username', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('username');
        });
    });

    it('debe rechazar login sin password', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: 'usuario@email.com',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('password');
        });
    });

    it('debe rechazar login con username vacío', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: '',
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar login con password vacío', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: 'usuario@email.com',
          password: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar login con credenciales inválidas', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: 'noexiste@email.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar login con username muy corto', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: 'ab', // Muy corto
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('debe rechazar login con password muy corto', () => {
      return request(app.getHttpServer())
        .post('/usuarios-banca-digital/login')
        .send({
          username: 'usuario@email.com',
          password: '12345', // Muy corto (mínimo 8 caracteres)
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    // Nota: Los tests con datos reales y login exitoso requieren:
    // 1. Base de datos de prueba configurada
    // 2. Usuario de banca digital creado previamente
    // 3. Password hasheado correctamente
    // 4. Limpieza de datos entre tests
  });
});

