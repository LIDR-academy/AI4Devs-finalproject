import type { Pool } from 'pg';
import { buildMapsUrl } from '../domain/maps.js';
import { first, type Queryable, withTransaction } from './postgres.js';
import {
  demoConversations,
  demoLeads,
  demoProducts,
  demoStore,
  formatSeedSummary,
  minutesAgo,
  minutesFromNow,
  seedTableNames,
  type DemoConversation,
  type DemoInventoryMovement,
  type DemoLead,
  type DemoMessage,
  type DemoNegotiation,
  type DemoOrder,
  type DemoPricingRule,
  type DemoProduct,
  type SeedSummary,
  type SeedTableName
} from './demoDataset.js';

type IdRow = { id: number };

export async function seedPostgres(pool: Pool): Promise<SeedSummary> {
  const now = new Date();

  await withTransaction(pool, async (client) => {
    const storeId = await upsertStore(client);
    const productIds = new Map<string, number>();
    const leadIds = new Map<string, number>();

    for (const product of demoProducts) {
      productIds.set(product.sku, await upsertProduct(client, storeId, product));
    }

    for (const lead of demoLeads) {
      leadIds.set(lead.phone, await upsertLead(client, storeId, lead));
    }

    for (const conversation of demoConversations) {
      const leadId = leadIds.get(conversation.leadPhone);
      const productId = productIds.get(conversation.productSku);

      if (!leadId) throw new Error(`Demo lead not found: ${conversation.leadPhone}`);
      if (!productId) throw new Error(`Demo product not found: ${conversation.productSku}`);

      await upsertConversation(client, leadId, productId, conversation, now);
    }
  });

  const summary = await countTables(pool);
  console.log(`Seed summary: ${formatSeedSummary(summary)}`);
  return summary;
}

async function upsertStore(db: Queryable) {
  const result = await db.query<IdRow>(
    `
      INSERT INTO stores (name, phone, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (name) DO UPDATE SET
        phone = EXCLUDED.phone,
        status = 'active'
      RETURNING id
    `,
    [demoStore.name, demoStore.phone]
  );
  return Number(first(result.rows)!.id);
}

async function upsertProduct(db: Queryable, storeId: number, product: DemoProduct) {
  const result = await db.query<IdRow>(
    `
      INSERT INTO products (
        store_id, sku, name, description, category, base_price, min_price, stock, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      ON CONFLICT (sku) DO UPDATE SET
        store_id = EXCLUDED.store_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        base_price = EXCLUDED.base_price,
        min_price = EXCLUDED.min_price,
        stock = EXCLUDED.stock,
        status = 'active',
        updated_at = NOW()
      RETURNING id
    `,
    [
      storeId,
      product.sku,
      product.name,
      product.description,
      product.category,
      product.basePrice,
      product.minPrice,
      product.stock
    ]
  );
  const productId = Number(first(result.rows)!.id);

  await upsertPricingRule(db, productId, product.pricingRule);
  await ensureInventoryMovement(db, productId, {
    type: 'initial',
    quantity: product.initialStock,
    reason: 'Seed stock inicial',
    referenceId: `seed-initial-${product.sku}`
  });

  for (const movement of product.movements ?? []) {
    await ensureInventoryMovement(db, productId, movement);
  }

  return productId;
}

async function upsertPricingRule(db: Queryable, productId: number, rule: DemoPricingRule) {
  await db.query(
    `
      INSERT INTO pricing_rules (
        product_id, max_discount_percent, low_rotation_days, low_stock_threshold,
        approval_discount_threshold, offer_expires_in_minutes, active
      )
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      ON CONFLICT (product_id) DO UPDATE SET
        max_discount_percent = EXCLUDED.max_discount_percent,
        low_rotation_days = EXCLUDED.low_rotation_days,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        approval_discount_threshold = EXCLUDED.approval_discount_threshold,
        offer_expires_in_minutes = EXCLUDED.offer_expires_in_minutes,
        active = TRUE,
        updated_at = NOW()
    `,
    [
      productId,
      rule.maxDiscountPercent,
      rule.lowRotationDays,
      rule.lowStockThreshold,
      rule.approvalDiscountThreshold,
      rule.offerExpiresInMinutes
    ]
  );
}

