import type { Pool } from 'pg';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  decideCommercialAction,
  type AiCommercialDecision,
  type AiConversationContext,
  type AiProductContext
} from './ai/commercialAgent.js';
import { config } from './config.js';
import { first, type Queryable, withTransaction } from './db/postgres.js';
import { normalizeText, parseCommercialIntent, type CommercialIntent } from './domain/commercialBot.js';
import { calculateOffer } from './domain/pricingEngine.js';
import { buildMapsUrl } from './domain/maps.js';
import { asyncHandler } from './lib/asyncHandler.js';
import { HttpError } from './lib/httpError.js';
import {
  advisorManualOfferSchema,
  advisorReplySchema,
  advisorTakeoverSchema,
  deliverySchema,
  mockCheckoutConfirmSchema,
  negotiationAcceptSchema,
  paymentWebhookSchema,
  pricingRuleSchema,
  productSchema,
  productUpdateSchema,
  suggestReplySchema,
  whatsappWebhookSchema
} from './lib/schemas.js';
import {
  isMetaWebhookPayload,
  parseMetaWebhook,
  sendWhatsappCtaUrl,
  sendWhatsappList,
  sendWhatsappReplyButtons,
  sendWhatsappText,
  type WhatsappReplyButton
} from './whatsapp/meta.js';

type Row = Record<string, unknown>;
type PgConversation = NonNullable<Awaited<ReturnType<typeof getConversationById>>>;
type PgNegotiation = PgConversation['negotiations'][number];
type PgOrder = NonNullable<PgNegotiation['order']>;
type WhatsappPresentation = 'catalog' | 'auto';

