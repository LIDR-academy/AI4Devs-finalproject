import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { config } from '../config.js';

export type Queryable = Pool | PoolClient;

export function createPostgresPool() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required for PostgreSQL runtime');
  }

  return new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined
  });
}

export async function migratePostgres(db: Queryable) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(id),
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      base_price DOUBLE PRECISION NOT NULL,
      min_price DOUBLE PRECISION NOT NULL,
      stock INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL UNIQUE REFERENCES products(id),
      max_discount_percent DOUBLE PRECISION NOT NULL,
      low_rotation_days INTEGER NOT NULL,
      low_stock_threshold INTEGER NOT NULL,
      approval_discount_threshold DOUBLE PRECISION NOT NULL,
      offer_expires_in_minutes INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id),
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(id),
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'whatsapp',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(store_id, phone)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      channel TEXT NOT NULL DEFAULT 'whatsapp',
      status TEXT NOT NULL DEFAULT 'open',
      automation_paused BOOLEAN NOT NULL DEFAULT FALSE,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      direction TEXT NOT NULL,
      body TEXT NOT NULL,
      provider_message_id TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS negotiations (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      initial_price DOUBLE PRECISION NOT NULL,
      proposed_price DOUBLE PRECISION NOT NULL,
      min_allowed_price DOUBLE PRECISION NOT NULL,
      discount_percent DOUBLE PRECISION NOT NULL,
      rationale TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'proposed',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(id),
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      negotiation_id INTEGER NOT NULL UNIQUE REFERENCES negotiations(id),
      quantity INTEGER NOT NULL,
      unit_price DOUBLE PRECISION NOT NULL,
      total_amount DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_links (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
      provider TEXT NOT NULL DEFAULT 'simulated',
      external_id TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_events (
      id SERIAL PRIMARY KEY,
      external_id TEXT NOT NULL UNIQUE,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      status TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
      delivery_type TEXT NOT NULL DEFAULT 'meetup',
      address_text TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      maps_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      scheduled_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    UPDATE conversations
    SET automation_paused = FALSE
    WHERE status IN ('waiting_payment', 'paid', 'delivery_scheduled')
      AND automation_paused = TRUE;
  `);
}

export async function withTransaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function first<T extends QueryResultRow>(rows: T[]) {
  return rows[0] as T | undefined;
}