async function ensureInventoryMovement(db: Queryable, productId: number, movement: DemoInventoryMovement) {
  const referenceId = movement.referenceId ?? null;
  const existing = referenceId
    ? await db.query<IdRow>('SELECT id FROM inventory_movements WHERE reference_id = $1', [referenceId])
    : await db.query<IdRow>(
      `
        SELECT id FROM inventory_movements
        WHERE product_id = $1 AND type = $2 AND reason = $3
        LIMIT 1
      `,
      [productId, movement.type, movement.reason]
    );

  const row = first(existing.rows);
  if (row) {
    await db.query(
      `
        UPDATE inventory_movements
        SET product_id = $1, type = $2, quantity = $3, reason = $4, reference_id = $5
        WHERE id = $6
      `,
      [productId, movement.type, movement.quantity, movement.reason, referenceId, row.id]
    );
    return;
  }

  await db.query(
    `
      INSERT INTO inventory_movements (product_id, type, quantity, reason, reference_id)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [productId, movement.type, movement.quantity, movement.reason, referenceId]
  );
}

async function upsertLead(db: Queryable, storeId: number, lead: DemoLead) {
  const result = await db.query<IdRow>(
    `
      INSERT INTO leads (store_id, name, phone, source, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (store_id, phone) DO UPDATE SET
        name = EXCLUDED.name,
        source = EXCLUDED.source,
        status = EXCLUDED.status
      RETURNING id
    `,
    [storeId, lead.name, lead.phone, lead.source, lead.status]
  );
  return Number(first(result.rows)!.id);
}

async function upsertConversation(
  db: Queryable,
  leadId: number,
  productId: number,
  conversation: DemoConversation,
  now: Date
) {
  const lastMessageAt = minutesAgo(conversation.lastMessageMinutesAgo, now);
  const existing = await db.query<IdRow>(
    `
      SELECT id FROM conversations
      WHERE lead_id = $1 AND product_id = $2
      ORDER BY id ASC
      LIMIT 1
    `,
    [leadId, productId]
  );

  let conversationId: number;
  const existingRow = first(existing.rows);
  if (existingRow) {
    await db.query(
      `
        UPDATE conversations
        SET channel = $1, status = $2, automation_paused = $3, last_message_at = $4
        WHERE id = $5
      `,
      ['whatsapp', conversation.status, conversation.automationPaused ?? false, lastMessageAt, existingRow.id]
    );
    conversationId = Number(existingRow.id);
  } else {
    const created = await db.query<IdRow>(
      `
        INSERT INTO conversations (
          lead_id, product_id, channel, status, automation_paused, last_message_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [leadId, productId, 'whatsapp', conversation.status, conversation.automationPaused ?? false, lastMessageAt]
    );
    conversationId = Number(first(created.rows)!.id);
  }

  for (const [index, message] of conversation.messages.entries()) {
    const createdAt = minutesAgo(conversation.lastMessageMinutesAgo + ((conversation.messages.length - index - 1) * 2), now);
    await upsertMessage(db, conversationId, conversation.key, index, message, createdAt);
  }

  if (!conversation.negotiation) return conversationId;

  const negotiationId = await upsertNegotiation(db, conversationId, productId, conversation.negotiation, now);
  if (conversation.order) {
    await upsertOrder(db, leadId, productId, negotiationId, conversation.order, now);
  }

  return conversationId;
}

async function upsertMessage(
  db: Queryable,
  conversationId: number,
  conversationKey: string,
  index: number,
  message: DemoMessage,
  createdAt: string
) {
  const providerMessageId = `seed_${conversationKey}_${index + 1}`;
  const metadata = JSON.stringify({
    seed: true,
    seedKey: conversationKey,
    seedIndex: index + 1,
    ...(message.metadata ?? {})
  });
  const existing = await db.query<IdRow>('SELECT id FROM messages WHERE provider_message_id = $1', [providerMessageId]);
  const row = first(existing.rows);

  if (row) {
    await db.query(
      `
        UPDATE messages
        SET conversation_id = $1, direction = $2, body = $3, metadata = $4, created_at = $5
        WHERE id = $6
      `,
      [conversationId, message.direction, message.body, metadata, createdAt, row.id]
    );
    return;
  }

  await db.query(
    `
      INSERT INTO messages (
        conversation_id, direction, body, provider_message_id, metadata, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [conversationId, message.direction, message.body, providerMessageId, metadata, createdAt]
  );
}

async function upsertNegotiation(
  db: Queryable,
  conversationId: number,
  productId: number,
  negotiation: DemoNegotiation,
  now: Date
) {
  const existing = await db.query<IdRow>(
    `
      SELECT id FROM negotiations
      WHERE conversation_id = $1 AND product_id = $2 AND quantity = $3
      ORDER BY id ASC
      LIMIT 1
    `,
    [conversationId, productId, negotiation.quantity]
  );
  const expiresAt = minutesFromNow(negotiation.expiresInMinutes, now);
  const row = first(existing.rows);

  if (row) {
    await db.query(
      `
        UPDATE negotiations
        SET product_id = $1, quantity = $2, initial_price = $3, proposed_price = $4,
            min_allowed_price = $5, discount_percent = $6, rationale = $7,
            status = $8, expires_at = $9
        WHERE id = $10
      `,
      [
        productId,
        negotiation.quantity,
        negotiation.initialPrice,
        negotiation.proposedPrice,
        negotiation.minAllowedPrice,
        negotiation.discountPercent,
        negotiation.rationale,
        negotiation.status,
        expiresAt,
        row.id
      ]
    );
    return Number(row.id);
  }

  const created = await db.query<IdRow>(
    `
      INSERT INTO negotiations (
        conversation_id, product_id, quantity, initial_price, proposed_price,
        min_allowed_price, discount_percent, rationale, status, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `,
    [
      conversationId,
      productId,
      negotiation.quantity,
      negotiation.initialPrice,
      negotiation.proposedPrice,
      negotiation.minAllowedPrice,
      negotiation.discountPercent,
      negotiation.rationale,
      negotiation.status,
      expiresAt
    ]
  );
  return Number(first(created.rows)!.id);
}

async function upsertOrder(
  db: Queryable,
  leadId: number,
  productId: number,
  negotiationId: number,
  order: DemoOrder,
  now: Date
) {
  const product = first((await db.query<{ store_id: number }>(
    'SELECT store_id FROM products WHERE id = $1',
    [productId]
  )).rows)!;
  const totalAmount = order.quantity * order.unitPrice;
  const existing = await db.query<IdRow>('SELECT id FROM orders WHERE negotiation_id = $1', [negotiationId]);
  const row = first(existing.rows);

  let orderId: number;
  if (row) {
    await db.query(
      `
        UPDATE orders
        SET store_id = $1, lead_id = $2, product_id = $3, quantity = $4,
            unit_price = $5, total_amount = $6, status = $7, updated_at = NOW()
        WHERE id = $8
      `,
      [product.store_id, leadId, productId, order.quantity, order.unitPrice, totalAmount, order.status, row.id]
    );
    orderId = Number(row.id);
  } else {
    const created = await db.query<IdRow>(
      `
        INSERT INTO orders (
          store_id, lead_id, product_id, negotiation_id, quantity, unit_price, total_amount, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [product.store_id, leadId, productId, negotiationId, order.quantity, order.unitPrice, totalAmount, order.status]
    );
    orderId = Number(first(created.rows)!.id);
  }

  if (order.paymentLink) {
    await upsertPaymentLink(db, orderId, order.paymentLink, now);
  }

  if (order.paymentEvent && order.paymentLink) {
    await upsertPaymentEvent(db, orderId, order.paymentLink.externalId, order.paymentEvent.status, order.paymentEvent.payload);
  }

  if (order.delivery) {
    await upsertDelivery(db, orderId, order.delivery, now);
  }

  return orderId;
}

async function upsertPaymentLink(
  db: Queryable,
  orderId: number,
  paymentLink: NonNullable<DemoOrder['paymentLink']>,
  now: Date
) {
  const expiresAt = minutesFromNow(paymentLink.expiresInMinutes, now);
  const existing = await db.query<IdRow>('SELECT id FROM payment_links WHERE order_id = $1', [orderId]);
  const row = first(existing.rows);

  if (row) {
    await db.query(
      `
        UPDATE payment_links
        SET provider = $1, external_id = $2, url = $3, status = $4, expires_at = $5
        WHERE id = $6
      `,
      ['simulated', paymentLink.externalId, paymentLink.url, paymentLink.status, expiresAt, row.id]
    );
    return;
  }

  await db.query(
    `
      INSERT INTO payment_links (order_id, provider, external_id, url, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [orderId, 'simulated', paymentLink.externalId, paymentLink.url, paymentLink.status, expiresAt]
  );
}

async function upsertPaymentEvent(
  db: Queryable,
  orderId: number,
  externalId: string,
  status: 'paid' | 'failed',
  payload: Record<string, unknown>
) {
  const serializedPayload = JSON.stringify({ ...payload, seed: true, orderId });
  const existing = await db.query<IdRow>('SELECT id FROM payment_events WHERE external_id = $1', [externalId]);
  const row = first(existing.rows);

  if (row) {
    await db.query(
      'UPDATE payment_events SET order_id = $1, status = $2, payload = $3 WHERE id = $4',
      [orderId, status, serializedPayload, row.id]
    );
    return;
  }

  await db.query(
    `
      INSERT INTO payment_events (external_id, order_id, status, payload)
      VALUES ($1, $2, $3, $4)
    `,
    [externalId, orderId, status, serializedPayload]
  );
}

async function upsertDelivery(
  db: Queryable,
  orderId: number,
  delivery: NonNullable<DemoOrder['delivery']>,
  now: Date
) {
  const scheduledAt = minutesFromNow(delivery.scheduledInMinutes, now);
  const mapsUrl = buildMapsUrl(delivery.latitude, delivery.longitude);
  const existing = await db.query<IdRow>('SELECT id FROM deliveries WHERE order_id = $1', [orderId]);
  const row = first(existing.rows);

  if (row) {
    await db.query(
      `
        UPDATE deliveries
        SET delivery_type = $1, address_text = $2, latitude = $3, longitude = $4,
            maps_url = $5, status = $6, scheduled_at = $7
        WHERE id = $8
      `,
      [
        delivery.deliveryType,
        delivery.addressText,
        delivery.latitude,
        delivery.longitude,
        mapsUrl,
        delivery.status,
        scheduledAt,
        row.id
      ]
    );
    return;
  }

  await db.query(
    `
      INSERT INTO deliveries (
        order_id, delivery_type, address_text, latitude, longitude, maps_url, status, scheduled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      orderId,
      delivery.deliveryType,
      delivery.addressText,
      delivery.latitude,
      delivery.longitude,
      mapsUrl,
      delivery.status,
      scheduledAt
    ]
  );
}

async function countTables(db: Queryable): Promise<SeedSummary> {
  const summary = {} as SeedSummary;

  for (const table of seedTableNames) {
    summary[table] = await countRows(db, table);
  }

  return summary;
}

async function countRows(db: Queryable, table: SeedTableName) {
  const result = await db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${table}`);
  return Number(first(result.rows)!.count);
}
