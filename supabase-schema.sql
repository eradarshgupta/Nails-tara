-- Run this once in Supabase Dashboard → SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       INTEGER NOT NULL,          -- in paise (₹1 = 100)
  sale_price  INTEGER DEFAULT NULL,
  shapes      TEXT[] DEFAULT '{}',
  lengths     TEXT[] DEFAULT '{}',
  finishes    TEXT[] DEFAULT '{}',
  tags        TEXT[] DEFAULT '{}',
  images      TEXT[] DEFAULT '{}',
  in_stock    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,
  order_number        TEXT UNIQUE NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT,
  customer_phone      TEXT NOT NULL,
  delivery_address    JSONB DEFAULT '{}',
  items               JSONB DEFAULT '[]',
  subtotal            INTEGER DEFAULT 0,
  shipping            INTEGER DEFAULT 0,
  total               INTEGER DEFAULT 0,
  payment_method      TEXT DEFAULT 'cod',
  payment_status      TEXT DEFAULT 'pending',
  order_status        TEXT DEFAULT 'pending',
  razorpay_order_id   TEXT DEFAULT NULL,
  razorpay_payment_id TEXT DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 4 demo products so the shop looks good immediately
INSERT INTO products (id, slug, name, description, price, sale_price, shapes, lengths, finishes, tags, images, in_stock)
VALUES
  (
    'demo-1', 'rose-chrome-coffin', 'Rosé Chrome Coffin',
    'Dreamy rose chrome finish with a coffin shape. Perfect for date nights and celebrations.',
    89900, 74900,
    ARRAY['coffin'], ARRAY['medium','long'], ARRAY['chrome'],
    ARRAY['bestseller','new'],
    ARRAY['https://images.pexels.com/photos/7664093/pexels-photo-7664093.jpeg?auto=compress&cs=tinysrgb&w=800'],
    TRUE
  ),
  (
    'demo-2', 'bridal-french-almond', 'Bridal French Almond',
    'Classic French tip on a flattering almond shape. Timeless and elegant for brides.',
    99900, NULL,
    ARRAY['almond'], ARRAY['medium'], ARRAY['glossy'],
    ARRAY['bridal','bestseller'],
    ARRAY['https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800'],
    TRUE
  ),
  (
    'demo-3', 'midnight-matte-square', 'Midnight Matte Square',
    'Bold black matte square nails for the modern woman. Statement-making and fierce.',
    79900, NULL,
    ARRAY['square'], ARRAY['medium','long'], ARRAY['matte'],
    ARRAY['new','bold'],
    ARRAY['https://images.pexels.com/photos/5128012/pexels-photo-5128012.jpeg?auto=compress&cs=tinysrgb&w=800'],
    TRUE
  ),
  (
    'demo-4', 'nude-glitter-stiletto', 'Nude Glitter Stiletto',
    'Subtle nude base with fine glitter. Versatile enough for office to party.',
    84900, 69900,
    ARRAY['stiletto'], ARRAY['long','extra long'], ARRAY['glitter'],
    ARRAY['everyday','festive'],
    ARRAY['https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800'],
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
