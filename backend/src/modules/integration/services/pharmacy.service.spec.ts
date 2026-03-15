import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PharmacyService } from './pharmacy.service';

describe('PharmacyService', () => {
  let service: PharmacyService;

  beforeEach(async () => {
    const mockConfig = { get: jest.fn((key: string) => undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<PharmacyService>(PharmacyService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('debe devolver available: true cuando PHARMACY_API_URL no está configurado', async () => {
      const result = await service.getStatus();
      expect(result.available).toBe(true);
      expect(result.message).toContain('simulada');
    });
  });

  describe('requestMedication', () => {
    it('debe aceptar solicitud y devolver referenceId en modo desarrollo', async () => {
      const result = await service.requestMedication({
        patientId: '11111111-1111-4111-8111-111111111111',
        medicationName: 'Paracetamol 500mg',
        quantity: 30,
      });
      expect(result.accepted).toBe(true);
      expect(result.referenceId).toBeDefined();
    });
  });
});
