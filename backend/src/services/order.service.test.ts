import { OrderService } from './order.service';
import { IOrderRepository } from '../repositories/order.repository';
import { OrderListResponse } from '../types/domain';

const buildOrderListResponse = (
  overrides: Partial<OrderListResponse> = {},
): OrderListResponse => ({
  id: 'ORD-1700000000000',
  status: 'processing',
  date: new Date().toISOString(),
  subtotal: 40,
  shipping: 4.99,
  total: 44.99,
  shippingName: 'Jane Runner',
  shippingEmail: 'jane@example.com',
  shippingAddress: 'Calle Falsa 123',
  shippingCity: 'Madrid',
  shippingPostalCode: '28001',
  shippingCountry: 'España',
  items: [],
  ...overrides,
});

const makeOrderRepo = (
  overrides: Partial<IOrderRepository> = {},
): jest.Mocked<IOrderRepository> =>
  ({
    createOrderFromCart: jest.fn(),
    findBySession: jest.fn().mockResolvedValue([buildOrderListResponse()]),
    ...overrides,
  }) as jest.Mocked<IOrderRepository>;

describe('OrderService', () => {
  describe('getOrders', () => {
    it('delega en OrderRepository.findBySession con el sessionId recibido', async () => {
      const orderRepo = makeOrderRepo();
      const service = new OrderService(orderRepo);

      await service.getOrders('session-1');

      expect(orderRepo.findBySession).toHaveBeenCalledWith('session-1');
      expect(orderRepo.findBySession).toHaveBeenCalledTimes(1);
    });

    it('devuelve el resultado del repositorio sin transformación', async () => {
      const orders = [buildOrderListResponse({ id: 'ORD-999' })];
      const orderRepo = makeOrderRepo({
        findBySession: jest.fn().mockResolvedValue(orders),
      });
      const service = new OrderService(orderRepo);

      const result = await service.getOrders('session-1');

      expect(result).toBe(orders);
    });

    it('propaga errores lanzados por el repositorio', async () => {
      const error = new Error('boom');
      const orderRepo = makeOrderRepo({
        findBySession: jest.fn().mockRejectedValue(error),
      });
      const service = new OrderService(orderRepo);

      await expect(service.getOrders('session-1')).rejects.toThrow('boom');
    });
  });
});
