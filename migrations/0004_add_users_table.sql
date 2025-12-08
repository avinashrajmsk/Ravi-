-- Create users table for storing user profile data
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  pincode TEXT,
  city TEXT,
  state TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster phone number lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);

-- Create user_orders table to link users with their orders
CREATE TABLE IF NOT EXISTS user_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Update orders table to include user information
ALTER TABLE orders ADD COLUMN user_phone TEXT;
ALTER TABLE orders ADD COLUMN user_name TEXT;
ALTER TABLE orders ADD COLUMN user_address TEXT;
ALTER TABLE orders ADD COLUMN user_pincode TEXT;
