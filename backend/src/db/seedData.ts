import { buildMapsUrl } from '../domain/maps.js';
import { insertedId, transaction, type Database } from './database.js';
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
type CountRow = { count: number };

export function seedDemoData(db: Database): SeedSummary {
  const now = new Date();

  transaction(db, () => {
    const storeId = upsertStore(db);
    const productIds = new Map<string, number>();
    const leadIds = new Map<string, number>();

    for (const product of demoProducts) {
      productIds.set(product.sku, upsertProduct(db, storeId, product));
    }

    for (const lead of demoLeads) {
      leadIds.set(lead.phone, upsertLead(db, storeId, lead));
    }

    for (const conversation of demoConversations) {
      const leadId = leadIds.get(conversation.leadPhone);
      const productId = productIds.get(conversation.productSku);

      if (!leadId) throw new Error(`Demo lead not found: ${conversation.leadPhone}`);
      if (!productId) throw new Error(`Demo product not found: ${conversation.productSku}`);

      upsertConversation(db, leadId, productId, conversation, now);
    }
  });

  const summary = countTables(db);
  console.log(`Seed summary: ${formatSeedSummary(summary)}`);
  return summary;
}

function upsertStore(db: Database) {
  const existing = db.prepare('SELECT id FROM stores WHERE name = ?').get(demoStore.name) as IdRow | undefined;
  if (existing) {
    db.prepare('UPDATE stores SET phone = ?, status = ? WHERE id = ?').run(demoStore.phone, 'active', existing.id);
    return Number(existing.id);
  }

  return insertedId(db.prepare('INSERT INTO stores (name, phone, status) VALUES (?, ?, ?)').run(
    demoStore.name,
    demoStore.phone,
    'active'
  ));
}