export function createPostgresApp(pool: Pool) {
  const app = express();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'comercia-backend', database: 'postgres' });
  });

  app.get('/products', asyncHandler(async (_req, res) => {
    res.json(await listProducts(pool));
  }));

  app.post('/products', asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    if (input.minPrice > input.basePrice) throw new HttpError(400, 'minPrice cannot be greater than basePrice');

    const product = await withTransaction(pool, async (client) => {
      const store = await ensureDefaultStore(client);
      const created = await client.query<{ id: number }>(
        `
          INSERT INTO products (store_id, sku, name, description, category, base_price, min_price, stock)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `,
        [store.id, input.sku, input.name, input.description ?? null, input.category, input.basePrice, input.minPrice, input.stock]
      );
      const productId = created.rows[0].id;

      await client.query(
        `
          INSERT INTO inventory_movements (product_id, type, quantity, reason)
          VALUES ($1, $2, $3, $4)
        `,
        [productId, 'initial', input.stock, 'Initial stock']
      );

      return getProductById(client, productId);
    });

    res.status(201).json(product);
  }));

  app.put('/products/:id', asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    const input = productUpdateSchema.parse(req.body);
    if (input.minPrice > input.basePrice) throw new HttpError(400, 'minPrice cannot be greater than basePrice');

    await requireProduct(pool, productId);
    const updated = await pool.query<{ id: number }>(
      `
        UPDATE products
        SET name = $1,
            description = $2,
            category = $3,
            base_price = $4,
            min_price = $5,
            status = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING id
      `,
      [
        input.name,
        input.description ?? null,
        input.category,
        input.basePrice,
        input.minPrice,
        input.status,
        productId
      ]
    );

    res.json(await getProductById(pool, first(updated.rows)!.id));
  }));

  app.put('/products/:id/pricing-rule', asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    const input = pricingRuleSchema.parse(req.body);
    await requireProduct(pool, productId);

    const rule = await pool.query(
      `
        INSERT INTO pricing_rules (
          product_id, max_discount_percent, low_rotation_days, low_stock_threshold,
          approval_discount_threshold, offer_expires_in_minutes, active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (product_id) DO UPDATE SET
          max_discount_percent = EXCLUDED.max_discount_percent,
          low_rotation_days = EXCLUDED.low_rotation_days,
          low_stock_threshold = EXCLUDED.low_stock_threshold,
          approval_discount_threshold = EXCLUDED.approval_discount_threshold,
          offer_expires_in_minutes = EXCLUDED.offer_expires_in_minutes,
          active = EXCLUDED.active,
          updated_at = NOW()
        RETURNING *
      `,
      [
        productId,
        input.maxDiscountPercent,
        input.lowRotationDays,
        input.lowStockThreshold,
        input.approvalDiscountThreshold,
        input.offerExpiresInMinutes,
        input.active !== false
      ]
    );

    res.json(mapPricingRule(first(rule.rows)!));
  }));

  app.post('/products/:id/inventory-movements', asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);
    const input = z.object({
      type: z.enum(['restock', 'reservation', 'sale', 'adjustment']),
      quantity: z.number().int(),
      reason: z.string().min(3)
    }).parse(req.body);

    const product = await requireProduct(pool, productId);
    const nextStock = product.stock + input.quantity;
    if (nextStock < 0) throw new HttpError(400, 'Inventory movement would make stock negative');

    const updated = await withTransaction(pool, async (client) => {
      await client.query(
        `
          INSERT INTO inventory_movements (product_id, type, quantity, reason)
          VALUES ($1, $2, $3, $4)
        `,
        [productId, input.type, input.quantity, input.reason]
      );
      await client.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2', [nextStock, productId]);
      return getProductById(client, productId);
    });

    res.json(updated);
  }));

  app.get('/webhooks/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.metaWhatsappVerifyToken && challenge) {
      res.status(200).send(String(challenge));
      return;
    }

    res.sendStatus(403);
  });

  app.post('/webhooks/whatsapp', asyncHandler(async (req, res) => {
    await closeStaleDeliveryConversations(pool);

    if (isMetaWebhookPayload(req.body)) {
      const parsed = parseMetaWebhook(req.body);
      const conversations = [];

      for (const item of parsed) {
        conversations.push(await handleCommercialWhatsappInput(pool, {
          ...item,
          quantity: 1
        }));
      }

      res.status(200).json({ received: conversations.length, conversations });
      return;
    }

    const input = whatsappWebhookSchema.parse(req.body);
    const conversation = await handleCommercialWhatsappInput(pool, input);
    res.status(201).json(conversation);
  }));

  app.get('/conversations', asyncHandler(async (req, res) => {
    await closeStaleDeliveryConversations(pool);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    res.json(await listConversations(pool, status));
  }));

  app.get('/conversations/:id', asyncHandler(async (req, res) => {
    res.json(await requireConversation(pool, Number(req.params.id)));
  }));

  app.get('/dashboard/review-queue', asyncHandler(async (_req, res) => {
    await closeStaleDeliveryConversations(pool);
    res.json(await listConversations(pool, 'human_review'));
  }));

  app.post('/dashboard/conversations/close-stale', asyncHandler(async (_req, res) => {
    const result = await closeStaleDeliveryConversations(pool);
    res.json(result);
  }));

  app.post('/dashboard/conversations/:id/take', asyncHandler(async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = advisorTakeoverSchema.parse(req.body ?? {});
    await requireConversation(pool, conversationId);

    const conversation = await withTransaction(pool, async (client) => {
      await client.query(
        `
          UPDATE conversations
          SET status = $1, automation_paused = TRUE
          WHERE id = $2
        `,
        ['advisor_active', conversationId]
      );
      await client.query(
        `
          INSERT INTO messages (conversation_id, direction, body, metadata)
          VALUES ($1, $2, $3, $4)
        `,
        [
          conversationId,
          'system',
          input.advisorName
            ? `Asesor ${input.advisorName} tomo la conversacion.`
            : 'Un asesor tomo la conversacion.',
          JSON.stringify({
            actor: 'advisor',
            advisorName: input.advisorName ?? null,
            stage: 'advisor_taken'
          })
        ]
      );
      return requireConversation(client, conversationId);
    });

    res.json(conversation);
  }));

  app.post('/dashboard/conversations/:id/reply', asyncHandler(async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = advisorReplySchema.parse(req.body ?? {});
    const conversation = await requireConversation(pool, conversationId);

    if (conversation.status !== 'advisor_active' || !conversation.automationPaused) {
      throw new HttpError(409, 'Conversation must be taken by an advisor before replying from dashboard');
    }

    const updated = await withTransaction(pool, async (client) => {
      await client.query(
        `
          WITH inserted AS (
            INSERT INTO messages (conversation_id, direction, body, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING created_at
          )
          UPDATE conversations
          SET last_message_at = inserted.created_at
          FROM inserted
          WHERE conversations.id = $1
        `,
        [
          conversationId,
          'outbound',
          input.message,
          JSON.stringify({
            actor: 'advisor',
            advisorName: input.advisorName ?? null,
            stage: 'advisor_reply'
          })
        ]
      );
      return requireConversation(client, conversationId);
    });

    await safeSendWhatsapp(conversation.lead.phone, input.message);
    res.status(201).json(updated);
  }));

  app.post('/dashboard/conversations/:id/manual-offer', asyncHandler(async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = advisorManualOfferSchema.parse(req.body ?? {});
    const conversation = await requireConversation(pool, conversationId);

    if (conversation.status !== 'advisor_active' || !conversation.automationPaused) {
      throw new HttpError(409, 'Conversation must be taken by an advisor before creating a manual offer');
    }

    const proposedPrice = roundMoney(conversation.product.basePrice * (1 - input.discountPercent / 100));
    if (proposedPrice < conversation.product.minPrice) {
      throw new HttpError(400, 'Manual offer is below product minPrice');
    }

    if (conversation.product.stock < input.quantity) {
      throw new HttpError(400, 'Not enough stock for this offer');
    }

    const expiresAt = new Date(Date.now() + (conversation.product.pricingRule?.offerExpiresInMinutes ?? 30) * 60 * 1000);
    const body = `Hola ${conversation.lead.name}, soy ${input.advisorName || 'tu asesor de ComercIA'}. Te puedo dejar ${conversation.product.name} en ${formatCurrency(proposedPrice)} por unidad con ${input.discountPercent}% de descuento. Si estas de acuerdo, confirmo la orden.`;

    const result = await withTransaction(pool, async (client) => {
      const created = await client.query<{ id: number }>(
        `
          INSERT INTO negotiations (
            conversation_id, product_id, quantity, initial_price, proposed_price, min_allowed_price,
            discount_percent, rationale, status, expires_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `,
        [
          conversationId,
          conversation.product.id,
          input.quantity,
          conversation.product.basePrice,
          proposedPrice,
          conversation.product.minPrice,
          input.discountPercent,
          `oferta manual asesor${input.advisorName ? `: ${input.advisorName}` : ''}`,
          'proposed',
          expiresAt.toISOString()
        ]
      );
      const negotiationId = created.rows[0].id;

      await client.query(
        `
          WITH inserted AS (
            INSERT INTO messages (conversation_id, direction, body, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING created_at
          )
          UPDATE conversations
          SET last_message_at = inserted.created_at
          FROM inserted
          WHERE conversations.id = $1
        `,
        [
          conversationId,
          'outbound',
          body,
          JSON.stringify({
            negotiationId,
            actor: 'advisor',
            advisorName: input.advisorName ?? null,
            stage: 'manual_offer'
          })
        ]
      );

      return {
        conversation: await requireConversation(client, conversationId),
        negotiation: await getNegotiationById(client, negotiationId),
        reply: body
      };
    });

    await safeSendWhatsapp(conversation.lead.phone, body);
    res.status(201).json(result);
  }));

  app.post('/conversations/:id/suggest-reply', asyncHandler(async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = suggestReplySchema.parse(req.body);
    const conversation = await requireConversation(pool, conversationId);

    if (!conversation.product.pricingRule?.active) throw new HttpError(400, 'Product has no active pricing rule');

    const sales = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM inventory_movements WHERE product_id = $1 AND type = 'sale'`,
      [conversation.product.id]
    );

    const offer = calculateOffer({
      basePrice: conversation.product.basePrice,
      minPrice: conversation.product.minPrice,
      stock: conversation.product.stock,
      recentSalesCount: Number(sales.rows[0].count),
      rule: conversation.product.pricingRule,
      requestedDiscountPercent: input.requestedDiscountPercent
    });

    const reply = buildSuggestedReply(conversation.lead.name, conversation.product.name, offer.proposedPrice, offer.expiresAt);
    const negotiation = await withTransaction(pool, async (client) => {
      const created = await client.query<{ id: number }>(
        `
          INSERT INTO negotiations (
            conversation_id, product_id, quantity, initial_price, proposed_price, min_allowed_price,
            discount_percent, rationale, status, expires_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `,
        [
          conversationId,
          conversation.product.id,
          input.quantity,
          offer.initialPrice,
          offer.proposedPrice,
          offer.minAllowedPrice,
          offer.discountPercent,
          offer.rationale,
          offer.requiresApproval ? 'human_review' : 'proposed',
          offer.expiresAt.toISOString()
        ]
      );
      const negotiationId = created.rows[0].id;

      await client.query(
        `
          UPDATE conversations
          SET status = $1, automation_paused = $2
          WHERE id = $3
        `,
        [offer.requiresApproval ? 'human_review' : 'open', offer.requiresApproval, conversationId]
      );
      await client.query(
        `
          INSERT INTO messages (conversation_id, direction, body, metadata)
          VALUES ($1, $2, $3, $4)
        `,
        [
          conversationId,
          'system',
          `Oferta sugerida: ${reply}`,
          JSON.stringify({
            negotiationId,
            actor: 'gpt',
            approvalRequired: offer.requiresApproval,
            stage: offer.requiresApproval ? 'advisor_required' : 'offer_suggested'
          })
        ]
      );

      return getNegotiationById(client, negotiationId);
    });

    res.status(201).json({ negotiation, reply });
  }));

  app.post('/negotiations/:id/accept', asyncHandler(async (req, res) => {
    const negotiation = await requireNegotiationWithConversation(pool, Number(req.params.id));
    const input = negotiationAcceptSchema.parse(req.body ?? {});

    if (negotiation.status === 'human_review') {
      const conversation = await requireConversation(pool, negotiation.conversationId);
      if (input.actor !== 'advisor' || conversation.status !== 'advisor_active') {
        throw new HttpError(409, 'Negotiation requires advisor takeover from the dashboard before acceptance');
      }
    }

    if (new Date(negotiation.expiresAt) < new Date()) throw new HttpError(400, 'Negotiation has expired');
    if (negotiation.product.stock < negotiation.quantity) throw new HttpError(400, 'Not enough stock for this order');

    const order = await withTransaction(pool, async (client) => {
      await client.query('UPDATE negotiations SET status = $1 WHERE id = $2', ['accepted', negotiation.id]);

      const existing = await getOrderByNegotiationId(client, negotiation.id);
      if (existing) return existing;

      const created = await client.query<{ id: number }>(
        `
          INSERT INTO orders (store_id, lead_id, product_id, negotiation_id, quantity, unit_price, total_amount)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [
          negotiation.lead.storeId,
          negotiation.lead.id,
          negotiation.product.id,
          negotiation.id,
          negotiation.quantity,
          negotiation.proposedPrice,
          negotiation.proposedPrice * negotiation.quantity
        ]
      );
      const orderId = created.rows[0].id;
      const body = `Perfecto, ${negotiation.lead.name}. Te separo ${negotiation.quantity} unidad(es) de ${negotiation.product.name} por ${formatCurrency(negotiation.proposedPrice * negotiation.quantity)}.`;

      await client.query(
        'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
        ['waiting_payment', negotiation.conversationId]
      );
      await client.query(
        `INSERT INTO messages (conversation_id, direction, body) VALUES ($1, $2, $3)`,
        [negotiation.conversationId, 'outbound', body]
      );
      if (input.actor === 'advisor') {
        await client.query(
          `
            INSERT INTO messages (conversation_id, direction, body, metadata)
            VALUES ($1, $2, $3, $4)
          `,
          [
            negotiation.conversationId,
            'system',
            input.advisorName
              ? `Orden creada por asesor ${input.advisorName}.`
              : 'Orden creada por asesor.',
            JSON.stringify({
              actor: 'advisor',
              advisorName: input.advisorName ?? null,
              stage: 'order_created'
            })
          ]
        );
      }
      await safeSendWhatsapp(negotiation.lead.phone, body);

      return getOrderById(client, orderId);
    });

    res.status(201).json(order);
  }));

  app.post('/orders/:id/payment-link', asyncHandler(async (req, res) => {
    const order = await requireOrder(pool, Number(req.params.id));
    if (order.status !== 'pending_payment') throw new HttpError(400, 'Payment link can only be generated for pending orders');
    if (order.paymentLink) {
      res.json(order.paymentLink);
      return;
    }

    const paymentLink = await withTransaction(pool, async (client) => {
      const externalId = `pay_${order.id}_${Date.now()}`;
      const url = `${config.paymentBaseUrl}/${externalId}`;
      const created = await client.query<{ id: number }>(
        `
          INSERT INTO payment_links (order_id, external_id, url, expires_at)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [order.id, externalId, url, new Date(Date.now() + 30 * 60 * 1000).toISOString()]
      );
      const body = `Link de pago: ${url}`;
      await client.query(
        `INSERT INTO messages (conversation_id, direction, body) VALUES ($1, $2, $3)`,
        [order.conversationId, 'outbound', body]
      );
      await safeSendWhatsapp(order.lead.phone, body);
      return getPaymentLinkById(client, created.rows[0].id);
    });

    res.status(201).json(paymentLink);
  }));

  app.get('/payments/:externalId', asyncHandler(async (req, res) => {
    res.json(await requirePaymentCheckout(pool, req.params.externalId));
  }));

  app.post('/payments/:externalId/confirm', asyncHandler(async (req, res) => {
    const input = mockCheckoutConfirmSchema.parse(req.body ?? {});
    const checkout = await requirePaymentCheckout(pool, req.params.externalId);

    if (checkout.payment.status === 'failed') throw new HttpError(400, 'Payment link is marked as failed');
    if (!checkout.canPay && checkout.order.status !== 'paid') {
      throw new HttpError(400, 'Payment link is not payable');
    }

    if (checkout.order.status === 'paid') {
      res.json({
        checkout: await requirePaymentCheckout(pool, req.params.externalId),
        alreadyPaid: true,
        whatsappSent: false
      });
      return;
    }

    const order = await confirmOrderPayment(pool, checkout.order.id, req.params.externalId, 'mock_checkout', input.payerName);
    await sendPaymentConfirmedWhatsapp(pool, order);

    res.status(201).json({
      checkout: await requirePaymentCheckout(pool, req.params.externalId),
      alreadyPaid: false,
      whatsappSent: true
    });
  }));

  app.post('/webhooks/payments', asyncHandler(async (req, res) => {
    const input = paymentWebhookSchema.parse(req.body);
    const existing = await pool.query(`SELECT * FROM payment_events WHERE external_id = $1`, [input.externalId]);
    if (existing.rowCount) {
      res.json({ duplicate: true, event: existing.rows[0] });
      return;
    }

    const order = await requireOrder(pool, input.orderId);
    if (!order.paymentLink || order.paymentLink.externalId !== input.externalId) {
      throw new HttpError(400, 'Payment externalId does not match order payment link');
    }

    const result = await withTransaction(pool, async (client) => {
      const event = await client.query<{ id: number }>(
        `
          INSERT INTO payment_events (external_id, order_id, status, payload)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [input.externalId, input.orderId, input.status, JSON.stringify(input)]
      );

      if (input.status === 'failed') {
        await client.query('UPDATE payment_links SET status = $1 WHERE order_id = $2', ['failed', order.id]);
        return { event: await getPaymentEventById(client, event.rows[0].id), order };
      }

      if (order.status !== 'paid') {
        if (order.product.stock < order.quantity) throw new HttpError(400, 'Not enough stock to confirm payment');

        await client.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2', [
          order.product.stock - order.quantity,
          order.product.id
        ]);
        await client.query(
          `
            INSERT INTO inventory_movements (product_id, type, quantity, reason, reference_id)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [order.product.id, 'sale', -order.quantity, 'Payment confirmed', String(order.id)]
        );
        await client.query('UPDATE payment_links SET status = $1 WHERE order_id = $2', ['paid', order.id]);
        await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['paid', order.id]);
        await client.query(
          'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
          ['paid', order.conversationId]
        );
        await client.query(
          `INSERT INTO messages (conversation_id, direction, body) VALUES ($1, $2, $3)`,
          [order.conversationId, 'system', `Pago confirmado. Stock restante de ${order.product.name}: ${order.product.stock - order.quantity}.`]
        );
      }

      return {
        event: await getPaymentEventById(client, event.rows[0].id),
        order: await requireOrder(client, order.id)
      };
    });

    if (input.status === 'paid' && order.status !== 'paid') {
      await sendPaymentConfirmedWhatsapp(pool, result.order);
    }

    res.status(201).json(result);
  }));

  app.post('/orders/:id/delivery', asyncHandler(async (req, res) => {
    const input = deliverySchema.parse(req.body);
    const order = await requireOrder(pool, Number(req.params.id));
    if (order.status !== 'paid') throw new HttpError(400, 'Delivery can only be scheduled for paid orders');

    const delivery = await withTransaction(pool, async (client) => {
      const mapsUrl = buildMapsUrl(input.latitude, input.longitude);
      const upserted = await client.query<{ id: number }>(
        `
          INSERT INTO deliveries (order_id, delivery_type, address_text, latitude, longitude, maps_url, scheduled_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (order_id) DO UPDATE SET
            delivery_type = EXCLUDED.delivery_type,
            address_text = EXCLUDED.address_text,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            maps_url = EXCLUDED.maps_url,
            scheduled_at = EXCLUDED.scheduled_at
          RETURNING id
        `,
        [order.id, input.deliveryType, input.addressText, input.latitude, input.longitude, mapsUrl, input.scheduledAt]
      );

      const body = buildDeliveryScheduledReply(order.id, input.addressText, mapsUrl);
      await client.query(
        'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
        ['delivery_scheduled', order.conversationId]
      );
      await client.query(
        `
          WITH inserted AS (
            INSERT INTO messages (conversation_id, direction, body)
            VALUES ($1, $2, $3)
            RETURNING created_at
          )
          UPDATE conversations
          SET last_message_at = inserted.created_at
          FROM inserted
          WHERE conversations.id = $1
        `,
        [order.conversationId, 'outbound', body]
      );
      await safeSendWhatsapp(order.lead.phone, body);
      return getDeliveryById(client, upserted.rows[0].id);
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

async function receiveWhatsappLead(db: Queryable, input: {
  name: string;
  phone: string;
  productSku?: string;
  message: string;
  quantity?: number;
  requestedDiscountPercent?: number;
}) {
  return withTransaction(db as Pool, async (client) => {
    const product = await resolveWhatsappProduct(client, input);
    const lead = product
      ? await upsertLead(client, product.storeId, input.name, input.phone)
      : await resolveLeadWithoutProduct(client, input.name, input.phone);
    const intent = parseCommercialIntent(input.message);
    const active = product
      ? await findActiveConversationForLeadProduct(
        client,
        lead.id,
        product.id,
        shouldIncludeScheduledDeliveryConversation(intent)
      )
      : await findActiveConversationForLead(client, lead.id, shouldIncludeScheduledDeliveryConversation(intent));

    if (!product && !active.rows[0]?.id) return null;

    const conversationId = active.rows[0]?.id
      ? Number(active.rows[0].id)
      : Number((await client.query<{ id: number }>(
        `INSERT INTO conversations (lead_id, product_id, channel) VALUES ($1, $2, $3) RETURNING id`,
        [lead.id, product!.id, 'whatsapp']
      )).rows[0].id);

    const message = await client.query<{ created_at: string }>(
      `
        INSERT INTO messages (conversation_id, direction, body, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING created_at
      `,
      [
        conversationId,
        'inbound',
        input.message,
        JSON.stringify({
          productSku: product?.sku ?? input.productSku ?? null,
          quantity: input.quantity || 1,
          requestedDiscountPercent: input.requestedDiscountPercent ?? null
        })
      ]
    );

    await client.query('UPDATE conversations SET last_message_at = $1 WHERE id = $2', [
      message.rows[0].created_at,
      conversationId
    ]);

    return getConversationById(client, conversationId);
  });
}

async function handleCommercialWhatsappInput(pool: Pool, input: {
  name: string;
  phone: string;
  productSku?: string;
  message: string;
  quantity?: number;
  requestedDiscountPercent?: number;
}) {
  const conversation = await receiveWhatsappLead(pool, input);
  if (!conversation) {
    return handleWhatsappWithoutProduct(pool, input);
  }

  const handledConversationId = await runCommercialBot(pool, conversation.id, {
    message: input.message,
    quantity: input.quantity,
    requestedDiscountPercent: input.requestedDiscountPercent
  });

  return requireConversation(pool, handledConversationId);
}

async function handleWhatsappWithoutProduct(pool: Pool, input: {
  name: string;
  phone: string;
  message: string;
}) {
  const intent = parseCommercialIntent(input.message);
  let reply: string;
  let presentation: WhatsappPresentation = 'auto';

  if (intent.type === 'accept') {
    reply = 'Todavia no tengo una oferta activa para aceptar. Elige un producto del catalogo o dime cual quieres comprar.';
    presentation = 'catalog';
  } else if (intent.type === 'close') {
    reply = 'Listo, cierro este chat por ahora. Cuando necesites algo mas, escribeme CATALOGO o dime que producto buscas.';
  } else if (intent.type === 'payment_confirmed') {
    reply = 'Todavia no tengo una orden activa para confirmar pago. Elige un producto del catalogo o dime cual quieres comprar.';
    presentation = 'catalog';
  } else if (intent.type === 'delivery') {
    reply = 'Todavia no tengo una compra activa para entrega. Primero elige un producto del catalogo.';
    presentation = 'catalog';
  } else {
    reply = await buildCatalogReply(pool);
    presentation = 'catalog';
  }

  await safeSendCommercialWhatsapp(pool, input.phone, reply, presentation);

  return {
    status: 'product_required',
    productSku: null,
    reply
  };
}

async function runCommercialBot(pool: Pool, conversationId: number, input: {
  message: string;
  quantity?: number;
  requestedDiscountPercent?: number;
}) {
  const conversation = await requireConversation(pool, conversationId);
  if (shouldSkipAutomation(conversation)) {
    console.info('WhatsApp automation skipped for paused conversation', {
      conversationId: conversation.id,
      status: conversation.status,
      automationPaused: conversation.automationPaused,
      phone: maskPhone(conversation.lead.phone)
    });
    return conversation.id;
  }

  const intent = parseCommercialIntent(input.message);
  const quantity = getIntentQuantity(intent, input.quantity);
  const requestedDiscountPercent = getIntentDiscount(intent, input.requestedDiscountPercent);
  const { latestNegotiation, latestOrder } = selectConversationCommerceState(conversation);

  if (intent.type === 'close') {
    await closeConversationWithReply(pool, conversation, buildConversationClosedReply(conversation.lead.name));
    return conversation.id;
  }

  if (shouldHandleWithoutAi(intent)) {
    let reply: string;

    if (intent.type === 'payment_confirmed') {
      reply = await handlePaymentConfirmation(pool, conversation, latestOrder);
    } else if (intent.type === 'delivery') {
      reply = await handleDeliveryRequest(pool, conversation, latestOrder, intent);
    } else {
      reply = await handleOfferAcceptance(pool, conversation, latestNegotiation, latestOrder, quantity);
    }

    await appendOutboundMessage(pool, conversation.id, reply);
    await safeSendCommercialWhatsapp(pool, conversation.lead.phone, reply, 'auto');
    return conversation.id;
  }

  const aiDecision = await resolveAiDecision(pool, conversation, input.message);
  if (aiDecision) {
    const targetConversation = await resolveTargetConversation(pool, conversation, aiDecision, input.message);
    const reply = await executeAiCommercialDecision(pool, targetConversation, aiDecision, input);
    await appendOutboundMessage(pool, targetConversation.id, reply);
    await safeSendCommercialWhatsapp(
      pool,
      targetConversation.lead.phone,
      reply,
      aiDecision.action === 'show_catalog' ? 'catalog' : 'auto'
    );
    return targetConversation.id;
  }

  let reply: string;

  if (intent.type === 'catalog') {
    reply = await buildCatalogReply(pool);
    await appendOutboundMessage(pool, conversation.id, reply);
    await safeSendCommercialWhatsapp(pool, conversation.lead.phone, reply, 'catalog');
    return conversation.id;
  } else if (intent.type === 'inventory') {
    reply = await buildInventoryReply(pool, conversation.product.sku);
  } else if (intent.type === 'purchase') {
    reply = await handlePurchaseIntent(pool, conversation, quantity, requestedDiscountPercent);
  } else if (intent.type === 'handoff') {
    reply = await handleHumanHandoff(pool, conversation);
  } else {
    reply = buildHelpReply(conversation.lead.name);
  }

  await appendOutboundMessage(pool, conversation.id, reply);
  await safeSendCommercialWhatsapp(pool, conversation.lead.phone, reply, 'auto');
  return conversation.id;
}

async function resolveAiDecision(pool: Pool, conversation: PgConversation, incomingMessage: string) {
  try {
    const products = await listProducts(pool);
    return await decideCommercialAction({
      incomingMessage,
      conversation: toAiConversationContext(conversation),
      products: products.map(toAiProductContext)
    });
  } catch (error) {
    console.error('OpenAI commercial decision failed, using deterministic fallback', error);
    return null;
  }
}

async function executeAiCommercialDecision(
  pool: Pool,
  conversation: PgConversation,
  decision: AiCommercialDecision,
  fallback: {
    quantity?: number;
    requestedDiscountPercent?: number;
  }
) {
  const quantity = decision.quantity || fallback.quantity || 1;
  const requestedDiscountPercent = decision.requestedDiscountPercent ?? fallback.requestedDiscountPercent;
  const { latestNegotiation, latestOrder } = selectConversationCommerceState(conversation);

  if (decision.action === 'show_catalog') {
    return buildCatalogReply(pool);
  }

  if (decision.action === 'show_inventory') {
    return buildInventoryReply(pool, decision.productSku || conversation.product.sku);
  }

  if (decision.action === 'propose_offer') {
    return handlePurchaseIntent(pool, conversation, quantity, requestedDiscountPercent ?? undefined);
  }

  if (decision.action === 'accept_offer') {
    return handleOfferAcceptance(pool, conversation, latestNegotiation, latestOrder, quantity);
  }

  if (decision.action === 'confirm_payment') {
    return handlePaymentConfirmation(pool, conversation, latestOrder);
  }

  if (decision.action === 'schedule_delivery') {
    return handleDeliveryRequest(pool, conversation, latestOrder, {
      type: 'delivery',
      addressText: decision.addressText || undefined
    });
  }

  if (decision.action === 'handoff') {
    await pool.query('UPDATE conversations SET automation_paused = TRUE, status = $1 WHERE id = $2', [
      'human_review',
      conversation.id
    ]);
    return decision.customerReply || 'Te paso con una persona del equipo comercial para revisar tu caso.';
  }

  return decision.customerReply || buildHelpReply(conversation.lead.name);
}

async function resolveTargetConversation(
  pool: Pool,
  conversation: PgConversation,
  decision: AiCommercialDecision,
  incomingMessage: string
) {
  if (!decision.productSku || decision.productSku === conversation.product.sku) return conversation;

  const product = await getProductBySku(pool, decision.productSku);
  if (!product) return conversation;

  return withTransaction(pool, async (client) => {
    const lead = await upsertLead(client, product.storeId, conversation.lead.name, conversation.lead.phone);
    const active = await findActiveConversationForLeadProduct(
      client,
      lead.id,
      product.id,
      decision.action === 'schedule_delivery'
    );
    const targetConversationId = active.rows[0]?.id
      ? Number(active.rows[0].id)
      : Number((await client.query<{ id: number }>(
        `INSERT INTO conversations (lead_id, product_id, channel) VALUES ($1, $2, $3) RETURNING id`,
        [lead.id, product.id, 'whatsapp']
      )).rows[0].id);

    if (targetConversationId !== conversation.id) {
      const message = await client.query<{ created_at: string }>(
        `
          INSERT INTO messages (conversation_id, direction, body, metadata)
          VALUES ($1, $2, $3, $4)
          RETURNING created_at
        `,
        [
          targetConversationId,
          'inbound',
          incomingMessage,
          JSON.stringify({
            sourceConversationId: conversation.id,
            routedBy: 'openai_product_selection',
            productSku: decision.productSku
          })
        ]
      );

      await client.query('UPDATE conversations SET last_message_at = $1 WHERE id = $2', [
        message.rows[0].created_at,
        targetConversationId
      ]);
    }

    return requireConversation(client, targetConversationId);
  });
}

function toAiConversationContext(conversation: PgConversation): AiConversationContext {
  const { latestNegotiation, latestOrder } = selectConversationCommerceState(conversation);

  return {
    id: conversation.id,
    status: conversation.status,
    leadName: conversation.lead.name,
    leadPhone: conversation.lead.phone,
    currentProductSku: conversation.product.sku,
    currentProductName: conversation.product.name,
    latestNegotiation: latestNegotiation
      ? {
        id: latestNegotiation.id,
        status: latestNegotiation.status,
        quantity: latestNegotiation.quantity,
        proposedPrice: latestNegotiation.proposedPrice,
        discountPercent: latestNegotiation.discountPercent
      }
      : null,
    latestOrder: latestOrder
      ? {
        id: latestOrder.id,
        status: latestOrder.status,
        totalAmount: latestOrder.totalAmount,
        hasPaymentLink: Boolean(latestOrder.paymentLink),
        hasDelivery: Boolean(latestOrder.delivery)
      }
      : null,
    recentMessages: conversation.messages.slice(-8).map((message) => ({
      direction: message.direction,
      body: message.body
    }))
  };
}

function toAiProductContext(product: Awaited<ReturnType<typeof listProducts>>[number]): AiProductContext {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    basePrice: product.basePrice,
    minPrice: product.minPrice,
    stock: product.stock,
    maxDiscountPercent: product.pricingRule?.maxDiscountPercent ?? 0,
    approvalDiscountThreshold: product.pricingRule?.approvalDiscountThreshold ?? 0
  };
}

async function resolveWhatsappProduct(db: Queryable, input: {
  productSku?: string;
  message: string;
}) {
  const explicitSku = input.productSku?.trim();
  if (explicitSku) {
    const product = await getProductBySku(db, explicitSku.toUpperCase());
    if (!product) throw new HttpError(404, `Product ${explicitSku} not found`);
    return product;
  }

  return findProductMentionedInMessage(db, input.message);
}

async function findProductMentionedInMessage(db: Queryable, message: string) {
  const products = await listProducts(db);
  const text = normalizeText(message);
  const scored = products
    .map((product) => ({
      product,
      score: scoreProductMention(text, product)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (!scored.length) return null;
  if (scored[1] && scored[0].score === scored[1].score) return null;

  return scored[0].product;
}

function scoreProductMention(
  normalizedMessage: string,
  product: Awaited<ReturnType<typeof listProducts>>[number]
) {
  const sku = normalizeText(product.sku);
  if (normalizedMessage.includes(sku)) return 100;

  const name = normalizeText(product.name);
  if (normalizedMessage.includes(name)) return 90;

  const tokens = name
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
  const hits = tokens.filter((token) => normalizedMessage.includes(token)).length;

  if (hits >= Math.min(2, tokens.length)) return hits;
  return hits === 1 && tokens.length <= 2 ? 1 : 0;
}

async function resolveLeadWithoutProduct(db: Queryable, name: string, phone: string) {
  const existing = await findLeadByPhone(db, phone);
  if (existing) return upsertLead(db, existing.storeId, name, phone);

  const store = await ensureDefaultStore(db);
  return upsertLead(db, store.id, name, phone);
}

function shouldHandleWithoutAi(
  intent: CommercialIntent
): intent is Extract<CommercialIntent, { type: 'accept' | 'payment_confirmed' | 'delivery' }> {
  return ['accept', 'payment_confirmed', 'delivery'].includes(intent.type);
}

function shouldSkipAutomation(conversation: PgConversation) {
  return ['human_review', 'advisor_active'].includes(conversation.status);
}

function shouldIncludeScheduledDeliveryConversation(intent: CommercialIntent) {
  return ['catalog', 'close', 'delivery', 'help', 'unknown'].includes(intent.type);
}

function selectConversationCommerceState(conversation: PgConversation): {
  latestNegotiation?: PgNegotiation;
  latestOrder?: PgOrder;
} {
  const pendingPayment = conversation.negotiations.find((negotiation) =>
    negotiation.order?.status === 'pending_payment'
  );
  if (pendingPayment?.order) {
    return { latestNegotiation: pendingPayment, latestOrder: pendingPayment.order };
  }

  const paidWithoutDelivery = conversation.negotiations.find((negotiation) =>
    negotiation.order?.status === 'paid' && !negotiation.order.delivery
  );
  if (paidWithoutDelivery?.order) {
    return { latestNegotiation: paidWithoutDelivery, latestOrder: paidWithoutDelivery.order };
  }

  const activeNegotiation = conversation.negotiations.find((negotiation) =>
    ['proposed', 'human_review'].includes(negotiation.status)
  );
  if (activeNegotiation) {
    return {
      latestNegotiation: activeNegotiation,
      latestOrder: activeNegotiation.order ?? undefined
    };
  }

  const latestNegotiation = conversation.negotiations[0];
  return {
    latestNegotiation,
    latestOrder: latestNegotiation?.order ?? undefined
  };
}

async function buildExistingOrderReply(pool: Pool, conversation: PgConversation, order: PgOrder) {
  if (order.status === 'paid') {
    return order.delivery
      ? buildDeliveryScheduledReply(order.id, order.delivery.addressText, order.delivery.mapsUrl)
      : `Tu orden #${order.id} ya esta pagada. Enviame la direccion de entrega para coordinar el despacho.`;
  }

  if (order.status === 'pending_payment') {
    const paymentLink = order.paymentLink ?? await createPaymentLinkForOrder(pool, order.id);
    return `Ya tienes una orden activa por ${formatCurrency(order.totalAmount)}. Puedes pagar aqui: ${paymentLink.url}`;
  }

  return `Tu orden #${order.id} esta en estado ${order.status}.`;
}

function buildDeliveryScheduledReply(orderId: number, addressText: string, mapsUrl: string) {
  return [
    `Entrega programada para la orden #${orderId} en ${addressText}. Ubicacion: ${mapsUrl}`,
    'Necesitas algo mas o deseas comprar otro producto? Responde CATALOGO para ver opciones o NO GRACIAS para cerrar el chat.'
  ].join('\n\n');
}

function buildConversationClosedReply(leadName: string) {
  return `Gracias, ${leadName}. Cierro este chat por ahora. Cuando quieras comprar algo mas, escribeme CATALOGO o dime el producto que buscas.`;
}

async function closeConversationWithReply(pool: Pool, conversation: PgConversation, body: string) {
  const updated = await withTransaction(pool, async (client) => {
    await client.query(
      `
        WITH inserted AS (
          INSERT INTO messages (conversation_id, direction, body, metadata)
          VALUES ($1, $2, $3, $4)
          RETURNING created_at
        )
        UPDATE conversations
        SET status = $5,
            automation_paused = FALSE,
            last_message_at = inserted.created_at
        FROM inserted
        WHERE conversations.id = $1
      `,
      [
        conversation.id,
        'outbound',
        body,
        JSON.stringify({ bot: true, stage: 'conversation_closed' }),
        'closed'
      ]
    );
    return requireConversation(client, conversation.id);
  });

  await safeSendWhatsapp(conversation.lead.phone, body);
  return updated;
}

async function closeStaleDeliveryConversations(pool: Pool) {
  const closeAfterMinutes = Math.max(1, Math.floor(config.conversationCloseAfterMinutes || 60));
  const stale = await pool.query<Row>(
    `
      SELECT id
      FROM conversations
      WHERE status = $1
        AND automation_paused = FALSE
        AND last_message_at <= NOW() - ($2::int * INTERVAL '1 minute')
      ORDER BY last_message_at ASC
      LIMIT 50
    `,
    ['delivery_scheduled', closeAfterMinutes]
  );

  for (const row of stale.rows) {
    await withTransaction(pool, async (client) => {
      await client.query(
        `
          WITH inserted AS (
            INSERT INTO messages (conversation_id, direction, body, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING created_at
          )
          UPDATE conversations
          SET status = $5,
              automation_paused = FALSE,
              last_message_at = inserted.created_at
          FROM inserted
          WHERE conversations.id = $1
        `,
        [
          Number(row.id),
          'system',
          `Chat finalizado automaticamente por inactividad despues de ${closeAfterMinutes} minutos sin respuesta al cierre de entrega.`,
          JSON.stringify({ stage: 'auto_closed', closeAfterMinutes }),
          'closed'
        ]
      );
    });
  }

  return { closed: stale.rows.length, closeAfterMinutes };
}

async function handlePurchaseIntent(
  pool: Pool,
  conversation: PgConversation,
  quantity: number,
  requestedDiscountPercent?: number
) {
  const { latestOrder } = selectConversationCommerceState(conversation);
  if (latestOrder) {
    return buildExistingOrderReply(pool, conversation, latestOrder);
  }

  if (conversation.product.stock < quantity) {
    return `Por ahora tengo ${conversation.product.stock} unidad(es) de ${conversation.product.name}. Puedo mostrarte otras opciones si respondes CATALOGO.`;
  }

  const activeNegotiation = conversation.negotiations.find((negotiation) =>
    ['proposed', 'human_review'].includes(negotiation.status)
  );

  if (activeNegotiation) {
    if (activeNegotiation.status === 'human_review') {
      await pool.query('UPDATE conversations SET status = $1, automation_paused = TRUE WHERE id = $2', [
        'human_review',
        conversation.id
      ]);
      return `La oferta de ${formatCurrency(activeNegotiation.proposedPrice)} requiere revision de un asesor. Ya deje la conversacion marcada para el dashboard.`;
    }

    return `Ya tengo una oferta activa para ${conversation.product.name}: ${formatCurrency(activeNegotiation.proposedPrice)} por unidad. Responde ACEPTO para crear la orden o CATALOGO para ver mas productos.`;
  }

  const { negotiation, reply } = await createSuggestedOffer(pool, conversation.id, {
    requestedDiscountPercent,
    quantity
  });

  if (negotiation.status === 'human_review') {
    return `${reply}\n\nEse descuento requiere revision humana. Ya deje la conversacion marcada para seguimiento comercial.`;
  }

  return `${reply}\n\nTengo ${conversation.product.stock} unidad(es) disponibles. Responde ACEPTO para crear la orden y enviarte el link de pago.`;
}

async function handleOfferAcceptance(
  pool: Pool,
  conversation: PgConversation,
  latestNegotiation: PgNegotiation | undefined,
  latestOrder: PgOrder | undefined,
  quantity: number
) {
  if (latestOrder) {
    return buildExistingOrderReply(pool, conversation, latestOrder);
  }

  let negotiation = latestNegotiation;
  if (!negotiation) {
    const created = await createSuggestedOffer(pool, conversation.id, { quantity });
    negotiation = created.negotiation;
  }

  if (negotiation.status === 'human_review') {
    await pool.query('UPDATE conversations SET status = $1, automation_paused = TRUE WHERE id = $2', [
      'human_review',
      conversation.id
    ]);
    return `La oferta de ${formatCurrency(negotiation.proposedPrice)} requiere aprobacion humana antes de crear la orden. Ya deje la conversacion en revision.`;
  }

  const order = await acceptNegotiationForOrder(pool, negotiation.id);
  if (!order) throw new HttpError(500, 'Order could not be created');
  const paymentLink = await createPaymentLinkForOrder(pool, order.id);

  return `Orden creada, ${conversation.lead.name}. Total: ${formatCurrency(order.totalAmount)}.\nPaga aqui: ${paymentLink.url}\nCuando pagues, responde PAGADO para simular la confirmacion en sandbox.`;
}

async function handlePaymentConfirmation(
  pool: Pool,
  conversation: PgConversation,
  latestOrder: PgOrder | undefined
) {
  if (!latestOrder) {
    return 'Todavia no tengo una orden activa para confirmar pago. Responde CATALOGO o dime que producto quieres comprar.';
  }

  if (latestOrder.status === 'paid') {
    return latestOrder.delivery
      ? buildDeliveryScheduledReply(latestOrder.id, latestOrder.delivery.addressText, latestOrder.delivery.mapsUrl)
      : 'Tu pago ya esta confirmado. Enviame la direccion de entrega para coordinar el despacho.';
  }

  if (!latestOrder.paymentLink) {
    const paymentLink = await createPaymentLinkForOrder(pool, latestOrder.id);
    return `Aun no habia link de pago. Te lo dejo aqui: ${paymentLink.url}`;
  }

  const paidOrder = await confirmOrderPayment(pool, latestOrder.id, latestOrder.paymentLink.externalId);
  if (!paidOrder) throw new HttpError(500, 'Order payment could not be confirmed');
  return `Pago confirmado para la orden #${paidOrder.id}. Stock actualizado. Enviame la direccion de entrega para coordinar el despacho.`;
}

async function handleDeliveryRequest(
  pool: Pool,
  conversation: PgConversation,
  latestOrder: PgOrder | undefined,
  intent: Extract<CommercialIntent, { type: 'delivery' }>
) {
  if (!latestOrder) {
    return 'Todavia no tengo una compra activa para entrega. Primero dime que producto quieres comprar.';
  }

  if (latestOrder.delivery) {
    return buildDeliveryScheduledReply(latestOrder.id, latestOrder.delivery.addressText, latestOrder.delivery.mapsUrl);
  }

  if (latestOrder.status !== 'paid') {
    return `Tu orden #${latestOrder.id} aun esta en estado ${latestOrder.status}. Primero confirma el pago para programar entrega.`;
  }

  if (!intent.addressText) {
    return `Pago confirmado, ${conversation.lead.name}. Enviame la direccion en este formato: Entrega en Calle 123 #45-67, Bogota.`;
  }

  const delivery = await scheduleOrderDelivery(pool, latestOrder.id, {
    deliveryType: 'home',
    addressText: intent.addressText,
    latitude: 4.6671,
    longitude: -74.0534,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  return buildDeliveryScheduledReply(latestOrder.id, delivery.addressText, delivery.mapsUrl);
}

async function handleHumanHandoff(pool: Pool, conversation: PgConversation) {
  await pool.query('UPDATE conversations SET automation_paused = TRUE, status = $1 WHERE id = $2', [
    'human_review',
    conversation.id
  ]);
  return 'Te paso con una persona del equipo comercial para revisar tu caso.';
}

async function createSuggestedOffer(pool: Pool, conversationId: number, input: {
  requestedDiscountPercent?: number;
  quantity: number;
}) {
  const conversation = await requireConversation(pool, conversationId);
  if (!conversation.product.pricingRule?.active) throw new HttpError(400, 'Product has no active pricing rule');

  const sales = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM inventory_movements WHERE product_id = $1 AND type = 'sale'`,
    [conversation.product.id]
  );

  const offer = calculateOffer({
    basePrice: conversation.product.basePrice,
    minPrice: conversation.product.minPrice,
    stock: conversation.product.stock,
    recentSalesCount: Number(sales.rows[0].count),
    rule: conversation.product.pricingRule,
    requestedDiscountPercent: input.requestedDiscountPercent
  });

  const reply = buildSuggestedReply(conversation.lead.name, conversation.product.name, offer.proposedPrice, offer.expiresAt);
  const negotiation = await withTransaction(pool, async (client) => {
    const created = await client.query<{ id: number }>(
      `
        INSERT INTO negotiations (
          conversation_id, product_id, quantity, initial_price, proposed_price, min_allowed_price,
          discount_percent, rationale, status, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        conversationId,
        conversation.product.id,
        input.quantity,
        offer.initialPrice,
        offer.proposedPrice,
        offer.minAllowedPrice,
        offer.discountPercent,
        offer.rationale,
        offer.requiresApproval ? 'human_review' : 'proposed',
        offer.expiresAt.toISOString()
      ]
    );
    const negotiationId = created.rows[0].id;

    await client.query(
      `
        UPDATE conversations
        SET status = $1, automation_paused = $2
        WHERE id = $3
      `,
      [offer.requiresApproval ? 'human_review' : 'open', offer.requiresApproval, conversationId]
    );
    await client.query(
      `
        INSERT INTO messages (conversation_id, direction, body, metadata)
        VALUES ($1, $2, $3, $4)
      `,
      [
        conversationId,
        'system',
        `Oferta sugerida: ${reply}`,
        JSON.stringify({
          negotiationId,
          bot: true,
          actor: 'gpt',
          approvalRequired: offer.requiresApproval,
          stage: offer.requiresApproval ? 'advisor_required' : 'offer_suggested'
        })
      ]
    );

    return getNegotiationById(client, negotiationId);
  });

  return { negotiation: negotiation!, reply };
}

async function acceptNegotiationForOrder(pool: Pool, negotiationId: number) {
  const negotiation = await requireNegotiationWithConversation(pool, negotiationId);
  if (new Date(negotiation.expiresAt) < new Date()) throw new HttpError(400, 'Negotiation has expired');
  if (negotiation.product.stock < negotiation.quantity) throw new HttpError(400, 'Not enough stock for this order');

  return withTransaction(pool, async (client) => {
    await client.query('UPDATE negotiations SET status = $1 WHERE id = $2', ['accepted', negotiation.id]);

    const existing = await getOrderByNegotiationId(client, negotiation.id);
    if (existing) return existing;

    const created = await client.query<{ id: number }>(
      `
        INSERT INTO orders (store_id, lead_id, product_id, negotiation_id, quantity, unit_price, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        negotiation.lead.storeId,
        negotiation.lead.id,
        negotiation.product.id,
        negotiation.id,
        negotiation.quantity,
        negotiation.proposedPrice,
        negotiation.proposedPrice * negotiation.quantity
      ]
    );
    const orderId = created.rows[0].id;

    await client.query(
      'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
      ['waiting_payment', negotiation.conversationId]
    );
    await client.query(
      `INSERT INTO messages (conversation_id, direction, body) VALUES ($1, $2, $3)`,
      [
        negotiation.conversationId,
        'system',
        `Orden #${orderId} creada por ${formatCurrency(negotiation.proposedPrice * negotiation.quantity)}.`
      ]
    );

    return getOrderById(client, orderId);
  });
}

async function createPaymentLinkForOrder(pool: Pool, orderId: number) {
  const order = await requireOrder(pool, orderId);
  if (order.paymentLink) return order.paymentLink;
  if (order.status !== 'pending_payment') throw new HttpError(400, 'Payment link can only be generated for pending orders');

  return withTransaction(pool, async (client) => {
    const externalId = `pay_${order.id}_${Date.now()}`;
    const url = `${config.paymentBaseUrl}/${externalId}`;
    const created = await client.query<{ id: number }>(
      `
        INSERT INTO payment_links (order_id, external_id, url, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [order.id, externalId, url, new Date(Date.now() + 30 * 60 * 1000).toISOString()]
    );
    return getPaymentLinkById(client, created.rows[0].id);
  });
}

async function confirmOrderPayment(
  pool: Pool,
  orderId: number,
  externalId: string,
  source: 'commercial_bot' | 'mock_checkout' = 'commercial_bot',
  payerName?: string
) {
  const order = await requireOrder(pool, orderId);
  if (order.status === 'paid') return order;
  if (!order.paymentLink || order.paymentLink.externalId !== externalId) {
    throw new HttpError(400, 'Payment externalId does not match order payment link');
  }

  return withTransaction(pool, async (client) => {
    await client.query(
      `
        INSERT INTO payment_events (external_id, order_id, status, payload)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (external_id) DO NOTHING
      `,
      [externalId, orderId, 'paid', JSON.stringify({ externalId, orderId, status: 'paid', source, payerName: payerName ?? null })]
    );

    if (order.product.stock < order.quantity) throw new HttpError(400, 'Not enough stock to confirm payment');

    await client.query('UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2', [
      order.product.stock - order.quantity,
      order.product.id
    ]);
    await client.query(
      `
        INSERT INTO inventory_movements (product_id, type, quantity, reason, reference_id)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        order.product.id,
        'sale',
        -order.quantity,
        source === 'mock_checkout' ? 'Payment confirmed by mock checkout' : 'Payment confirmed by commercial bot',
        String(order.id)
      ]
    );
    await client.query('UPDATE payment_links SET status = $1 WHERE order_id = $2', ['paid', order.id]);
    await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['paid', order.id]);
    await client.query(
      'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
      ['paid', order.conversationId]
    );
    await client.query(
      `INSERT INTO messages (conversation_id, direction, body) VALUES ($1, $2, $3)`,
      [
        order.conversationId,
        'system',
        `${source === 'mock_checkout' ? 'Pago confirmado desde checkout mock' : 'Pago confirmado por chatbot'}. Stock restante de ${order.product.name}: ${order.product.stock - order.quantity}.`
      ]
    );

    return requireOrder(client, order.id);
  });
}

async function requirePaymentCheckout(db: Queryable, externalId: string) {
  const linkRow = first((await db.query<Row>('SELECT * FROM payment_links WHERE external_id = $1', [externalId])).rows);
  if (!linkRow) throw new HttpError(404, 'Payment link not found');

  const payment = mapPaymentLink(linkRow);
  const order = await requireOrder(db, payment.orderId);
  const expiresAt = new Date(payment.expiresAt);

  return {
    payment: {
      id: payment.id,
      externalId: payment.externalId,
      status: payment.status,
      url: payment.url,
      expiresAt: payment.expiresAt
    },
    order: {
      id: order.id,
      status: order.status,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalAmount: order.totalAmount,
      product: {
        id: order.product.id,
        sku: order.product.sku,
        name: order.product.name,
        description: order.product.description,
        category: order.product.category
      },
      lead: {
        name: order.lead.name,
        phone: maskPhone(order.lead.phone)
      }
    },
    canPay: payment.status === 'pending' && order.status === 'pending_payment' && expiresAt > new Date()
  };
}

async function sendPaymentConfirmedWhatsapp(pool: Pool, order: PgOrder) {
  const body = `Pago confirmado para la orden #${order.id} por ${formatCurrency(order.totalAmount)}. Enviame la direccion de entrega en este formato: Entrega en Calle 123 #45-67, Bogota.`;
  await appendOutboundMessage(pool, order.conversationId, body);
  await safeSendWhatsapp(order.lead.phone, body);
}

async function scheduleOrderDelivery(pool: Pool, orderId: number, input: {
  deliveryType: 'meetup' | 'home';
  addressText: string;
  latitude: number;
  longitude: number;
  scheduledAt: string;
}) {
  const order = await requireOrder(pool, orderId);
  if (order.status !== 'paid') throw new HttpError(400, 'Delivery can only be scheduled for paid orders');

  return withTransaction(pool, async (client) => {
    const mapsUrl = buildMapsUrl(input.latitude, input.longitude);
    const upserted = await client.query<{ id: number }>(
      `
        INSERT INTO deliveries (order_id, delivery_type, address_text, latitude, longitude, maps_url, scheduled_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (order_id) DO UPDATE SET
          delivery_type = EXCLUDED.delivery_type,
          address_text = EXCLUDED.address_text,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          maps_url = EXCLUDED.maps_url,
          scheduled_at = EXCLUDED.scheduled_at
        RETURNING id
      `,
      [order.id, input.deliveryType, input.addressText, input.latitude, input.longitude, mapsUrl, input.scheduledAt]
    );

    await client.query(
      'UPDATE conversations SET status = $1, automation_paused = FALSE WHERE id = $2',
      ['delivery_scheduled', order.conversationId]
    );
    return getDeliveryById(client, upserted.rows[0].id);
  });
}

async function appendOutboundMessage(pool: Pool, conversationId: number, body: string) {
  await pool.query(
    `
      WITH inserted AS (
        INSERT INTO messages (conversation_id, direction, body, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING created_at
      )
      UPDATE conversations
      SET last_message_at = inserted.created_at
      FROM inserted
      WHERE conversations.id = $1
    `,
    [conversationId, 'outbound', body, JSON.stringify({ bot: true })]
  );
}

async function buildCatalogReply(db: Queryable) {
  const products = await listProducts(db);
  const available = products
    .filter((product) => product.status === 'active')
    .slice(0, 8)
    .map((product) => `- ${product.name} (${product.sku}): ${formatCurrency(product.basePrice)} | stock ${product.stock}`)
    .join('\n');

  return `Catalogo disponible:\n${available}\n\nResponde con el SKU o dime cual quieres comprar.`;
}

async function buildInventoryReply(db: Queryable, currentSku: string) {
  const products = await listProducts(db);
  const current = products.find((product) => product.sku === currentSku);
  const summary = products
    .map((product) => `${product.sku}: ${product.stock} unidad(es)`)
    .join('\n');

  return `${current ? `${current.name}: ${current.stock} unidad(es) disponibles. Precio base ${formatCurrency(current.basePrice)}.\n\n` : ''}Inventario actual:\n${summary}`;
}

function buildHelpReply(leadName: string) {
  return `Hola ${leadName}, soy ComercIA. Puedes escribirme:\n- CATALOGO para ver productos\n- STOCK para inventario\n- QUIERO COMPRAR + SKU para una oferta\n- ACEPTO para crear la orden\n- PAGADO para confirmar pago sandbox\n- ENTREGA EN + direccion para programar envio`;
}

function getIntentQuantity(intent: CommercialIntent, fallback?: number) {
  if (intent.type === 'purchase' || intent.type === 'accept') return intent.quantity || fallback || 1;
  return fallback || 1;
}

function getIntentDiscount(intent: CommercialIntent, fallback?: number) {
  if (intent.type === 'purchase') return intent.requestedDiscountPercent ?? fallback;
  return fallback;
}

async function ensureDefaultStore(db: Queryable) {
  const result = await db.query<Row>(
    `
      INSERT INTO stores (name, phone)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone
      RETURNING *
    `,
    [config.defaultStoreName, config.defaultStorePhone]
  );
  return mapStore(first(result.rows)!);
}

async function upsertLead(db: Queryable, storeId: number, name: string, phone: string) {
  const normalizedPhone = normalizeLeadPhone(phone);
  const result = await db.query<Row>(
    `
      INSERT INTO leads (store_id, name, phone)
      VALUES ($1, $2, $3)
      ON CONFLICT (store_id, phone) DO UPDATE SET name = EXCLUDED.name, status = 'open'
      RETURNING *
    `,
    [storeId, name, normalizedPhone]
  );
  return mapLead(first(result.rows)!);
}

async function findLeadByPhone(db: Queryable, phone: string) {
  const normalizedPhone = normalizeLeadPhone(phone);
  const result = await db.query<Row>(
    `
      SELECT *
      FROM leads
      WHERE phone = $1
      ORDER BY id DESC
      LIMIT 1
    `,
    [normalizedPhone]
  );
  const row = first(result.rows);
  return row ? mapLead(row) : null;
}

async function findActiveConversationForLeadProduct(
  db: Queryable,
  leadId: number,
  productId: number,
  includeScheduledDeliveries = false
) {
  const statuses = ['open', 'human_review', 'advisor_active', 'waiting_payment', 'paid'];
  if (includeScheduledDeliveries) statuses.push('delivery_scheduled');

  return db.query<Row>(
    `
      SELECT * FROM conversations
      WHERE lead_id = $1
        AND product_id = $2
        AND status = ANY($3::text[])
      ORDER BY id DESC
      LIMIT 1
    `,
    [leadId, productId, statuses]
  );
}

async function findActiveConversationForLead(
  db: Queryable,
  leadId: number,
  includeScheduledDeliveries = false
) {
  const statuses = ['open', 'human_review', 'advisor_active', 'waiting_payment', 'paid'];
  if (includeScheduledDeliveries) statuses.push('delivery_scheduled');

  return db.query<Row>(
    `
      SELECT conversations.*
      FROM conversations
      LEFT JOIN negotiations
        ON negotiations.conversation_id = conversations.id
      LEFT JOIN orders
        ON orders.negotiation_id = negotiations.id
      WHERE conversations.lead_id = $1
        AND conversations.status = ANY($2::text[])
      ORDER BY
        CASE
          WHEN orders.status = 'pending_payment' THEN 0
          WHEN orders.status = 'paid' THEN 1
          WHEN negotiations.status IN ('proposed', 'human_review') THEN 2
          ELSE 3
        END,
        conversations.last_message_at DESC,
        conversations.id DESC
      LIMIT 1
    `,
    [leadId, statuses]
  );
}

function normalizeLeadPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `+${digits}` : phone.trim();
}

