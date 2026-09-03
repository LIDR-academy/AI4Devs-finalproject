import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import request from 'supertest';

function uniqueEmail(): string {
  return `automated-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

describe('Database-backed MVP journey', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    if (userId) {
      await prisma.aIGeneration.deleteMany({ where: { requestedById: userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    if (app) await app.close();
  });

  it('completes the real vertical slice and persists five assets and generation history', async () => {
    const email = uniqueEmail();
    const password = 'correct-password-123';

    const registration = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, name: 'Automated E2E Owner', password })
      .expect(201);
    userId = registration.body.user.id;

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);
    const token = login.body.accessToken as string;

    const business = await request(app.getHttpServer())
      .post('/api/v1/business')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Automated E2E Cafe' })
      .expect(201);
    const businessId = business.body.id as string;

    const profile = await request(app.getHttpServer())
      .post('/api/v1/discovery/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessId,
        businessName: 'Automated E2E Cafe',
        category: 'Cafe',
        services: ['Coffee', 'Brunch'],
        products: ['Pastries'],
        targetAudience: 'People from the surrounding neighborhood',
        tone: 'Friendly',
        style: 'Clear and direct',
        location: 'Madrid',
        gdprConsent: true,
      })
      .expect(201);
    expect(profile.body.status).toBe('NORMALIZED');

    const approval = await request(app.getHttpServer())
      .post('/api/v1/business-profile/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessId })
      .expect(201);
    expect(approval.body.status).toBe('APPROVED');

    const generation = await request(app.getHttpServer())
      .post('/api/v1/assets/generate-digital-presence')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessId })
      .expect(201);
    expect(generation.body).toHaveLength(5);

    const assets = await request(app.getHttpServer())
      .get(`/api/v1/assets?businessId=${businessId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(assets.body).toHaveLength(5);
    expect(assets.body.map((asset: { assetType: string }) => asset.assetType).sort()).toEqual([
      'BUSINESS_SUMMARY',
      'FAQ',
      'GOOGLE_BUSINESS_DESCRIPTION',
      'SOCIAL_MEDIA_BIO',
      'WEBSITE_CONTENT',
    ]);

    const profileId = profile.body.id as string;
    const generations = await prisma.aIGeneration.findMany({
      where: { businessProfileId: profileId },
    });
    expect(generations).toHaveLength(5);
    expect(generations.every((generation) => generation.status === 'SUCCEEDED')).toBe(true);
    expect(generations.every((generation) => generation.promptSnapshot.length > 0)).toBe(true);
    expect(generations.every((generation) => generation.contextSnapshot.includes('Automated E2E Cafe'))).toBe(true);
    expect(generations.every((generation) => generation.responseSnapshot.length > 0)).toBe(true);
    expect(generations.every((generation) => generation.promptVersion === 'v1' && generation.contextVersion === 'v1')).toBe(true);
    expect(generations.every((generation) => generation.modelUsed === 'mock-deterministic-v1' && generation.temperature === 0.2 && generation.tokensUsed !== null)).toBe(true);
  });
});
