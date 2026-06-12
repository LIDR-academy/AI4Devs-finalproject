import { describe, it, expect } from 'vitest';
import type { Product, Order, OrderStatus } from '../types/index';

describe('US-000-TASK-08: Domain types', () => {
  it('Product type has required running filter fields', () => {
    // Compile-time check via a typed object
    const product: Product = {
      id: 'test',
      name: 'Test shoe',
      brand: 'Nike',
      price: 100,
      image: 'products/test.jpg',
      category: 'shoes',
      subcategory: 'road',
      description: 'Test',
      features: [],
      distance: ['5K', '10K'],
      surface: ['road'],
      level: ['beginner'],
      objective: ['training'],
      sizes: ['42'],
      colors: ['black'],
      stock: 10,
    };
    expect(product.distance).toHaveLength(2);
    expect(product.surface).toHaveLength(1);
    expect(product.level).toHaveLength(1);
    expect(product.objective).toHaveLength(1);
  });

  it('OrderStatus covers all expected values', () => {
    const statuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];
    expect(statuses).toHaveLength(4);
  });

  it('Order type has all shipping fields', () => {
    const order: Order = {
      id: 'ORD-123',
      sessionId: 'sess-1',
      date: new Date().toISOString(),
      status: 'processing',
      subtotal: 100,
      shipping: 5,
      total: 105,
      shippingName: 'Test User',
      shippingEmail: 'test@test.com',
      shippingAddress: 'Calle Test 1',
      shippingCity: 'Madrid',
      shippingPostalCode: '28001',
      shippingCountry: 'ES',
      items: [],
    };
    expect(order.total).toBe(105);
  });
});
