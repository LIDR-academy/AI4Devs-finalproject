import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase, type Database, insertedId, resetDatabase } from '../src/db/database.js';

let db: Database;
let app: ReturnType<typeof createApp>;

describe('ComercIA main flow', () => {
  beforeAll(() => {
    db = createDatabase(':memory:');
    resetDatabase(db);
    seedTestData(db);
    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  it('creates a lead, suggests an offer, accepts order, confirms payment and schedules delivery', async () => {
    const webhook = await request(app)
      .post('/webhooks/whatsapp')
      .send({
        name: 'Laura Perez',
        phone: '+573001231231',
        productSku: 'TEST-001',
        message: 'Hola, me interesa la camara. Tiene descuento?',
        requestedDiscountPercent: 12
      })
      .expect(201);

    expect(webhook.body.messages).toHaveLength(1);
    const conversationId = webhook.body.id;

    const suggestion = await request(app)
      .post(`/conversations/${conversationId}/suggest-reply`)
      .send({ requestedDiscountPercent: 12, quantity: 1 })
      .expect(201);

    expect(suggestion.body.negotiation.proposedPrice).toBe(176000);
    const negotiationId = suggestion.body.negotiation.id;

    const order = await request(app)
      .post(`/negotiations/${negotiationId}/accept`)
      .send()
      .expect(201);

    expect(order.body.status).toBe('pending_payment');

    const paymentLink = await request(app)
      .post(`/orders/${order.body.id}/payment-link`)
      .send()
      .expect(201);

    expect(paymentLink.body.url).toContain(paymentLink.body.externalId);

    const payment = await request(app)
      .post('/webhooks/payments')
      .send({
        externalId: paymentLink.body.externalId,
        orderId: order.body.id,
        status: 'paid'
      })
      .expect(201);

    expect(payment.body.order.status).toBe('paid');

    const delivery = await request(app)
      .post(`/orders/${order.body.id}/delivery`)
      .send({
        deliveryType: 'meetup',
        addressText: 'Centro Comercial Andino, Bogota',
        latitude: 4.6671,
        longitude: -74.0534,
        scheduledAt: new Date(Date.now() + 86400000).toISOString()
      })
      .expect(201);

    expect(delivery.body.mapsUrl).toBe('https://www.google.com/maps?q=4.6671,-74.0534');
  });
});

function seedTestData(testDb: Database) {
  const storeId = insertedId(testDb.prepare(`
    INSERT INTO stores (name, phone) VALUES (?, ?)
  `).run('ComercIA Test Store', '+573009990000'));

  const productId = insertedId(testDb.prepare(`
    INSERT INTO products (
      store_id, sku, name, category, base_price, min_price, stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(storeId, 'TEST-001', 'Camara WiFi', 'Hogar', 200000, 160000, 8));

  testDb.prepare(`
    INSERT INTO inventory_movements (product_id, type, quantity, reason)
    VALUES (?, ?, ?, ?)
  `).run(productId, 'initial', 8, 'Test stock');

  testDb.prepare(`
    INSERT INTO pricing_rules (
      product_id, max_discount_percent, low_rotation_days, low_stock_threshold,
      approval_discount_threshold, offer_expires_in_minutes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(productId, 20, 14, 2, 18, 30);
}

