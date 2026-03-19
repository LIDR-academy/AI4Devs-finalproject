import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MockOrdersService } from './mock-orders.service';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { ExternalOrderIdService } from '../orders/external-order-id.service';
import { ConversationsService } from '../conversations/conversations.service';
import { EcommerceSyncService } from '../ecommerce-sync/ecommerce-sync.service';
import { CreateMockOrderDto } from './dto/create-mock-order.dto';

const mockStores = { findOrCreateStore: jest.fn() };
const mockUsers = { findOrCreateByPhone: jest.fn() };
const mockOrders = { createFromMock: jest.fn(), updateStatus: jest.fn() };
const mockExternalOrderId = { generate: jest.fn() };
const mockConversations = { createAndEnqueue: jest.fn() };
const mockEcommerceSync = { simulateSync: jest.fn() };

const baseAdreslesDto: CreateMockOrderDto = {
  store: { name: 'Tienda Demo', url: 'https://demo.example.com' },
  external_order_id: 'ext-001',
  buyer: {
    first_name: 'Ana',
    last_name: 'García',
    phone: '+34600111222',
    email: 'ana@example.com',
  },
  mode: 'adresles',
  items: [{ name: 'Producto A', quantity: 1, price: 50 }],
  total_amount: 50,
  currency: 'EUR',
};

const addressDto = {
  full_address: 'Calle Mayor 1, 28001 Madrid',
  street: 'Calle Mayor',
  number: '1',
  postal_code: '28001',
  city: 'Madrid',
  country: 'ES',
};

const baseTraditionalDto: CreateMockOrderDto = {
  ...baseAdreslesDto,
  mode: 'tradicional',
  address: addressDto,
};

