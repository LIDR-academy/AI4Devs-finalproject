import { Test, TestingModule } from '@nestjs/testing';
import { ExternalOrderIdService } from './external-order-id.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  store: { findUnique: jest.fn() },
  order: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('ExternalOrderIdService', () => {
  let service: ExternalOrderIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalOrderIdService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExternalOrderIdService>(ExternalOrderIdService);
    jest.clearAllMocks();
  });

  describe('generate — WOOCOMMERCE sin pedidos previos', () => {
    it('devuelve "100" cuando no hay pedidos anteriores con ids numéricos', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'WOOCOMMERCE' });
      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await service.generate('store-wc-1');

      expect(result).toBe('100');
    });
  });

  describe('generate — WOOCOMMERCE con pedidos previos', () => {
    it('devuelve el id numérico máximo + delta (entre 1 y 5)', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'WOOCOMMERCE' });
      mockPrisma.order.findMany.mockResolvedValue([
        { externalOrderId: '100' },
        { externalOrderId: '102' },
        { externalOrderId: '105' },
      ]);

      const result = await service.generate('store-wc-1');

      const resultNum = parseInt(result, 10);
      expect(resultNum).toBeGreaterThanOrEqual(106);
      expect(resultNum).toBeLessThanOrEqual(110);
    });
  });

  describe('generate — PRESTASHOP formato correcto', () => {
    it('genera una cadena de 9 letras mayúsculas A-Z', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'PRESTASHOP' });
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const result = await service.generate('store-ps-1');

      expect(result).toHaveLength(9);
      expect(result).toMatch(/^[A-Z]{9}$/);
    });
  });

  describe('generate — PRESTASHOP con colisión en primer intento', () => {
    it('reintenta y devuelve un id único en el segundo intento', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'PRESTASHOP' });

      let callCount = 0;
      mockPrisma.order.findFirst.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return { id: 'existing-order' };
        return null;
      });

      const result = await service.generate('store-ps-1');

      expect(result).toHaveLength(9);
      expect(result).toMatch(/^[A-Z]{9}$/);
      expect(mockPrisma.order.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('generate — SHOPIFY sin pedidos previos', () => {
    it('devuelve "1001" como fallback cuando no hay pedidos', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'SHOPIFY' });
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const result = await service.generate('store-sh-1');

      expect(result).toBe('1001');
    });
  });

  describe('generate — SHOPIFY patrón MM-01007-OUT', () => {
    it('incrementa el número preservando prefijo y sufijo', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'SHOPIFY' });
      mockPrisma.order.findFirst.mockResolvedValue({ externalOrderId: 'MM-01007-OUT' });

      const result = await service.generate('store-sh-1');

      expect(result).toBe('MM-01008-OUT');
    });
  });

  describe('generate — SHOPIFY numérico simple', () => {
    it('incrementa un id puramente numérico de 4+ dígitos', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'SHOPIFY' });
      mockPrisma.order.findFirst.mockResolvedValue({ externalOrderId: '1042' });

      const result = await service.generate('store-sh-1');

      expect(result).toBe('1043');
    });
  });

  describe('generate — plataforma desconocida / fallback', () => {
    it('devuelve "SIM-<timestamp>" para plataformas no reconocidas', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({ platform: 'MAGENTO' });

      const result = await service.generate('store-mag-1');

      expect(result).toMatch(/^SIM-\d+$/);
    });

    it('devuelve "SIM-<timestamp>" cuando la tienda no existe', async () => {
      mockPrisma.store.findUnique.mockResolvedValue(null);

      const result = await service.generate('store-missing-1');

      expect(result).toMatch(/^SIM-\d+$/);
    });
  });
});
