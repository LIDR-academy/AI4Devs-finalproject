import { describe, it, expect } from 'vitest';
import type { ShippingData, PaymentData } from './checkout';

describe('US-009-TASK-01: Checkout types', () => {
  it('ShippingData accepts a full object with all fields including phone', () => {
    const data: ShippingData = {
      name: 'Ana Pérez',
      email: 'ana@example.com',
      phone: '600123456',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España',
    };
    expect(data.name).toBe('Ana Pérez');
    expect(data.phone).toBe('600123456');
  });

  it('ShippingData accepts an object without the optional phone field', () => {
    const data: ShippingData = {
      name: 'Carlos López',
      email: 'carlos@example.com',
      address: 'Avenida Diagonal 200',
      city: 'Barcelona',
      postalCode: '08002',
      country: 'España',
    };
    expect(data.phone).toBeUndefined();
    expect(data.city).toBe('Barcelona');
  });

  it('ShippingData has the 6 required string fields', () => {
    const data: ShippingData = {
      name: 'test',
      email: 'test@test.com',
      address: 'test',
      city: 'test',
      postalCode: '00000',
      country: 'test',
    };
    const requiredKeys = ['name', 'email', 'address', 'city', 'postalCode', 'country'];
    for (const key of requiredKeys) {
      expect(data).toHaveProperty(key);
      expect(typeof data[key as keyof ShippingData]).toBe('string');
    }
  });

  it('PaymentData has the 4 required card fields', () => {
    const data: PaymentData = {
      cardNumber: '4111111111111111',
      cardName: 'ANA PEREZ',
      cardExpiry: '12/28',
      cardCVV: '123',
    };
    expect(data.cardNumber).toHaveLength(16);
    expect(data.cardCVV).toHaveLength(3);
    expect(data.cardExpiry).toMatch(/^\d{2}\/\d{2}$/);
  });
});
