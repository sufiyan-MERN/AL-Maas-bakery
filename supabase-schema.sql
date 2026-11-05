-- ========================================================
-- AL MAAS BAKERY – SUPABASE POSTGRESQL SCHEMA & INITIAL DATA
-- Copy and paste this directly into your Supabase SQL Editor
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  weight TEXT,
  image TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- 2. DELIVERY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS delivery_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  shop_address TEXT NOT NULL,
  shop_lat NUMERIC NOT NULL,
  shop_lng NUMERIC NOT NULL,
  is_delivery_enabled BOOLEAN DEFAULT true,
  min_order_amount NUMERIC DEFAULT 0,
  max_delivery_distance NUMERIC DEFAULT 15,
  pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Delivery Settings (Al Maas Bakery: Sultan Palya Main Road, Bengaluru)
INSERT INTO delivery_settings (id, shop_address, shop_lat, shop_lng, is_delivery_enabled, min_order_amount, max_delivery_distance, pricing_tiers)
VALUES (
  1,
  'No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032',
  13.0279242,
  77.5282725,
  true,
  0,
  15,
  '[
    {"id": "tier-1", "minKm": 0, "maxKm": 2, "price": 20},
    {"id": "tier-2", "minKm": 2, "maxKm": 5, "price": 40},
    {"id": "tier-3", "minKm": 5, "maxKm": 8, "price": 60},
    {"id": "tier-4", "minKm": 8, "maxKm": 15, "price": 100}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  customer_whatsapp TEXT,
  house_number TEXT NOT NULL,
  street_area TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  delivery_lat NUMERIC,
  delivery_lng NUMERIC,
  delivery_instructions TEXT,
  subtotal NUMERIC NOT NULL,
  delivery_distance_km NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  final_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  cancellation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT,
  subtotal NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. ACTIVITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL DEFAULT 'admin@al-maas.com',
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  related_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- ========================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read and write access with anon key (custom security in app layer)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true);

CREATE POLICY "Public read delivery_settings" ON delivery_settings FOR SELECT USING (true);
CREATE POLICY "Public write delivery_settings" ON delivery_settings FOR ALL USING (true);

CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public write orders" ON orders FOR ALL USING (true);

CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public write order_items" ON order_items FOR ALL USING (true);

CREATE POLICY "Public read activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Public write activity_logs" ON activity_logs FOR ALL USING (true);

