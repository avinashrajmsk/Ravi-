-- Default Site Settings
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES 
  ('site_name', 'SATYAM GOLD'),
  ('site_logo', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_100012467.png'),
  ('primary_color', '#F97316'),
  ('secondary_color', '#FED7AA'),
  ('footer_text', '© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep.'),
  ('phone_number', '9631816666'),
  ('whatsapp_number', '6201530654'),
  ('email_address', 'avinash@gmail.com'),
  ('business_address', ''),
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('whatsapp_chat_url', 'https://wa.me/916201530654'),
  ('facebook_logo', ''),
  ('instagram_logo', ''),
  ('whatsapp_logo', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/01a0a43b4_100016121.png');

-- Default Admin (No password initially)
INSERT OR IGNORE INTO admin_auth (username, password_hash) VALUES 
  ('admin', NULL);

-- Sample Products
INSERT OR IGNORE INTO products (name, description, price, unit, image_url, category, weight_options) VALUES 
  ('Sattu', 'Premium quality atta made with traditional methods', 60, 'kg', 'https://example.com/sattu.jpg', 'Flour', '1,5,10'),
  ('Nijra', 'Traditional nijra flour for authentic taste', 55, 'kg', 'https://example.com/nijra.jpg', 'Flour', '1,5,10'),
  ('Multi-Grain Atta', 'Healthy multi-grain flour blend', 180, 'kg', 'https://example.com/multigrain.jpg', 'Flour', '1,5,10'),
  ('Premium Wheat Atta', 'Stone-milled whole wheat flour made from the finest quality wheat grains. Rich in fiber and nutrition', 40, 'kg', 'https://example.com/wheat-atta.jpg', 'Flour', '1,5,10,25');

-- Default Hero Slider Images
INSERT OR IGNORE INTO hero_images (image_url, title, subtitle, button_text, button_link, active, sort_order) VALUES 
  ('https://base44.app/api/apps/68a375197577ce82d3f4980e/files/6336e6cce_100016130.png', 'GOLD HARVEST WHEAT FLOUR', 'Grown Without Chemicals. Packed With Goodness', 'Shop Now', '/products', 1, 1);

-- Sample Orders (for demonstration)
INSERT OR IGNORE INTO orders (order_number, customer_name, customer_email, customer_phone, customer_address, items, total_amount, status) VALUES 
  ('SG-175578001802', 'AVINASH FF', 'avinashrajmsk@gmail.com', '9631816666', 'Sample Address, City', '[{"name":"Multi-Grain Atta","price":180,"quantity":1,"weight":"1kg"}]', 180.00, 'Pending'),
  ('SG-175554479738', 'AVINASH FF', 'avinashrajmsk@gmail.com', '9631816666', 'Sample Address, City', '[{"name":"Multi-Grain Atta","price":65,"quantity":1,"weight":"1kg"}]', 65.00, 'Shipped');