function upsertProduct(db: Database, storeId: number, product: DemoProduct) {
  const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(product.sku) as IdRow | undefined;
  const values = [
    storeId,
    product.name,
    product.description,
    product.category,
    product.basePrice,
    product.minPrice,
    product.stock,
    'active',
    product.sku
  ];

  let productId: number;
  if (existing) {
    db.prepare(`
      UPDATE products
      SET store_id = ?, name = ?, description = ?, category = ?, base_price = ?,
          min_price = ?, stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE sku = ?
    `).run(...values);
    productId = Number(existing.id);
  } else {
    productId = insertedId(db.prepare(`
      INSERT INTO products (
        store_id, sku, name, description, category, base_price, min_price, stock, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      storeId,
      product.sku,
      product.name,
      product.description,
      product.category,
      product.basePrice,
      product.minPrice,
      product.stock,
      'active'
    ));
  }

  upsertPricingRule(db, productId, product.pricingRule);
  ensureInventoryMovement(db, productId, {
    type: 'initial',
    quantity: product.initialStock,
    reason: 'Seed stock inicial',
    referenceId: `seed-initial-${product.sku}`
  });

  for (const movement of product.movements ?? []) {
    ensureInventoryMovement(db, productId, movement);
  }

  return productId;
}

function upsertPricingRule(db: Database, productId: number, rule: DemoPricingRule) {
  const existing = db.prepare('SELECT id FROM pricing_rules WHERE product_id = ?').get(productId) as IdRow | undefined;
  const params = [
    rule.maxDiscountPercent,
    rule.lowRotationDays,
    rule.lowStockThreshold,
    rule.approvalDiscountThreshold,
    rule.offerExpiresInMinutes,
    1,
    productId
  ];

  if (existing) {
    db.prepare(`
      UPDATE pricing_rules
      SET max_discount_percent = ?, low_rotation_days = ?, low_stock_threshold = ?,
          approval_discount_threshold = ?, offer_expires_in_minutes = ?, active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `).run(...params);
    return;
  }

  db.prepare(`
    INSERT INTO pricing_rules (
      max_discount_percent, low_rotation_days, low_stock_threshold,
      approval_discount_threshold, offer_expires_in_minutes, active, product_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(...params);
}

function ensureInventoryMovement(db: Database, productId: number, movement: DemoInventoryMovement) {
  const referenceId = movement.referenceId ?? null;
  const existing = referenceId
    ? db.prepare('SELECT id FROM inventory_movements WHERE reference_id = ?').get(referenceId) as IdRow | undefined
    : db.prepare(`
        SELECT id FROM inventory_movements
        WHERE product_id = ? AND type = ? AND reason = ?
        LIMIT 1
      `).get(productId, movement.type, movement.reason) as IdRow | undefined;

  if (existing) {
    db.prepare(`
      UPDATE inventory_movements
      SET product_id = ?, type = ?, quantity = ?, reason = ?, reference_id = ?
      WHERE id = ?
    `).run(productId, movement.type, movement.quantity, movement.reason, referenceId, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO inventory_movements (product_id, type, quantity, reason, reference_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(productId, movement.type, movement.quantity, movement.reason, referenceId);
}

function upsertLead(db: Database, storeId: number, lead: DemoLead) {
  const existing = db.prepare('SELECT id FROM leads WHERE store_id = ? AND phone = ?')
    .get(storeId, lead.phone) as IdRow | undefined;

  if (existing) {
    db.prepare('UPDATE leads SET name = ?, source = ?, status = ? WHERE id = ?')
      .run(lead.name, lead.source, lead.status, existing.id);
    return Number(existing.id);
  }

  return insertedId(db.prepare(`
    INSERT INTO leads (store_id, name, phone, source, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(storeId, lead.name, lead.phone, lead.source, lead.status));
}

function upsertConversation(
  db: Database,
  leadId: number,
  productId: number,
  conversation: DemoConversation,
  now: Date
) {
  const lastMessageAt = minutesAgo(conversation.lastMessageMinutesAgo, now);
  const existing = db.prepare(`
    SELECT id FROM conversations
    WHERE lead_id = ? AND product_id = ?
    ORDER BY id ASC
    LIMIT 1
  `).get(leadId, productId) as IdRow | undefined;

  let conversationId: number;
  if (existing) {
    db.prepare(`
      UPDATE conversations
      SET channel = ?, status = ?, automation_paused = ?, last_message_at = ?
      WHERE id = ?
    `).run('whatsapp', conversation.status, conversation.automationPaused ? 1 : 0, lastMessageAt, existing.id);
    conversationId = Number(existing.id);
  } else {
    conversationId = insertedId(db.prepare(`
      INSERT INTO conversations (
        lead_id, product_id, channel, status, automation_paused, last_message_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      leadId,
      productId,
      'whatsapp',
      conversation.status,
      conversation.automationPaused ? 1 : 0,
      lastMessageAt
    ));
  }

  conversation.messages.forEach((message, index) => {
    const createdAt = minutesAgo(conversation.lastMessageMinutesAgo + ((conversation.messages.length - index - 1) * 2), now);
    upsertMessage(db, conversationId, conversation.key, index, message, createdAt);
  });

  if (!conversation.negotiation) return conversationId;

  const negotiationId = upsertNegotiation(db, conversationId, productId, conversation.negotiation, now);
  if (conversation.order) {
    upsertOrder(db, leadId, productId, negotiationId, conversation.order, now);
  }

  return conversationId;
}

function upsertMessage(
  db: Database,
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
  const existing = db.prepare('SELECT id FROM messages WHERE provider_message_id = ?')
    .get(providerMessageId) as IdRow | undefined;

  if (existing) {
    db.prepare(`
      UPDATE messages
      SET conversation_id = ?, direction = ?, body = ?, metadata = ?, created_at = ?
      WHERE id = ?
    `).run(conversationId, message.direction, message.body, metadata, createdAt, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO messages (
      conversation_id, direction, body, provider_message_id, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(conversationId, message.direction, message.body, providerMessageId, metadata, createdAt);
}

function upsertNegotiation(
  db: Database,
  conversationId: number,
  productId: number,
  negotiation: DemoNegotiation,
  now: Date
) {
  const existing = db.prepare(`
    SELECT id FROM negotiations
    WHERE conversation_id = ? AND product_id = ? AND quantity = ?
    ORDER BY id ASC
    LIMIT 1
  `).get(conversationId, productId, negotiation.quantity) as IdRow | undefined;
  const expiresAt = minutesFromNow(negotiation.expiresInMinutes, now);
  const values = [
    productId,
    negotiation.quantity,
    negotiation.initialPrice,
    negotiation.proposedPrice,
    negotiation.minAllowedPrice,
    negotiation.discountPercent,
    negotiation.rationale,
    negotiation.status,
    expiresAt
  ];

  if (existing) {
    db.prepare(`
      UPDATE negotiations
      SET product_id = ?, quantity = ?, initial_price = ?, proposed_price = ?,
          min_allowed_price = ?, discount_percent = ?, rationale = ?,
          status = ?, expires_at = ?
      WHERE id = ?
    `).run(...values, existing.id);
    return Number(existing.id);
  }

  return insertedId(db.prepare(`
    INSERT INTO negotiations (
      conversation_id, product_id, quantity, initial_price, proposed_price,
      min_allowed_price, discount_percent, rationale, status, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(conversationId, ...values));
}

function upsertOrder(
  db: Database,
  leadId: number,
  productId: number,
  negotiationId: number,
  order: DemoOrder,
  now: Date
) {
  const product = db.prepare('SELECT store_id FROM products WHERE id = ?').get(productId) as { store_id: number };
  const totalAmount = order.quantity * order.unitPrice;
  const existing = db.prepare('SELECT id FROM orders WHERE negotiation_id = ?').get(negotiationId) as IdRow | undefined;

  let orderId: number;
  if (existing) {
    db.prepare(`
      UPDATE orders
      SET store_id = ?, lead_id = ?, product_id = ?, quantity = ?, unit_price = ?,
          total_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      product.store_id,
      leadId,
      productId,
      order.quantity,
      order.unitPrice,
      totalAmount,
      order.status,
      existing.id
    );
    orderId = Number(existing.id);
  } else {
    orderId = insertedId(db.prepare(`
      INSERT INTO orders (
        store_id, lead_id, product_id, negotiation_id, quantity, unit_price, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.store_id,
      leadId,
      productId,
      negotiationId,
      order.quantity,
      order.unitPrice,
      totalAmount,
      order.status
    ));
  }

  if (order.paymentLink) {
    upsertPaymentLink(db, orderId, order.paymentLink, now);
  }

  if (order.paymentEvent && order.paymentLink) {
    upsertPaymentEvent(db, orderId, order.paymentLink.externalId, order.paymentEvent.status, order.paymentEvent.payload);
  }

  if (order.delivery) {
    upsertDelivery(db, orderId, order.delivery, now);
  }

  return orderId;
}

function upsertPaymentLink(
  db: Database,
  orderId: number,
  paymentLink: NonNullable<DemoOrder['paymentLink']>,
  now: Date
) {
  const expiresAt = minutesFromNow(paymentLink.expiresInMinutes, now);
  const existing = db.prepare('SELECT id FROM payment_links WHERE order_id = ?').get(orderId) as IdRow | undefined;

  if (existing) {
    db.prepare(`
      UPDATE payment_links
      SET provider = ?, external_id = ?, url = ?, status = ?, expires_at = ?
      WHERE id = ?
    `).run('simulated', paymentLink.externalId, paymentLink.url, paymentLink.status, expiresAt, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO payment_links (order_id, provider, external_id, url, status, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(orderId, 'simulated', paymentLink.externalId, paymentLink.url, paymentLink.status, expiresAt);
}

function upsertPaymentEvent(
  db: Database,
  orderId: number,
  externalId: string,
  status: 'paid' | 'failed',
  payload: Record<string, unknown>
) {
  const serializedPayload = JSON.stringify({ ...payload, seed: true, orderId });
  const existing = db.prepare('SELECT id FROM payment_events WHERE external_id = ?').get(externalId) as IdRow | undefined;

  if (existing) {
    db.prepare('UPDATE payment_events SET order_id = ?, status = ?, payload = ? WHERE id = ?')
      .run(orderId, status, serializedPayload, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO payment_events (external_id, order_id, status, payload)
    VALUES (?, ?, ?, ?)
  `).run(externalId, orderId, status, serializedPayload);
}

function upsertDelivery(
  db: Database,
  orderId: number,
  delivery: NonNullable<DemoOrder['delivery']>,
  now: Date
) {
  const scheduledAt = minutesFromNow(delivery.scheduledInMinutes, now);
  const mapsUrl = buildMapsUrl(delivery.latitude, delivery.longitude);
  const existing = db.prepare('SELECT id FROM deliveries WHERE order_id = ?').get(orderId) as IdRow | undefined;

  if (existing) {
    db.prepare(`
      UPDATE deliveries
      SET delivery_type = ?, address_text = ?, latitude = ?, longitude = ?,
          maps_url = ?, status = ?, scheduled_at = ?
      WHERE id = ?
    `).run(
      delivery.deliveryType,
      delivery.addressText,
      delivery.latitude,
      delivery.longitude,
      mapsUrl,
      delivery.status,
      scheduledAt,
      existing.id
    );
    return;
  }

  db.prepare(`
    INSERT INTO deliveries (
      order_id, delivery_type, address_text, latitude, longitude, maps_url, status, scheduled_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId,
    delivery.deliveryType,
    delivery.addressText,
    delivery.latitude,
    delivery.longitude,
    mapsUrl,
    delivery.status,
    scheduledAt
  );
}

function countTables(db: Database): SeedSummary {
  return seedTableNames.reduce((summary, table) => {
    summary[table] = countRows(db, table);
    return summary;
  }, {} as SeedSummary);
}

function countRows(db: Database, table: SeedTableName) {
  return Number((db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as CountRow).count);
}
