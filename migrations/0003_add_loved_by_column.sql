-- Add loved_by and original_price columns to products table
ALTER TABLE products ADD COLUMN loved_by INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN original_price REAL DEFAULT NULL;