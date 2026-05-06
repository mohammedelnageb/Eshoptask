CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  order_number VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  user_email VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2),
  tax_amount NUMERIC(12, 2),
  shipping_amount NUMERIC(12, 2),
  grand_total NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(255),
  shipping_address TEXT,
  billing_address TEXT,
  payment_method VARCHAR(255),
  payment_status VARCHAR(255),
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  product_sku VARCHAR(255),
  product_name VARCHAR(255) NOT NULL,
  product_image_url VARCHAR(1024),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(38, 2)
);

CREATE TABLE IF NOT EXISTS order_events (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  order_number VARCHAR(255) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  event_status VARCHAR(80) NOT NULL,
  previous_state VARCHAR(255),
  new_state VARCHAR(255) NOT NULL,
  payload TEXT,
  user_id BIGINT,
  created_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_user ON orders(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
