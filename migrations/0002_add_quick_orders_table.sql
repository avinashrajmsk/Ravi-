-- Quick Orders Table for WhatsApp bulk orders
CREATE TABLE IF NOT EXISTS quick_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing orders table for user authentication integration
ALTER TABLE orders ADD COLUMN user_id TEXT;
ALTER TABLE orders ADD COLUMN total_items INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN status_message TEXT;

-- Create index for quick orders
CREATE INDEX IF NOT EXISTS idx_quick_orders_status ON quick_orders(status);
CREATE INDEX IF NOT EXISTS idx_quick_orders_phone ON quick_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);