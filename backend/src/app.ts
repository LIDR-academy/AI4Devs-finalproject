import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { config } from './config.js';
import type { Database } from './db/database.js';
import { insertedId, transaction } from './db/database.js';
import { calculateOffer } from './domain/pricingEngine.js';
import { buildMapsUrl } from './domain/maps.js';
import { asyncHandler } from './lib/asyncHandler.js';
import { HttpError } from './lib/httpError.js';
import {
  deliverySchema,
  paymentWebhookSchema,
  pricingRuleSchema,
  productSchema,
  suggestReplySchema,
  whatsappWebhookSchema
} from './lib/schemas.js';

export function createApp(db: Database) {
  const app = express();

  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'comercia-backend' });
  });

  app.get('/products', (_req, res) => {
    res.json(listProducts(db));
  });

  app.post('/products', asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    const store = ensureDefaultStore(db);

    if (input.minPrice > input.basePrice) {
      throw new HttpError(400, 'minPrice cannot be greater than basePrice');
    }

    const product = transaction(db, () => {
      const result = db.prepare(`
        INSERT INTO products (store_id, sku, name, description, category, base_price, min_price, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        store.id,
        input.sku,
        input.name,
        input.description ?? null,
        input.category,
        input.basePrice,
        input.minPrice,
        input.stock
      );

      const productId = insertedId(result);
      db.prepare(`
        INSERT INTO inventory_movements (product_id, type, quantity, reason)
        VALUES (?, ?, ?, ?)
      `).run(productId, 'initial', input.stock, 'Initial stock');

      return getProductById(db, productId);
    });

    res.status(201).json(product);
  }));

  app.put('/products/:id/pricing-rule', asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    const input = pricingRuleSchema.parse(req.body);
    requireProduct(db, productId);

    const existing = getPricingRule(db, productId);
    if (existing) {
      db.prepare(`
        UPDATE pricing_rules
        SET max_discount_percent = ?, low_rotation_days = ?, low_stock_threshold = ?,
            approval_discount_threshold = ?, offer_expires_in_minutes = ?, active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(
        input.maxDiscountPercent,
        input.lowRotationDays,
        input.lowStockThreshold,
        input.approvalDiscountThreshold,
        input.offerExpiresInMinutes,
        input.active === false ? 0 : 1,
        productId
      );
    } else {
      db.prepare(`
        INSERT INTO pricing_rules (
          product_id, max_discount_percent, low_rotation_days, low_stock_threshold,
          approval_discount_threshold, offer_expires_in_minutes, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId,
        input.maxDiscountPercent,
        input.lowRotationDays,
        input.lowStockThreshold,
        input.approvalDiscountThreshold,
        input.offerExpiresInMinutes,
        input.active === false ? 0 : 1
      );
    }

    res.json(getPricingRule(db, productId));
  }));

  app.post('/products/:id/inventory-movements', asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    const input = z.object({
      type: z.enum(['restock', 'reservation', 'sale', 'adjustment']),
      quantity: z.number().int(),
      reason: z.string().min(3)
    }).parse(req.body);

    const product = requireProduct(db, productId);
    const nextStock = product.stock + input.quantity;
    if (nextStock < 0) {
      throw new HttpError(400, 'Inventory movement would make stock negative');
    }

    transaction(db, () => {
      db.prepare(`
        INSERT INTO inventory_movements (product_id, type, quantity, reason)
        VALUES (?, ?, ?, ?)
      `).run(productId, input.type, input.quantity, input.reason);

      db.prepare(`
        UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(nextStock, productId);
    });

    res.json(getProductById(db, productId));
  }));

  app.post('/webhooks/whatsapp', asyncHandler(async (req, res) => {
    const input = whatsappWebhookSchema.parse(req.body);
    const product = getProductBySku(db, input.productSku);
    if (!product) {
      throw new HttpError(404, `Product ${input.productSku} not found`);
    }

    const conversation = transaction(db, () => {
      const lead = upsertLead(db, product.storeId, input.name, input.phone);
      const activeConversation = findActiveConversation(db, lead.id, product.id);
      const conversationId = activeConversation
        ? Number(activeConversation.id)
        : insertedId(db.prepare(`
          INSERT INTO conversations (lead_id, product_id, channel)
          VALUES (?, ?, ?)
        `).run(lead.id, product.id, 'whatsapp'));

      const messageResult = db.prepare(`
        INSERT INTO messages (conversation_id, direction, body, metadata)
        VALUES (?, ?, ?, ?)
      `).run(
        conversationId,
        'inbound',
        input.message,
        JSON.stringify({
          productSku: input.productSku,
          quantity: input.quantity,
          requestedDiscountPercent: input.requestedDiscountPercent ?? null
        })
      );

      const message = db.prepare('SELECT created_at FROM messages WHERE id = ?')
        .get(insertedId(messageResult)) as { created_at: string };

      db.prepare(`
        UPDATE conversations SET last_message_at = ? WHERE id = ?
      `).run(message.created_at, conversationId);

      return getConversationById(db, conversationId);
    });

    res.status(201).json(conversation);
  }));

  app.get('/conversations', (_req, res) => {
    res.json(listConversations(db));
  });

  app.get('/conversations/:id', asyncHandler(async (req, res) => {
    res.json(requireConversation(db, Number(req.params.id)));
  }));

  app.post('/conversations/:id/suggest-reply', asyncHandler(async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = suggestReplySchema.parse(req.body);
    const conversation = requireConversation(db, conversationId);

    if (!conversation.product.pricingRule || !conversation.product.pricingRule.active) {
      throw new HttpError(400, 'Product has no active pricing rule');
    }

    const recentSalesCount = Number((db.prepare(`
      SELECT COUNT(*) AS count FROM inventory_movements WHERE product_id = ? AND type = 'sale'
    `).get(conversation.product.id) as { count: number }).count);

    const offer = calculateOffer({
      basePrice: conversation.product.basePrice,
      minPrice: conversation.product.minPrice,
      stock: conversation.product.stock,
      recentSalesCount,
      rule: conversation.product.pricingRule,
      requestedDiscountPercent: input.requestedDiscountPercent
    });

    const status = offer.requiresApproval ? 'human_review' : 'proposed';
    const reply = buildSuggestedReply(
      conversation.lead.name,
      conversation.product.name,
      offer.proposedPrice,
      offer.expiresAt
    );

    const negotiation = transaction(db, () => {
      const result = db.prepare(`
        INSERT INTO negotiations (
          conversation_id, product_id, quantity, initial_price, proposed_price, min_allowed_price,
          discount_percent, rationale, status, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        conversationId,
        conversation.product.id,
        input.quantity,
        offer.initialPrice,
        offer.proposedPrice,
        offer.minAllowedPrice,
        offer.discountPercent,
        offer.rationale,
        status,
        offer.expiresAt.toISOString()
      );

      const negotiationId = insertedId(result);
      db.prepare(`
        UPDATE conversations SET status = ? WHERE id = ?
      `).run(offer.requiresApproval ? 'human_review' : 'open', conversationId);

      db.prepare(`
        INSERT INTO messages (conversation_id, direction, body, metadata)
        VALUES (?, ?, ?, ?)
      `).run(
        conversationId,
        'system',
        `Oferta sugerida: ${reply}`,
        JSON.stringify({ negotiationId })
      );

      return getNegotiationById(db, negotiationId);
    });

    res.status(201).json({ negotiation, reply });
  }));

  app.post('/negotiations/:id/accept', asyncHandler(async (req, res) => {
    const negotiation = requireNegotiationWithConversation(db, Number(req.params.id));

    if (new Date(negotiation.expiresAt) < new Date()) {
      throw new HttpError(400, 'Negotiation has expired');
    }

    if (negotiation.product.stock < negotiation.quantity) {
      throw new HttpError(400, 'Not enough stock for this order');
    }

    const order = transaction(db, () => {
      db.prepare('UPDATE negotiations SET status = ? WHERE id = ?')
        .run('accepted', negotiation.id);

      const existing = getOrderByNegotiationId(db, negotiation.id);
      if (existing) {
        return existing;
      }

      const result = db.prepare(`
        INSERT INTO orders (
          store_id, lead_id, product_id, negotiation_id, quantity, unit_price, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        negotiation.lead.storeId,
        negotiation.lead.id,
        negotiation.product.id,
        negotiation.id,
        negotiation.quantity,
        negotiation.proposedPrice,
        negotiation.proposedPrice * negotiation.quantity
      );

      const orderId = insertedId(result);
      db.prepare('UPDATE conversations SET status = ? WHERE id = ?')
        .run('waiting_payment', negotiation.conversationId);
      db.prepare(`
        INSERT INTO messages (conversation_id, direction, body)
        VALUES (?, ?, ?)
      `).run(
        negotiation.conversationId,
        'outbound',
        `Perfecto, ${negotiation.lead.name}. Te separo ${negotiation.quantity} unidad(es) de ${negotiation.product.name} por ${formatCurrency(negotiation.proposedPrice * negotiation.quantity)}.`
      );

      return getOrderById(db, orderId);
    });

    res.status(201).json(order);
  }));

  app.post('/orders/:id/payment-link', asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const order = requireOrder(db, orderId);

    if (order.status !== 'pending_payment') {
      throw new HttpError(400, 'Payment link can only be generated for pending orders');
    }

    if (order.paymentLink) {
      res.json(order.paymentLink);
      return;
    }

    const paymentLink = transaction(db, () => {
      const externalId = `pay_${order.id}_${Date.now()}`;
      const result = db.prepare(`
        INSERT INTO payment_links (order_id, external_id, url, expires_at)
        VALUES (?, ?, ?, ?)
      `).run(
        order.id,
        externalId,
        `${config.paymentBaseUrl}/${externalId}`,
        new Date(Date.now() + 30 * 60 * 1000).toISOString()
      );

      db.prepare(`
        INSERT INTO messages (conversation_id, direction, body)
        VALUES (?, ?, ?)
      `).run(order.conversationId, 'outbound', `Link de pago: ${config.paymentBaseUrl}/${externalId}`);

      return getPaymentLinkById(db, insertedId(result));
    });

    res.status(201).json(paymentLink);
  }));

  app.post('/webhooks/payments', asyncHandler(async (req, res) => {
    const input = paymentWebhookSchema.parse(req.body);
    const existingEvent = db.prepare('SELECT * FROM payment_events WHERE external_id = ?')
      .get(input.externalId);

    if (existingEvent) {
      res.json({ duplicate: true, event: existingEvent });
      return;
    }

    const order = requireOrder(db, input.orderId);
    if (!order.paymentLink || order.paymentLink.externalId !== input.externalId) {
      throw new HttpError(400, 'Payment externalId does not match order payment link');
    }

    const result = transaction(db, () => {
      const eventResult = db.prepare(`
        INSERT INTO payment_events (external_id, order_id, status, payload)
        VALUES (?, ?, ?, ?)
      `).run(input.externalId, input.orderId, input.status, JSON.stringify(input));

      if (input.status === 'failed') {
        db.prepare('UPDATE payment_links SET status = ? WHERE order_id = ?')
          .run('failed', order.id);
        return { event: getPaymentEventById(db, insertedId(eventResult)), order };
      }

      if (order.status !== 'paid') {
        if (order.product.stock < order.quantity) {
          throw new HttpError(400, 'Not enough stock to confirm payment');
        }

        db.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(order.product.stock - order.quantity, order.product.id);
        db.prepare(`
          INSERT INTO inventory_movements (product_id, type, quantity, reason, reference_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(order.product.id, 'sale', -order.quantity, 'Simulated payment confirmed', String(order.id));
        db.prepare('UPDATE payment_links SET status = ? WHERE order_id = ?')
          .run('paid', order.id);
        db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('paid', order.id);
        db.prepare('UPDATE conversations SET status = ? WHERE id = ?')
          .run('paid', order.conversationId);
        db.prepare(`
          INSERT INTO messages (conversation_id, direction, body)
          VALUES (?, ?, ?)
        `).run(
          order.conversationId,
          'system',
          `Pago confirmado. Stock restante de ${order.product.name}: ${order.product.stock - order.quantity}.`
        );
      }

      return {
        event: getPaymentEventById(db, insertedId(eventResult)),
        order: getOrderById(db, order.id)
      };
    });

    res.status(201).json(result);
  }));

  app.post('/orders/:id/delivery', asyncHandler(async (req, res) => {
    const orderId = Number(req.params.id);
    const input = deliverySchema.parse(req.body);
    const order = requireOrder(db, orderId);

    if (order.status !== 'paid') {
      throw new HttpError(400, 'Delivery can only be scheduled for paid orders');
    }

    const mapsUrl = buildMapsUrl(input.latitude, input.longitude);
    const delivery = transaction(db, () => {
      const existing = getDeliveryByOrderId(db, order.id);
      if (existing) {
        db.prepare(`
          UPDATE deliveries
          SET delivery_type = ?, address_text = ?, latitude = ?, longitude = ?,
              maps_url = ?, scheduled_at = ?
          WHERE order_id = ?
        `).run(
          input.deliveryType,
          input.addressText,
          input.latitude,
          input.longitude,
          mapsUrl,
          input.scheduledAt,
          order.id
        );
      } else {
        db.prepare(`
          INSERT INTO deliveries (
            order_id, delivery_type, address_text, latitude, longitude, maps_url, scheduled_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          order.id,
          input.deliveryType,
          input.addressText,
          input.latitude,
          input.longitude,
          mapsUrl,
          input.scheduledAt
        );
      }

      db.prepare('UPDATE conversations SET status = ? WHERE id = ?')
        .run('delivery_scheduled', order.conversationId);
      db.prepare(`
        INSERT INTO messages (conversation_id, direction, body)
        VALUES (?, ?, ?)
      `).run(
        order.conversationId,
        'outbound',
        `Entrega coordinada en ${input.addressText}. Ubicacion: ${mapsUrl}`
      );

      return getDeliveryByOrderId(db, order.id);
    });

    res.status(201).json(delivery);
  }));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', issues: err.issues });
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }

    console.error(err);
    res.status(500).json({ message: 'Unexpected error' });
  });

  return app;
}

