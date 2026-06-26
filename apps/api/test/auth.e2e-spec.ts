import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { REFRESH_COOKIE_NAME } from '../src/common/constants/auth.constants';

function getSetCookieHeader(headers: request.Response['headers']): string[] {
  const value = headers['set-cookie'];
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mechanicAccessToken: string;
  let mechanicCookies: string[];
  let adminAccessToken: string;
  let adminCookies: string[];

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    });
    execSync('npx prisma db seed', {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const mechanicLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'MechanicPass123',
      });

    mechanicAccessToken = mechanicLogin.body.accessToken;
    mechanicCookies = getSetCookieHeader(mechanicLogin.headers);

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@taller.com',
        password: 'AdminPass123',
      });

    adminAccessToken = adminLogin.body.accessToken;
    adminCookies = getSetCookieHeader(adminLogin.headers);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login with valid mechanic credentials', async () => {
    expect(mechanicAccessToken).toBeDefined();
    expect(mechanicCookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=`),
      ]),
    );
  });

  it('POST /api/auth/login with wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'WrongPassword123',
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
  });

  it('POST /api/auth/login with inactive user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'inactive@taller.com',
        password: 'InactivePass123',
      })
      .expect(403);

    expect(response.body.message).toBe(
      'Your account is inactive. Contact the workshop administrator.',
    );
  });

  it('POST /api/auth/login with invalid email format', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'MechanicPass123',
      })
      .expect(400);
  });

  it('GET /api/auth/me with bearer token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.email).toBe('admin@taller.com');
    expect(response.body.role).toBe('ADMIN');
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('GET /api/auth/me without token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('POST /api/auth/refresh with cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', mechanicCookies)
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
  });

  it('POST /api/auth/refresh without cookie', async () => {
    await request(app.getHttpServer()).post('/api/auth/refresh').expect(401);
  });

  it('POST /api/auth/logout clears cookie', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .set('Cookie', adminCookies)
      .expect(204);

    await request(app.getHttpServer()).post('/api/auth/refresh').expect(401);
  });
});

describe('AuthController rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login rate limits after 5 attempts', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'mechanic@taller.com',
          password: 'WrongPassword123',
        })
        .expect(401);
    }

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'WrongPassword123',
      })
      .expect(429);

    expect(response.body.message).toBe('Too Many Requests');
  });
});
