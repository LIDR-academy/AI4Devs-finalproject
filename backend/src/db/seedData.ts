import type { Database } from './database.js';

export function seedDemoData(db: Database) {
  const store = db.prepare('SELECT id FROM stores WHERE name = ?').get('ComercIA Demo Store') as { id: number } | undefined;
  const storeId = store?.id ?? Number(db.prepare(`
    INSERT INTO stores (name, phone) VALUES (?, ?)
  `).run('ComercIA Demo Store', '+573001112233').lastInsertRowid);

  const product = db.prepare('SELECT id FROM products WHERE sku = ?').get('AUD-BT-001') as { id: number } | undefined;
  const productId = product?.id ?? Number(db.prepare(`
    INSERT INTO products (
      store_id, sku, name, description, category, base_price, min_price, stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    'AUD-BT-001',
    'Audifonos Bluetooth Pro',
    'Audifonos inalambricos con cancelacion de ruido.',
    'Electronica',
    180000,
    145000,
    12
  ).lastInsertRowid);

  if (product?.id) {
    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, category = ?, base_price = ?, min_price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      'Audifonos Bluetooth Pro',
      'Audifonos inalambricos con cancelacion de ruido.',
      'Electronica',
      180000,
      145000,
      12,
      productId
    );
  }

  const rule = db.prepare('SELECT id FROM pricing_rules WHERE product_id = ?').get(productId);
  if (rule) {
    db.prepare(`
      UPDATE pricing_rules
      SET max_discount_percent = ?, low_rotation_days = ?, low_stock_threshold = ?,
          approval_discount_threshold = ?, offer_expires_in_minutes = ?, active = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `).run(18, 14, 3, 15, 30, productId);
  } else {
    db.prepare(`
      INSERT INTO pricing_rules (
        product_id, max_discount_percent, low_rotation_days, low_stock_threshold,
        approval_discount_threshold, offer_expires_in_minutes, active
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(productId, 18, 14, 3, 15, 30);
  }

  const movement = db.prepare(`
    SELECT id FROM inventory_movements WHERE product_id = ? AND type = 'initial'
  `).get(productId);

  if (!movement) {
    db.prepare(`
      INSERT INTO inventory_movements (product_id, type, quantity, reason)
      VALUES (?, ?, ?, ?)
    `).run(productId, 'initial', 12, 'Seed stock');
  }
}