type Row = Record<string, unknown>;

function listProducts(db: Database) {
  return (db.prepare('SELECT * FROM products ORDER BY id ASC').all() as Row[]).map((row) => mapProduct(db, row));
}

function getProductById(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Row | undefined;
  return row ? mapProduct(db, row) : null;
}

function getProductBySku(db: Database, sku: string) {
  const row = db.prepare('SELECT * FROM products WHERE sku = ?').get(sku) as Row | undefined;
  return row ? mapProduct(db, row) : null;
}

function requireProduct(db: Database, id: number) {
  const product = getProductById(db, id);
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

function getPricingRule(db: Database, productId: number) {
  const row = db.prepare('SELECT * FROM pricing_rules WHERE product_id = ?').get(productId) as Row | undefined;
  if (!row) return null;
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    maxDiscountPercent: Number(row.max_discount_percent),
    lowRotationDays: Number(row.low_rotation_days),
    lowStockThreshold: Number(row.low_stock_threshold),
    approvalDiscountThreshold: Number(row.approval_discount_threshold),
    offerExpiresInMinutes: Number(row.offer_expires_in_minutes),
    active: Boolean(row.active)
  };
}

function mapProduct(db: Database, row: Row) {
  return {
    id: Number(row.id),
    storeId: Number(row.store_id),
    sku: String(row.sku),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    category: String(row.category),
    basePrice: Number(row.base_price),
    minPrice: Number(row.min_price),
    stock: Number(row.stock),
    status: String(row.status),
    pricingRule: getPricingRule(db, Number(row.id))
  };
}

