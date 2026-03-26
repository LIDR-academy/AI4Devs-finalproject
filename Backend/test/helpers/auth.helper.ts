import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface AuthTokens {
  accessToken: string;
  userId: string;
}

/**
 * Registers a user via POST /api/auth/register and returns accessToken and user id.
 * Fails the test if response is not 201 or body is missing accessToken/user.
 *
 * @param app - Nest application (from createTestApp())
 * @param payload - nombre, email, contraseña
 * @returns accessToken and userId
 */
export async function registerAndGetToken(
  app: INestApplication,
  payload: { nombre: string; email: string; contraseña: string },
): Promise<AuthTokens> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send(payload)
    .expect(201);
  const body = res.body as { accessToken?: string; user?: { id?: string } };
  if (!body.accessToken || !body.user?.id) {
    throw new Error(
      `Expected 201 with accessToken and user.id, got: ${JSON.stringify(body)}`,
    );
  }
  return { accessToken: body.accessToken, userId: body.user.id };
}

/**
 * Logs in via POST /api/auth/login and returns accessToken and user id.
 *
 * @param app - Nest application
 * @param payload - email, contraseña
 * @returns accessToken and userId
 */
export async function loginAndGetToken(
  app: INestApplication,
  payload: { email: string; contraseña: string },
): Promise<AuthTokens> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send(payload)
    .expect(200);
  const body = res.body as { accessToken?: string; user?: { id?: string } };
  if (!body.accessToken || !body.user?.id) {
    throw new Error(
      `Expected 200 with accessToken and user.id, got: ${JSON.stringify(body)}`,
    );
  }
  return { accessToken: body.accessToken, userId: body.user.id };
}
