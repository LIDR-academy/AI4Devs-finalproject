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
  const uniqueSuffix = `${Date.now()}`;

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
        email: `new.employee.${uniqueSuffix}@taller.com`,
        password: 'EmployeePass123',
        role: 'MECHANIC',
      })
      .expect(201);

    expect(response.body.active).toBe(true);
    expect(response.body.email).toBe(`new.employee.${uniqueSuffix}@taller.com`);
    expect(response.body.canActAsMechanic).toBe(false);
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
        email: `forbidden.${uniqueSuffix}@taller.com`,
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
        email: `short.pass.${uniqueSuffix}@taller.com`,
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
        email: `deactivate.me.${uniqueSuffix}@taller.com`,
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
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const otherActiveAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        active: true,
        id: { not: adminUserId },
      },
      select: { id: true },
    });

    try {
      if (otherActiveAdmins.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: otherActiveAdmins.map((user) => user.id) } },
          data: { active: false },
        });
      }

      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          fullName: 'Second Admin',
          email: `second.admin.${uniqueSuffix}@taller.com`,
          password: 'SecondAdminPass123',
          role: 'ADMIN',
        })
        .expect(201);

      const secondAdminId = createResponse.body.id as string;

      const secondAdminLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: `second.admin.${uniqueSuffix}@taller.com`,
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
    } finally {
      if (otherActiveAdmins.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: otherActiveAdmins.map((user) => user.id) } },
          data: { active: true },
        });
      }
      await prisma.$disconnect();
    }
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
        email: `double.deactivate.${uniqueSuffix}@taller.com`,
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
        email: `login.blocked.${uniqueSuffix}@taller.com`,
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
        email: `login.blocked.${uniqueSuffix}@taller.com`,
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

  it('POST /api/users ADMIN with canActAsMechanic true returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Floor Admin',
        email: `floor.admin.${uniqueSuffix}@taller.com`,
        password: 'FloorAdminPass1',
        role: 'ADMIN',
        canActAsMechanic: true,
      })
      .expect(201);

    expect(response.body.role).toBe('ADMIN');
    expect(response.body.canActAsMechanic).toBe(true);
  });

  it('PATCH /api/users/:id sets canActAsMechanic for admin', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Patchable Admin',
        email: `patchable.admin.${uniqueSuffix}@taller.com`,
        password: 'PatchableAdmin1',
        role: 'ADMIN',
        canActAsMechanic: false,
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ canActAsMechanic: true })
      .expect(200);

    expect(response.body.canActAsMechanic).toBe(true);
  });

  it('PATCH /api/users/:id updates fullName', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Editable Mechanic',
        email: `editable.mechanic.${uniqueSuffix}@taller.com`,
        password: 'EditablePass123',
        role: 'MECHANIC',
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ fullName: 'Nombre Actualizado' })
      .expect(200);

    expect(response.body.fullName).toBe('Nombre Actualizado');
  });

  it('PATCH /api/users/:id duplicate email returns 409', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: 'Email Conflict Target',
        email: `email.conflict.${uniqueSuffix}@taller.com`,
        password: 'EmailConflict12',
        role: 'MECHANIC',
      })
      .expect(201);

    const userId = createResponse.body.id as string;

    const response = await request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ email: 'admin@taller.com' })
      .expect(409);

    expect(response.body.message).toBe('This email is already registered');
  });

  it('PATCH /api/users/:id as MECHANIC returns 403', async () => {
    await request(app.getHttpServer())
      .patch(`/api/users/${mechanicUserId}`)
      .set('Authorization', `Bearer ${mechanicAccessToken}`)
      .send({ fullName: 'Hacked' })
      .expect(403);
  });

  it('PATCH /api/users/:id empty body returns 400', async () => {
    await request(app.getHttpServer())
      .patch(`/api/users/${mechanicUserId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({})
      .expect(400);
  });

  it('PATCH /api/users/:id password change updates hash and clears refresh', async () => {
    const bcrypt = await import('bcrypt');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const email = `password.reset.${uniqueSuffix}@taller.com`;

    try {
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          fullName: 'Password Reset User',
          email,
          password: 'OriginalPass12',
          role: 'MECHANIC',
        })
        .expect(201);

      const userId = createResponse.body.id as string;

      await prisma.user.update({
        where: { id: userId },
        data: {
          refreshTokenHash: 'stale-hash',
          refreshTokenExpiresAt: new Date(Date.now() + 86_400_000),
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ password: 'BrandNewPass99' })
        .expect(200);

      const updated = await prisma.user.findUnique({ where: { id: userId } });
      expect(updated).not.toBeNull();
      expect(updated!.refreshTokenHash).toBeNull();
      expect(updated!.refreshTokenExpiresAt).toBeNull();
      expect(await bcrypt.compare('BrandNewPass99', updated!.passwordHash)).toBe(
        true,
      );
      expect(await bcrypt.compare('OriginalPass12', updated!.passwordHash)).toBe(
        false,
      );
    } finally {
      await prisma.$disconnect();
    }
  });
});