function ensureDefaultStore(db: Database) {
  const existing = db.prepare('SELECT * FROM stores WHERE name = ?').get('ComercIA Demo Store') as Row | undefined;
  if (existing) return mapStore(existing);

  const result = db.prepare('INSERT INTO stores (name, phone) VALUES (?, ?)')
    .run('ComercIA Demo Store', '+573001112233');
  return mapStore(db.prepare('SELECT * FROM stores WHERE id = ?').get(insertedId(result)) as Row);
}

function mapStore(row: Row) {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    status: String(row.status)
  };
}

function upsertLead(db: Database, storeId: number, name: string, phone: string) {
  const existing = db.prepare('SELECT * FROM leads WHERE store_id = ? AND phone = ?').get(storeId, phone) as Row | undefined;
  if (existing) {
    db.prepare('UPDATE leads SET name = ?, status = ? WHERE id = ?').run(name, 'open', Number(existing.id));
    return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(Number(existing.id)) as Row);
  }

  const result = db.prepare('INSERT INTO leads (store_id, name, phone) VALUES (?, ?, ?)')
    .run(storeId, name, phone);
  return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(insertedId(result)) as Row);
}

function mapLead(row: Row) {
  return {
    id: Number(row.id),
    storeId: Number(row.store_id),
    name: String(row.name),
    phone: String(row.phone),
    status: String(row.status)
  };
}