async function listProducts(db: Queryable) {
  const rows = await db.query<Row>('SELECT * FROM products ORDER BY id ASC');
  const products = [];
  for (const row of rows.rows) {
    products.push(await mapProduct(db, row));
  }
  return products;
}

async function getProductById(db: Queryable, id: number) {
  const result = await db.query<Row>('SELECT * FROM products WHERE id = $1', [id]);
  const row = first(result.rows);
  return row ? mapProduct(db, row) : null;
}

async function getProductBySku(db: Queryable, sku: string) {
  const result = await db.query<Row>('SELECT * FROM products WHERE sku = $1', [sku]);
  const row = first(result.rows);
  return row ? mapProduct(db, row) : null;
}

async function requireProduct(db: Queryable, id: number) {
  const product = await getProductById(db, id);
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

async function getPricingRule(db: Queryable, productId: number) {
  const result = await db.query<Row>('SELECT * FROM pricing_rules WHERE product_id = $1', [productId]);
  const row = first(result.rows);
  return row ? mapPricingRule(row) : null;
}

function mapPricingRule(row: Row) {
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

async function mapProduct(db: Queryable, row: Row) {
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
    pricingRule: await getPricingRule(db, Number(row.id))
  };
}

function mapStore(row: Row) {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    status: String(row.status)
  };
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

async function listConversations(db: Queryable, status?: string) {
  const result = status
    ? await db.query<Row>(
      'SELECT id FROM conversations WHERE status = $1 ORDER BY last_message_at DESC',
      [status]
    )
    : await db.query<Row>('SELECT id FROM conversations ORDER BY last_message_at DESC');
  const conversations = [];
  for (const row of result.rows) {
    conversations.push(await getConversationById(db, Number(row.id)));
  }
  return conversations;
}

async function getConversationById(db: Queryable, id: number) {
  const result = await db.query<Row>('SELECT * FROM conversations WHERE id = $1', [id]);
  const row = first(result.rows);
  if (!row) return null;

  const leadRow = first((await db.query<Row>('SELECT * FROM leads WHERE id = $1', [Number(row.lead_id)])).rows)!;
  const product = await requireProduct(db, Number(row.product_id));
  const messages = (await db.query<Row>('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC, id ASC', [id])).rows.map(mapMessage);
  const negotiationRows = (await db.query<Row>(
    'SELECT * FROM negotiations WHERE conversation_id = $1 ORDER BY created_at DESC, id DESC',
    [id]
  )).rows;
  const negotiations = [];
  for (const negotiation of negotiationRows) {
    negotiations.push(await mapNegotiation(db, negotiation));
  }

  return {
    id: Number(row.id),
    status: String(row.status),
    channel: String(row.channel),
    automationPaused: Boolean(row.automation_paused),
    lead: mapLead(leadRow),
    product,
    messages,
    negotiations
  };
}

async function requireConversation(db: Queryable, id: number) {
  const conversation = await getConversationById(db, id);
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

async function getNegotiationById(db: Queryable, id: number) {
  const row = first((await db.query<Row>('SELECT * FROM negotiations WHERE id = $1', [id])).rows);
  return row ? mapNegotiation(db, row) : null;
}

async function mapNegotiation(db: Queryable, row: Row) {
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
    order: await getOrderByNegotiationId(db, Number(row.id))
  };
}

async function requireNegotiationWithConversation(db: Queryable, id: number) {
  const row = first((await db.query<Row>('SELECT * FROM negotiations WHERE id = $1', [id])).rows);
  if (!row) throw new HttpError(404, 'Negotiation not found');
  const conversation = await requireConversation(db, Number(row.conversation_id));
  return {
    ...(await mapNegotiation(db, row)),
    lead: conversation.lead,
    product: conversation.product
  };
}

async function getOrderByNegotiationId(db: Queryable, negotiationId: number) {
  const row = first((await db.query<Row>('SELECT * FROM orders WHERE negotiation_id = $1', [negotiationId])).rows);
  return row ? mapOrder(db, row) : null;
}

async function getOrderById(db: Queryable, id: number) {
  const row = first((await db.query<Row>('SELECT * FROM orders WHERE id = $1', [id])).rows);
  return row ? mapOrder(db, row) : null;
}

async function requireOrder(db: Queryable, id: number) {
  const order = await getOrderById(db, id);
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

async function mapOrder(db: Queryable, row: Row) {
  const negotiationRow = first((await db.query<Row>('SELECT * FROM negotiations WHERE id = $1', [Number(row.negotiation_id)])).rows)!;
  const leadRow = first((await db.query<Row>('SELECT * FROM leads WHERE id = $1', [Number(row.lead_id)])).rows)!;
  return {
    id: Number(row.id),
    storeId: Number(row.store_id),
    leadId: Number(row.lead_id),
    productId: Number(row.product_id),
    negotiationId: Number(row.negotiation_id),
    conversationId: Number(negotiationRow.conversation_id),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    status: String(row.status),
    lead: mapLead(leadRow),
    product: await requireProduct(db, Number(row.product_id)),
    paymentLink: await getPaymentLinkByOrderId(db, Number(row.id)),
    delivery: await getDeliveryByOrderId(db, Number(row.id))
  };
}

async function getPaymentLinkByOrderId(db: Queryable, orderId: number) {
  const row = first((await db.query<Row>('SELECT * FROM payment_links WHERE order_id = $1', [orderId])).rows);
  return row ? mapPaymentLink(row) : null;
}

async function getPaymentLinkById(db: Queryable, id: number) {
  return mapPaymentLink(first((await db.query<Row>('SELECT * FROM payment_links WHERE id = $1', [id])).rows)!);
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

async function getPaymentEventById(db: Queryable, id: number) {
  const row = first((await db.query<Row>('SELECT * FROM payment_events WHERE id = $1', [id])).rows)!;
  return {
    id: Number(row.id),
    externalId: String(row.external_id),
    orderId: Number(row.order_id),
    status: String(row.status)
  };
}

async function getDeliveryByOrderId(db: Queryable, orderId: number) {
  const row = first((await db.query<Row>('SELECT * FROM deliveries WHERE order_id = $1', [orderId])).rows);
  return row ? mapDelivery(row) : null;
}

async function getDeliveryById(db: Queryable, id: number) {
  return mapDelivery(first((await db.query<Row>('SELECT * FROM deliveries WHERE id = $1', [id])).rows)!);
}

function mapDelivery(row: Row) {
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

async function safeSendWhatsapp(phone: string, body: string) {
  try {
    const cta = extractCtaUrl(body);
    if (cta) {
      try {
        await sendWhatsappCtaUrl(phone, cta);
        return;
      } catch (error) {
        console.error('WhatsApp CTA send failed, falling back to regular message', {
          phone: maskPhone(phone),
          error
        });
      }
    }

    const buttons = buildReplyButtonsForBody(body);
    if (buttons.length) {
      try {
        await sendWhatsappReplyButtons(phone, body, buttons);
        return;
      } catch (error) {
        console.error('WhatsApp button send failed, falling back to text', {
          phone: maskPhone(phone),
          error
        });
      }
    }

    await sendWhatsappText(phone, body);
  } catch (error) {
    console.error('WhatsApp text send failed', {
      phone: maskPhone(phone),
      error
    });
  }
}

async function safeSendCommercialWhatsapp(
  db: Queryable,
  phone: string,
  body: string,
  presentation: WhatsappPresentation = 'auto'
) {
  if (presentation !== 'catalog') {
    await safeSendWhatsapp(phone, body);
    return;
  }

  try {
    const products = await listProducts(db);
    const rows = products
      .filter((product) => product.status === 'active')
      .slice(0, 10)
      .map((product) => ({
        id: `QUIERO COMPRAR ${product.sku}`,
        title: product.name,
        description: `${product.sku} | ${formatCurrency(product.basePrice)} | stock ${product.stock}`
      }));

    await sendWhatsappList(phone, {
      header: 'Catalogo ComercIA',
      body: 'Elige un producto para cotizarlo o comprarlo. Tambien puedes escribir el SKU.',
      footer: 'Sandbox comercial',
      button: 'Elegir producto',
      rows
    });
  } catch (error) {
    console.error('WhatsApp catalog list send failed, falling back to text', {
      phone: maskPhone(phone),
      error
    });
    await safeSendWhatsapp(phone, body);
  }
}

function extractCtaUrl(body: string) {
  const url = body.match(/https?:\/\/\S+/)?.[0];
  if (!url) return null;

  const isMaps = url.includes('google.com/maps');
  const cleanBody = body
    .replace(url, '')
    .replace(/Link de pago:\s*/i, '')
    .replace(/Paga aqui:\s*/i, 'Paga con el boton de abajo.')
    .replace(/Ubicacion:\s*/i, 'Ubicacion disponible en el boton de abajo.')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    body: cleanBody || (isMaps ? 'Tu entrega quedo programada.' : 'Tu link de pago esta listo.'),
    buttonText: isMaps ? 'Ver mapa' : 'Pagar ahora',
    url
  };
}

function buildReplyButtonsForBody(body: string): WhatsappReplyButton[] {
  if (/ACEPTO|Aceptar oferta|crear la orden/i.test(body)) {
    return [
      { id: 'ACEPTO', title: 'Aceptar oferta' },
      { id: 'CATALOGO', title: 'Ver catalogo' },
      { id: 'HUMANO', title: 'Asesor' }
    ];
  }

  if (/CATALOGO|STOCK|QUIERO COMPRAR/i.test(body)) {
    return [
      { id: 'CATALOGO', title: 'Ver catalogo' },
      { id: 'STOCK', title: 'Ver stock' },
      { id: 'HUMANO', title: 'Asesor' }
    ];
  }

  return [];
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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length <= 4) return digits ? `***${digits}` : '';
  return `***${digits.slice(-4)}`;
}
