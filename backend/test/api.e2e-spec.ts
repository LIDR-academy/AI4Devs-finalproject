import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthenticatedUser } from '../src/common/authenticated-request';
import { JwtAuthGuard } from '../src/common/jwt-auth.guard';
import { BusinessController } from '../src/business/business.controller';
import { BusinessService } from '../src/business/business.service';
import { DiscoveryController } from '../src/discovery/discovery.controller';
import { DiscoveryService } from '../src/discovery/discovery.service';
import { AssetsController } from '../src/assets/assets.controller';
import { AssetsService } from '../src/assets/assets.service';

const authenticatedUser: AuthenticatedUser = { id: '00000000-0000-4000-8000-000000000001', email: 'owner@example.com' };

function guardMock() {
  return { canActivate: (context: { switchToHttp: () => { getRequest: () => { user?: AuthenticatedUser } } }) => {
    context.switchToHttp().getRequest().user = authenticatedUser;
    return true;
  } };
}

describe('MVP API routes', () => {
  let app: INestApplication;
  const businessService = { create: jest.fn(), list: jest.fn() };
  const discoveryService = { submit: jest.fn() };
  const assetsService = { generate: jest.fn(), list: jest.fn(), get: jest.fn(), edit: jest.fn(), regenerate: jest.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController, DiscoveryController, AssetsController],
      providers: [
        { provide: BusinessService, useValue: businessService },
        { provide: DiscoveryService, useValue: discoveryService },
        { provide: AssetsService, useValue: assetsService },
      ],
    }).overrideGuard(JwtAuthGuard).useValue(guardMock()).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });
  beforeEach(() => jest.clearAllMocks());

  it('creates a business for the authenticated owner', async () => {
    businessService.create.mockResolvedValue({ id: 'business-id', name: 'Cafe' });
    await request(app.getHttpServer())
      .post('/api/v1/business')
      .send({ name: 'Cafe' })
      .expect(201)
      .expect({ id: 'business-id', name: 'Cafe' });
    expect(businessService.create).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', { name: 'Cafe' });
  });

  it('submits the validated discovery wizard', async () => {
    discoveryService.submit.mockResolvedValue({ id: 'profile-id', status: 'NORMALIZED' });
    await request(app.getHttpServer())
      .post('/api/v1/discovery/submit')
      .send({
        businessId: '00000000-0000-4000-8000-000000000002', businessName: 'Cafe', category: 'Cafe', services: ['Coffee'],
        targetAudience: 'People in the surrounding neighborhood', tone: 'Friendly', location: 'Madrid', gdprConsent: true,
      })
      .expect(201)
      .expect({ id: 'profile-id', status: 'NORMALIZED' });
    expect(discoveryService.submit).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', expect.objectContaining({ businessId: '00000000-0000-4000-8000-000000000002' }));
  });

  it('generates digital presence through the protected endpoint', async () => {
    assetsService.generate.mockResolvedValue([{ assetType: 'BUSINESS_SUMMARY' }]);
    await request(app.getHttpServer())
      .post('/api/v1/assets/generate-digital-presence')
      .send({ businessId: '00000000-0000-4000-8000-000000000002' })
      .expect(201)
      .expect([{ assetType: 'BUSINESS_SUMMARY' }]);
    expect(assetsService.generate).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', { businessId: '00000000-0000-4000-8000-000000000002' });
  });
});