function findActiveConversation(db: Database, leadId: number, productId: number) {
  return db.prepare(`
    SELECT * FROM conversations
    WHERE lead_id = ? AND product_id = ? AND status IN ('open', 'human_review', 'waiting_payment')
    ORDER BY id DESC
  `).get(leadId, productId) as Row | undefined;
}

function listConversations(db: Database) {
  return (db.prepare('SELECT id FROM conversations ORDER BY last_message_at DESC').all() as Row[])
    .map((row) => getConversationById(db, Number(row.id)))
    .filter(Boolean);
}

function getConversationById(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as Row | undefined;
  if (!row) return null;

  const lead = mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(Number(row.lead_id)) as Row);
  const product = requireProduct(db, Number(row.product_id));
  const messages = (db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC').all(id) as Row[])
    .map(mapMessage);
  const negotiations = (db.prepare('SELECT * FROM negotiations WHERE conversation_id = ? ORDER BY created_at DESC, id DESC').all(id) as Row[])
    .map((negotiationRow) => mapNegotiation(db, negotiationRow));

  return {
    id: Number(row.id),
    status: String(row.status),
    channel: String(row.channel),
    automationPaused: Boolean(row.automation_paused),
    lead,
    product,
    messages,
    negotiations
  };
}

function requireConversation(db: Database, id: number) {
  const conversation = getConversationById(db, id);
  if (!conversation) throw new HttpError(404, 'Conversation not found');
  return conversation;
}

