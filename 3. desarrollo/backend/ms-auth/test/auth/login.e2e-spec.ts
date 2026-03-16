import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '../../src/common/database/database.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(DatabaseModule)
      .compile();

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

  describe('/auth/login (POST)', () => {
    it('debe rechazar login sin username', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'password123' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('nombre de usuario es requerido');
        });
    });

    it('debe rechazar login sin password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'jperez' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('contraseña es requerida');
        });
    });

    it('debe rechazar login con credenciales inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'noexiste', password: 'wrongpassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Credenciales inválidas');
        });
    });

    // Nota: Los tests con datos reales requieren setup de base de datos de prueba
  });

  describe('/auth/refresh (POST)', () => {
    it('debe rechazar refresh sin token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('debe rechazar refresh con token inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('debe rechazar acceso sin token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});

