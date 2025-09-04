-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin Authentication Table
CREATE TABLE IF NOT EXISTS admin_auth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL DEFAULT 'admin',
  password_hash TEXT DEFAULT NULL,
  session_token TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  image_url TEXT,
  category TEXT DEFAULT 'General',
  in_stock INTEGER DEFAULT 1,
  weight_options TEXT DEFAULT '1,5,10',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON string of cart items
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hero Slider Images Table
CREATE TABLE IF NOT EXISTS hero_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(active);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);