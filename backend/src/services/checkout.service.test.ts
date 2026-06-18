import { CheckoutService } from './checkout.service';
import { IOrderRepository } from '../repositories/order.repository';
import { OrderResponse, ShippingInput } from '../types/domain';

const buildShipping = (overrides: Partial<ShippingInput> = {}): ShippingInput => ({
  name: 'Jane Runner',
  email: 'jane@example.com',
  address: 'Calle Falsa 123',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
  ...overrides,
});

const buildOrderResponse = (overrides: Partial<OrderResponse> = {}): OrderResponse => ({
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
    createOrderFromCart: jest.fn().mockResolvedValue(buildOrderResponse()),
    ...overrides,
  }) as jest.Mocked<IOrderRepository>;

describe('CheckoutService', () => {
  describe('processCheckout', () => {
    it('delega en OrderRepository con los argumentos correctos', async () => {
      const orderRepo = makeOrderRepo();
      const service = new CheckoutService(orderRepo);
      const shipping = buildShipping();

      const result = await service.processCheckout('session-1', shipping);

      expect(orderRepo.createOrderFromCart).toHaveBeenCalledWith('session-1', shipping);
      expect(orderRepo.createOrderFromCart).toHaveBeenCalledTimes(1);
      expect(result).toEqual(await orderRepo.createOrderFromCart.mock.results[0].value);
    });

    it('devuelve el resultado del repositorio sin transformación', async () => {
      const orderResponse = buildOrderResponse({ id: 'ORD-999' });
      const orderRepo = makeOrderRepo({
        createOrderFromCart: jest.fn().mockResolvedValue(orderResponse),
      });
      const service = new CheckoutService(orderRepo);

      const result = await service.processCheckout('session-1', buildShipping());

      expect(result).toBe(orderResponse);
    });

    it('propaga errores lanzados por el repositorio', async () => {
      const error = new Error('boom');
      const orderRepo = makeOrderRepo({
        createOrderFromCart: jest.fn().mockRejectedValue(error),
      });
      const service = new CheckoutService(orderRepo);

      await expect(
        service.processCheckout('session-1', buildShipping()),
      ).rejects.toThrow('boom');
    });
  });
});
