-- Create cart_items table for persistent cart storage
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  product_image TEXT,
  quantity INTEGER DEFAULT 1,
  weight TEXT DEFAULT '1kg',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create index for faster cart lookups by user
CREATE INDEX IF NOT EXISTS idx_cart_user_phone ON cart_items(user_phone);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

-- Create cart_history table for tracking all cart actions
CREATE TABLE IF NOT EXISTS cart_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_phone TEXT NOT NULL,
  user_name TEXT,
  action TEXT NOT NULL, -- 'add', 'remove', 'update', 'checkout'
  product_id INTEGER,
  product_name TEXT,
  quantity INTEGER,
  details TEXT, -- JSON string with additional details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for cart history
CREATE INDEX IF NOT EXISTS idx_cart_history_user ON cart_history(user_phone);
CREATE INDEX IF NOT EXISTS idx_cart_history_date ON cart_history(created_at);