describe('MockOrdersService', () => {
  let service: MockOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockOrdersService,
        { provide: StoresService, useValue: mockStores },
        { provide: UsersService, useValue: mockUsers },
        { provide: OrdersService, useValue: mockOrders },
        { provide: ExternalOrderIdService, useValue: mockExternalOrderId },
        { provide: ConversationsService, useValue: mockConversations },
        { provide: EcommerceSyncService, useValue: mockEcommerceSync },
      ],
    }).compile();

    service = module.get<MockOrdersService>(MockOrdersService);
    jest.clearAllMocks();

    mockStores.findOrCreateStore.mockResolvedValue({ id: 'store-1' });
    mockUsers.findOrCreateByPhone.mockResolvedValue({ id: 'user-1', phoneId: 'phone-1' });
    mockOrders.createFromMock.mockResolvedValue({ id: 'order-1' });
    mockOrders.updateStatus.mockResolvedValue({ id: 'order-1' });
    mockExternalOrderId.generate.mockResolvedValue('generated-123');
    mockConversations.createAndEnqueue.mockResolvedValue({ id: 'conv-1' });
  });

  describe('processMockOrder — modo adresles', () => {
    it('returns order_id and conversation_id', async () => {
      const result = await service.processMockOrder(baseAdreslesDto);

      expect(result).toEqual({ order_id: 'order-1', conversation_id: 'conv-1' });
    });

    it('calls findOrCreateStore and findOrCreateByPhone with dto data', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockStores.findOrCreateStore).toHaveBeenCalledWith(baseAdreslesDto.store);
      expect(mockUsers.findOrCreateByPhone).toHaveBeenCalledWith(baseAdreslesDto.buyer);
    });

    it('creates order with PENDING_ADDRESS status and ADRESLES mode', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockOrders.createFromMock).toHaveBeenCalledWith(
        baseAdreslesDto,
        'store-1',
        'user-1',
        expect.objectContaining({
          initialStatus: 'PENDING_ADDRESS',
          orderMode: 'ADRESLES',
        }),
      );
    });

    it('creates conversation with type GET_ADDRESS', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockConversations.createAndEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          userId: 'user-1',
          conversationType: 'GET_ADDRESS',
        }),
      );
    });

    it('does not create an address or call simulateSync', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockOrders.createFromMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.not.objectContaining({ createAddress: expect.anything() }),
      );
      expect(mockEcommerceSync.simulateSync).not.toHaveBeenCalled();
    });

    it('usa el external_order_id explícito del DTO sin llamar al generador', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockExternalOrderId.generate).not.toHaveBeenCalled();
      expect(mockOrders.createFromMock).toHaveBeenCalledWith(
        expect.objectContaining({ external_order_id: 'ext-001' }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('genera external_order_id automáticamente si no viene en el DTO', async () => {
      const { external_order_id: _id, ...dtoSinId } = baseAdreslesDto;
      const dto: CreateMockOrderDto = { ...dtoSinId };

      await service.processMockOrder(dto);

      expect(mockExternalOrderId.generate).toHaveBeenCalledWith('store-1');
      expect(mockOrders.createFromMock).toHaveBeenCalledWith(
        expect.objectContaining({ external_order_id: 'generated-123' }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('processMockOrder — modo tradicional', () => {
    it('returns order_id and conversation_id', async () => {
      const result = await service.processMockOrder(baseTraditionalDto);

      expect(result).toEqual({ order_id: 'order-1', conversation_id: 'conv-1' });
    });

    it('creates order with READY_TO_PROCESS status, TRADITIONAL mode and address embedded', async () => {
      await service.processMockOrder(baseTraditionalDto);

      expect(mockOrders.createFromMock).toHaveBeenCalledWith(
        baseTraditionalDto,
        'store-1',
        'user-1',
        expect.objectContaining({
          initialStatus: 'READY_TO_PROCESS',
          orderMode: 'TRADITIONAL',
          createAddress: expect.objectContaining({
            address: addressDto,
            recipientPhoneId: 'phone-1',
            recipientName: 'Ana García',
          }),
        }),
      );
    });

    it('creates conversation with type INFORMATION', async () => {
      await service.processMockOrder(baseTraditionalDto);

      expect(mockConversations.createAndEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          userId: 'user-1',
          conversationType: 'INFORMATION',
        }),
      );
    });

    it('calls simulateSync with address snapshot', async () => {
      await service.processMockOrder(baseTraditionalDto);

      expect(mockEcommerceSync.simulateSync).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          orderId: 'order-1',
          fullAddress: addressDto.full_address,
          recipientName: 'Ana García',
          recipientPhone: baseTraditionalDto.buyer.phone,
        }),
      );
    });

    it('does not update order status after sync — READY_TO_PROCESS is the final MVP state', async () => {
      await service.processMockOrder(baseTraditionalDto);

      expect(mockOrders.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('processMockOrder — campos de contexto eCommerce', () => {
    it('pasa context con buyerRegisteredEcommerce y buyerEcommerceAddress a createAndEnqueue', async () => {
      const ecommerceAddress = {
        full_address: 'Calle Fuencarral 45, 3º, 28004 Madrid',
        street: 'Calle Fuencarral',
        number: '45',
        postal_code: '28004',
        city: 'Madrid',
        country: 'ES',
      };
      const dto: CreateMockOrderDto = {
        ...baseAdreslesDto,
        buyer_registered_ecommerce: true,
        buyer_ecommerce_address: ecommerceAddress,
      };

      await service.processMockOrder(dto);

      expect(mockConversations.createAndEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            buyerRegisteredEcommerce: true,
            buyerEcommerceAddress: ecommerceAddress,
          }),
        }),
      );
    });

    it('pasa context con valores por defecto cuando no se envían campos opcionales', async () => {
      await service.processMockOrder(baseAdreslesDto);

      expect(mockConversations.createAndEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            buyerRegisteredEcommerce: false,
            buyerEcommerceAddress: null,
            giftRecipient: null,
          },
        }),
      );
    });

    it('pasa context con giftRecipient cuando se incluye destinatario de regalo', async () => {
      const giftRecipient = {
        first_name: 'Lucía',
        last_name: 'García',
        phone: '+34612345099',
      };
      const dto: CreateMockOrderDto = {
        ...baseAdreslesDto,
        gift_recipient: giftRecipient,
      };

      await service.processMockOrder(dto);

      expect(mockConversations.createAndEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            giftRecipient,
          }),
        }),
      );
    });
  });

  describe('processMockOrder — modo tradicional sin dirección', () => {
    it('throws BadRequestException when mode is tradicional and address is missing', async () => {
      const { address: _addr, ...dtoWithoutAddress } = baseTraditionalDto;
      const dto = { ...dtoWithoutAddress } as CreateMockOrderDto;

      await expect(service.processMockOrder(dto)).rejects.toThrow(BadRequestException);
    });

    it('does not call any downstream service when address is missing', async () => {
      const { address: _addr, ...dtoWithoutAddress } = baseTraditionalDto;
      const dto = { ...dtoWithoutAddress } as CreateMockOrderDto;

      await expect(service.processMockOrder(dto)).rejects.toThrow();

      expect(mockOrders.createFromMock).not.toHaveBeenCalled();
      expect(mockConversations.createAndEnqueue).not.toHaveBeenCalled();
    });
  });
});