function mapMessage(row: Row) {
  return {
    id: Number(row.id),
    direction: String(row.direction),
    body: String(row.body),
    createdAt: String(row.created_at)
  };
}

function getNegotiationById(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(id) as Row | undefined;
  if (!row) return null;
  return mapNegotiation(db, row);
}

function mapNegotiation(db: Database, row: Row) {
  return {
    id: Number(row.id),
    conversationId: Number(row.conversation_id),
    productId: Number(row.product_id),
    quantity: Number(row.quantity),
    initialPrice: Number(row.initial_price),
    proposedPrice: Number(row.proposed_price),
    minAllowedPrice: Number(row.min_allowed_price),
    discountPercent: Number(row.discount_percent),
    rationale: String(row.rationale),
    status: String(row.status),
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    order: getOrderByNegotiationId(db, Number(row.id))
  };
}

function requireNegotiationWithConversation(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(id) as Row | undefined;
  if (!row) throw new HttpError(404, 'Negotiation not found');

  const conversation = requireConversation(db, Number(row.conversation_id));
  return {
    ...mapNegotiation(db, row),
    lead: conversation.lead,
    product: conversation.product
  };
}

function getOrderByNegotiationId(db: Database, negotiationId: number) {
  const row = db.prepare('SELECT * FROM orders WHERE negotiation_id = ?').get(negotiationId) as Row | undefined;
  return row ? mapOrder(db, row) : null;
}

function getOrderById(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Row | undefined;
  return row ? mapOrder(db, row) : null;
}

function requireOrder(db: Database, id: number) {
  const order = getOrderById(db, id);
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

function mapOrder(db: Database, row: Row) {
  const negotiation = db.prepare('SELECT * FROM negotiations WHERE id = ?').get(Number(row.negotiation_id)) as Row;
  return {
    id: Number(row.id),
    storeId: Number(row.store_id),
    leadId: Number(row.lead_id),
    productId: Number(row.product_id),
    negotiationId: Number(row.negotiation_id),
    conversationId: Number(negotiation.conversation_id),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    status: String(row.status),
    product: requireProduct(db, Number(row.product_id)),
    paymentLink: getPaymentLinkByOrderId(db, Number(row.id)),
    delivery: getDeliveryByOrderId(db, Number(row.id))
  };
}

function getPaymentLinkByOrderId(db: Database, orderId: number) {
  const row = db.prepare('SELECT * FROM payment_links WHERE order_id = ?').get(orderId) as Row | undefined;
  return row ? mapPaymentLink(row) : null;
}

function getPaymentLinkById(db: Database, id: number) {
  return mapPaymentLink(db.prepare('SELECT * FROM payment_links WHERE id = ?').get(id) as Row);
}

function mapPaymentLink(row: Row) {
  return {
    id: Number(row.id),
    orderId: Number(row.order_id),
    provider: String(row.provider),
    externalId: String(row.external_id),
    url: String(row.url),
    status: String(row.status),
    expiresAt: String(row.expires_at)
  };
}

function getPaymentEventById(db: Database, id: number) {
  const row = db.prepare('SELECT * FROM payment_events WHERE id = ?').get(id) as Row;
  return {
    id: Number(row.id),
    externalId: String(row.external_id),
    orderId: Number(row.order_id),
    status: String(row.status)
  };
}

function getDeliveryByOrderId(db: Database, orderId: number) {
  const row = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(orderId) as Row | undefined;
  if (!row) return null;

  return {
    id: Number(row.id),
    orderId: Number(row.order_id),
    deliveryType: String(row.delivery_type),
    addressText: String(row.address_text),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    mapsUrl: String(row.maps_url),
    status: String(row.status),
    scheduledAt: String(row.scheduled_at)
  };
}

function buildSuggestedReply(leadName: string, productName: string, price: number, expiresAt: Date): string {
  return `Hola ${leadName}, tengo disponible ${productName}. Te puedo dejar la unidad en ${formatCurrency(price)} si confirmas antes de ${expiresAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}.`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}
