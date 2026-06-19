import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { execSync } from 'child_process';
import 'dotenv/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

function getSetCookieHeader(headers: request.Response['headers']): string[] {
  const value = headers['set-cookie'];
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function loginAsAdmin(
  app: INestApplication,
): Promise<{ accessToken: string; cookies: string[] }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'admin@taller.com',
      password: 'AdminPass123',
    });

  return {
    accessToken: response.body.accessToken as string,
    cookies: getSetCookieHeader(response.headers),
  };
}

async function loginAsMechanic(
  app: INestApplication,
): Promise<{ accessToken: string; cookies: string[] }> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: 'mechanic@taller.com',
      password: 'MechanicPass123',
    });

  return {
    accessToken: response.body.accessToken as string,
    cookies: getSetCookieHeader(response.headers),
  };
}

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let mechanicAccessToken: string;
  let mechanicUserId: string;
  let adminUserId: string;

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

    const adminSession = await loginAsAdmin(app);
    adminAccessToken = adminSession.accessToken;

    const mechanicSession = await loginAsMechanic(app);
    mechanicAccessToken = mechanicSession.accessToken;

    const adminMe = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    adminUserId = adminMe.body.id as string;

    const mechanicMe = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${mechanicAccessToken}`);
    mechanicUserId = mechanicMe.body.id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/users as ADMIN returns users without passwordHash', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    for (const user of response.body) {
      expect(user.passwordHash).toBeUndefined();
      expect(user.refreshTokenHash).toBeUndefined();
    }
  });

  it('GET /api/users as MECHANIC returns 403', async () => {
    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .expect(403);
  });

  it('GET /api/users without token returns 401', async () => {
    await request(app.getHttpServer()).get('/api/users').expect(401);
  });

  it('POST /api/users with valid body as ADMIN returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'New Employee',
        email: 'new.employee@taller.com',
        password: 'EmployeePass123',
        role: 'MECHANIC',
      })
      .expect(201);

    expect(response.body.active).toBe(true);
    expect(response.body.email).toBe('new.employee@taller.com');
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('POST /api/users with duplicate email returns 409', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Duplicate User',
        email: 'mechanic@taller.com',
        password: 'AnotherPass123',
        role: 'MECHANIC',
      })
      .expect(409);

    expect(response.body.message).toBe('This email is already registered');
  });

  it('POST /api/users as MECHANIC returns 403', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({
        fullName: 'Forbidden User',
        email: 'forbidden@taller.com',
        password: 'ForbiddenPass123',
        role: 'MECHANIC',
      })
      .expect(403);
  });

  it('POST /api/users with invalid password returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Short Password',
        email: 'short.pass@taller.com',
        password: 'short',
        role: 'MECHANIC',
      })
      .expect(400);
  });

  it('PATCH /api/users/:id/deactivate deactivates a mechanic', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'To Deactivate',
        email: 'deactivate.me@taller.com',
        password: 'DeactivatePass123',
        role: 'MECHANIC',
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.active).toBe(false);
    expect(response.body.updatedAt).toBeDefined();
  });

  it('PATCH deactivate self returns 400', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/users/${adminUserId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(400);

    expect(response.body.message).toBe(
      'You cannot deactivate your own account',
    );
  });

  it('PATCH deactivate last active admin returns 400', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Second Admin',
        email: 'second.admin@taller.com',
        password: 'SecondAdminPass123',
        role: 'ADMIN',
      })
      .expect(201);

    const secondAdminId = createResponse.body.id as string;

    const secondAdminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'second.admin@taller.com',
        password: 'SecondAdminPass123',
      });
    const secondAdminToken = secondAdminLogin.body.accessToken as string;

    await request(app.getHttpServer())
      .patch(`/api/users/${secondAdminId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${adminUserId}/deactivate`)
      .set('Authorization', `Bearer ${secondAdminToken}`)
      .expect(400);

    expect(response.body.message).toBe(
      'At least one active administrator is required',
    );
  });

  it('PATCH deactivate unknown id returns 404', async () => {
    await request(app.getHttpServer())
      .patch(`/api/users/00000000-0000-4000-8000-000000000099/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('PATCH deactivate twice on same user returns 409 on second attempt', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Double Deactivate',
        email: 'double.deactivate@taller.com',
        password: 'DoubleDeactivate1',
        role: 'MECHANIC',
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(409);

    expect(response.body.message).toBe('User is already inactive');
  });

  it('deactivated mechanic cannot login', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Login Blocked',
        email: 'login.blocked@taller.com',
        password: 'LoginBlocked123',
        role: 'MECHANIC',
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/api/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'login.blocked@taller.com',
        password: 'LoginBlocked123',
      })
      .expect(403);

    expect(response.body.message).toBe(
      'Your account is inactive. Contact the workshop administrator.',
    );
  });

  it('deactivated user cannot refresh with old cookie', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'mechanic@taller.com',
        password: 'MechanicPass123',
      });

    const cookies = getSetCookieHeader(loginResponse.headers);

    await request(app.getHttpServer())
      .patch(`/api/users/${mechanicUserId}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookies)
      .expect(401);
  });
});
