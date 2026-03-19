import type { CreateMockOrderPayload } from '@/types/api';

// Variedad realista de formatos: unos separan piso/puerta en line2,
// otros meten todo en line1 con o sin comas, como suele pasar en eCommerce reales.
export const FAKE_ADDRESSES = [
  { line1: 'Calle Atocha 34', line2: '2º B', postalCode: '28012', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Calle Pelayo 12, 4º A', line2: '', postalCode: '08010', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Avenida del Puerto 7', line2: '', postalCode: '46023', city: 'Valencia', province: 'Valencia', country: 'ES' },
  { line1: 'Calle Betis 22', line2: 'Piso 1', postalCode: '41010', city: 'Sevilla', province: 'Sevilla', country: 'ES' },
  { line1: 'Calle Corrida 5 3ºC', line2: '', postalCode: '33201', city: 'Gijón', province: 'Asturias', country: 'ES' },
  { line1: 'Paseo de la Castellana 100', line2: 'Planta 8', postalCode: '28046', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Rambla de Catalunya 78, 2º', line2: '', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Calle San Vicente Mártir 15', line2: '', postalCode: '46002', city: 'Valencia', province: 'Valencia', country: 'ES' },
  { line1: 'Avenida de la Constitución 3', line2: '1º izquierda', postalCode: '41004', city: 'Sevilla', province: 'Sevilla', country: 'ES' },
  { line1: 'Calle Larios 9, Apto 4', line2: '', postalCode: '29015', city: 'Málaga', province: 'Málaga', country: 'ES' },
  { line1: 'Gran Vía 45', line2: '5º dcha', postalCode: '48011', city: 'Bilbao', province: 'Vizcaya', country: 'ES' },
  { line1: 'Calle San Telmo 2', line2: 'Esc. B, 2º D', postalCode: '20003', city: 'San Sebastián', province: 'Gipuzkoa', country: 'ES' },
  { line1: 'Calle Real 18', line2: '', postalCode: '15001', city: 'A Coruña', province: 'A Coruña', country: 'ES' },
  { line1: 'Calle del Carmen 7, 3ºA', line2: '', postalCode: '30001', city: 'Murcia', province: 'Murcia', country: 'ES' },
  { line1: 'Calle Núñez de Balboa 55', line2: '', postalCode: '28001', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Carrer de Balmes 120', line2: 'Piso 6, puerta 2', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Avenida de Aragón 30 4º', line2: '', postalCode: '50013', city: 'Zaragoza', province: 'Zaragoza', country: 'ES' },
  { line1: 'Calle Ancha 10', line2: '1º B', postalCode: '11001', city: 'Cádiz', province: 'Cádiz', country: 'ES' },
  { line1: 'Calle Covadonga 6', line2: '', postalCode: '33002', city: 'Oviedo', province: 'Asturias', country: 'ES' },
  { line1: 'Calle Mayor 44, 2º izq', line2: '', postalCode: '31001', city: 'Pamplona', province: 'Navarra', country: 'ES' },
] as const;

export const FAKE_ORDERS = [
  { items: [{ name: 'Vestido floral manga corta', quantity: 1, price: 59.99 }], total: 59.99, currency: 'EUR' },
  { items: [{ name: 'Zapatillas running Adidas', quantity: 1, price: 89.95 }], total: 89.95, currency: 'EUR' },
  { items: [{ name: 'Camiseta algodón orgánico', quantity: 2, price: 24.50 }], total: 49.00, currency: 'EUR' },
  { items: [{ name: 'Auriculares inalámbricos Sony', quantity: 1, price: 149.00 }], total: 149.00, currency: 'EUR' },
  { items: [{ name: 'Libro "El nombre del viento"', quantity: 1, price: 18.90 }], total: 18.90, currency: 'EUR' },
  { items: [{ name: 'Pantalón vaquero slim fit', quantity: 1, price: 69.99 }, { name: 'Cinturón de cuero', quantity: 1, price: 29.99 }], total: 99.98, currency: 'EUR' },
  { items: [{ name: 'Smartwatch Fitbit Sense', quantity: 1, price: 249.00 }], total: 249.00, currency: 'EUR' },
  { items: [{ name: 'Perfume Chanel N°5 50ml', quantity: 1, price: 119.00 }], total: 119.00, currency: 'EUR' },
  { items: [{ name: 'Funda nórdica 150x200cm', quantity: 1, price: 45.00 }, { name: 'Almohada viscoelástica', quantity: 2, price: 35.00 }], total: 115.00, currency: 'EUR' },
  { items: [{ name: 'Tablet Samsung Galaxy Tab A8', quantity: 1, price: 299.00 }], total: 299.00, currency: 'EUR' },
  { items: [{ name: 'Bolso de mano piel', quantity: 1, price: 135.00 }], total: 135.00, currency: 'EUR' },
  { items: [{ name: 'Cafetera Nespresso Vertuo', quantity: 1, price: 129.95 }], total: 129.95, currency: 'EUR' },
  { items: [{ name: 'Jersey de lana merino', quantity: 1, price: 79.00 }], total: 79.00, currency: 'EUR' },
  { items: [{ name: 'Kit manicura profesional', quantity: 1, price: 34.99 }], total: 34.99, currency: 'EUR' },
  { items: [{ name: 'Silla de oficina ergonómica', quantity: 1, price: 349.00 }], total: 349.00, currency: 'EUR' },
  { items: [{ name: 'Tenis Nike Air Max 90', quantity: 1, price: 109.95 }], total: 109.95, currency: 'EUR' },
  { items: [{ name: 'Set pintura acuarela 36 colores', quantity: 1, price: 42.50 }, { name: 'Block de dibujo A3', quantity: 2, price: 12.00 }], total: 66.50, currency: 'EUR' },
  { items: [{ name: 'Bicicleta estática plegable', quantity: 1, price: 420.00 }], total: 420.00, currency: 'EUR' },
  { items: [{ name: 'Cámara instantánea Fujifilm Instax', quantity: 1, price: 89.00 }, { name: 'Película Instax (20 fotos)', quantity: 2, price: 14.50 }], total: 118.00, currency: 'EUR' },
  { items: [{ name: 'Juego de sábanas percal 180cm', quantity: 1, price: 62.00 }], total: 62.00, currency: 'EUR' },
] as const;

export function getRandomAddress() {
  return FAKE_ADDRESSES[Math.floor(Math.random() * FAKE_ADDRESSES.length)];
}

export function getRandomOrder() {
  return FAKE_ORDERS[Math.floor(Math.random() * FAKE_ORDERS.length)];
}

type FakeAddress = (typeof FAKE_ADDRESSES)[number];

export function toAddressPayload(a: FakeAddress): NonNullable<CreateMockOrderPayload['address']> {
  const streetParts = [a.line1, a.line2].filter(Boolean);
  const street = streetParts.join(', ');
  const fullAddress = [street, a.postalCode, a.city, a.province, a.country]
    .filter(Boolean)
    .join(', ');
  return {
    full_address: fullAddress,
    street,
    postal_code: a.postalCode,
    city: a.city,
    province: a.province || undefined,
    country: a.country,
  };
}
