import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockOrderDto } from '../mock/dto/create-mock-order.dto';
import { OrderStatus } from '@adresles/prisma-db';

const mockPrisma = {
  order: {
    create: jest.fn(),
    update: jest.fn(),
  },
  orderAddress: {
    create: jest.fn(),
  },
};

const baseDto: CreateMockOrderDto = {
  store: { name: 'Test Store', url: 'https://test.com' },
  external_order_id: 'ext-001',
  external_order_number: 'ORD-001',
  buyer: { first_name: 'Ana', last_name: 'García', phone: '+34600000001' },
  mode: 'adresles',
  items: [{ name: 'Producto A', quantity: 1, price: 50 }],
  total_amount: 50,
  currency: 'EUR',
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('createFromMock', () => {
    it('creates an order with PENDING_ADDRESS status for adresles mode without creating address', async () => {
      const createdOrder = { id: 'order-uuid-1', status: 'PENDING_ADDRESS' };
      mockPrisma.order.create.mockResolvedValue(createdOrder);

      const result = await service.createFromMock(baseDto, 'store-1', 'user-1', {
        initialStatus: 'PENDING_ADDRESS' as OrderStatus,
        orderMode: 'ADRESLES',
      });

      expect(mockPrisma.order.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-1',
            userId: 'user-1',
            status: 'PENDING_ADDRESS',
            orderMode: 'ADRESLES',
            totalAmount: 50,
            currency: 'EUR',
          }),
        }),
      );
      expect(mockPrisma.orderAddress.create).not.toHaveBeenCalled();
      expect(result).toEqual(createdOrder);
    });

    it('creates an order with READY_TO_PROCESS and also creates an OrderAddress for tradicional mode', async () => {
      const createdOrder = { id: 'order-uuid-2', status: 'READY_TO_PROCESS' };
      mockPrisma.order.create.mockResolvedValue(createdOrder);
      mockPrisma.orderAddress.create.mockResolvedValue({ id: 'addr-1' });

      const dtoTrad: CreateMockOrderDto = {
        ...baseDto,
        mode: 'tradicional',
        address: {
          full_address: 'Calle Mayor 1, 28001 Madrid',
          street: 'Calle Mayor',
          number: '1',
          postal_code: '28001',
          city: 'Madrid',
          country: 'ES',
        },
      };

      const result = await service.createFromMock(dtoTrad, 'store-1', 'user-1', {
        initialStatus: 'READY_TO_PROCESS' as OrderStatus,
        orderMode: 'TRADITIONAL',
        createAddress: {
          address: dtoTrad.address!,
          recipientPhoneId: 'phone-1',
          recipientName: 'Ana García',
        },
      });

      expect(mockPrisma.order.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'READY_TO_PROCESS',
            orderMode: 'TRADITIONAL',
            addressConfirmedAt: expect.any(Date),
            syncedAt: expect.any(Date),
            statusSource: 'STORE',
          }),
        }),
      );
      expect(mockPrisma.orderAddress.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.orderAddress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-uuid-2',
            recipientType: 'BUYER',
            recipientName: 'Ana García',
            street: 'Calle Mayor',
            postalCode: '28001',
            city: 'Madrid',
            country: 'ES',
            addressOrigin: 'STORE_TRADITIONAL',
          }),
        }),
      );
      expect(result).toEqual(createdOrder);
    });

    it('calculates fee correctly for total_amount = 50', async () => {
      mockPrisma.order.create.mockResolvedValue({ id: 'order-1' });

      await service.createFromMock(baseDto, 'store-1', 'user-1', {
        initialStatus: 'PENDING_ADDRESS' as OrderStatus,
        orderMode: 'ADRESLES',
      });

      // fee% = 5 - (2.5 × (50 - 10) / 90) ≈ 3.889
      const callData = mockPrisma.order.create.mock.calls[0][0].data;
      expect(callData.feePercentage).toBeCloseTo(3.889, 2);
      expect(callData.feeAmount).toBeCloseTo(1.944, 2);
    });

    it('does not set addressConfirmedAt, syncedAt or statusSource when status is PENDING_ADDRESS', async () => {
      mockPrisma.order.create.mockResolvedValue({ id: 'order-1' });

      await service.createFromMock(baseDto, 'store-1', 'user-1', {
        initialStatus: 'PENDING_ADDRESS' as OrderStatus,
        orderMode: 'ADRESLES',
      });

      const callData = mockPrisma.order.create.mock.calls[0][0].data;
      expect(callData.addressConfirmedAt).toBeUndefined();
      expect(callData.syncedAt).toBeUndefined();
      expect(callData.statusSource).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('calls prisma.order.update with the given status', async () => {
      mockPrisma.order.update.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });

      await service.updateStatus('order-1', 'COMPLETED' as OrderStatus);

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'COMPLETED' },
      });
    });

    it('passes optional timestamps to prisma.order.update', async () => {
      mockPrisma.order.update.mockResolvedValue({ id: 'order-1' });
      const syncedAt = new Date();

      await service.updateStatus('order-1', 'COMPLETED' as OrderStatus, { syncedAt });

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'COMPLETED', syncedAt },
      });
    });
  });

  describe('createAddressFromConversation', () => {
    it('creates order address with USER_CONVERSATION origin', async () => {
      mockPrisma.orderAddress.create.mockResolvedValue({ id: 'addr-2' });

      await service.createAddressFromConversation({
        orderId: 'order-1',
        recipientPhoneId: 'phone-1',
        recipientName: 'Ana García',
        address: {
          street: 'Gran Vía',
          number: '10',
          postalCode: '28013',
          city: 'Madrid',
          country: 'ES',
          fullAddress: 'Gran Vía 10, 28013 Madrid',
        },
      });

      expect(mockPrisma.orderAddress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            addressOrigin: 'USER_CONVERSATION',
            confirmedVia: 'CONVERSATION',
          }),
        }),
      );
    });
  });
});
