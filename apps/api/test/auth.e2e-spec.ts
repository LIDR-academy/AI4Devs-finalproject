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

function applyAuthTestEnv(): void {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters';
  process.env.JWT_ACCESS_TTL = '15m';
  process.env.JWT_REFRESH_TTL = '7d';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.NODE_ENV = 'test';
}

async function createAuthApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
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
  return app;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mechanicAccessToken: string;
  let mechanicCookies: string[];
  let mechanicLoginRefreshToken: string | undefined;
  let adminAccessToken: string;
  let adminCookies: string[];

  beforeAll(async () => {
    applyAuthTestEnv();

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

    app = await createAuthApp();

    const mechanicLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'MechanicPass123',
      });

    mechanicAccessToken = mechanicLogin.body.accessToken;
    mechanicLoginRefreshToken = mechanicLogin.body.refreshToken;
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
    expect(mechanicLoginRefreshToken).toBeUndefined();
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
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
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
    expect(response.body.refreshToken).toBeUndefined();
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

describe('AuthController native client (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    applyAuthTestEnv();
    app = await createAuthApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login with mobile client header returns refreshToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-MecaTrack-Client', 'mobile')
      .send({
        email: 'mechanic@taller.com',
        password: 'MechanicPass123',
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('mechanic@taller.com');
    expect(getSetCookieHeader(response.headers)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${REFRESH_COOKIE_NAME}=`),
      ]),
    );
  });

  it('POST /api/auth/login without mobile header omits refreshToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@taller.com',
        password: 'AdminPass123',
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeUndefined();
  });

  it('POST /api/auth/refresh with body refreshToken (mobile)', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-MecaTrack-Client', 'mobile')
      .send({
        email: 'admin@taller.com',
        password: 'AdminPass123',
      })
      .expect(200);

    const previousRefreshToken = login.body.refreshToken as string;

    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: previousRefreshToken })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).not.toBe(previousRefreshToken);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: previousRefreshToken })
      .expect(401);
  });

  it('POST /api/auth/refresh with mobile header and cookie returns rotated refreshToken', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'MechanicPass123',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', getSetCookieHeader(login.headers))
      .set('X-MecaTrack-Client', 'mobile')
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toEqual(expect.any(String));
  });

  it('POST /api/auth/refresh with invalid body refreshToken', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'not-a-valid-refresh-token' })
      .expect(401);
  });
});

describe('AuthController rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    applyAuthTestEnv();
    app = await createAuthApp();
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
