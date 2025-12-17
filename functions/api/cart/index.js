/**
 * Cart API - Persistent cart storage and history
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// GET - Fetch user's cart items
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const userPhone = url.searchParams.get('phone');
    
    if (!userPhone) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Phone number is required'
      }), { headers: corsHeaders, status: 400 });
    }
    
    // Fetch cart items for user
    const { results } = await env.DB.prepare(`
      SELECT * FROM cart_items 
      WHERE user_phone = ?
      ORDER BY created_at DESC
    `).bind(userPhone).all();
    
    return new Response(JSON.stringify({
      success: true,
      cart_items: results,
      count: results.length
    }), { headers: corsHeaders });
    
  } catch (error) {
    console.error('Cart GET error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    }), { headers: corsHeaders, status: 500 });
  }
}

// POST - Add item to cart
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { user_phone, product_id, product_name, product_price, product_image, quantity, weight } = data;
    
    if (!user_phone || !product_id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User phone and product ID are required'
      }), { headers: corsHeaders, status: 400 });
    }
    
    // Check if item already exists
    const existing = await env.DB.prepare(`
      SELECT * FROM cart_items 
      WHERE user_phone = ? AND product_id = ? AND weight = ?
    `).bind(user_phone, product_id, weight || '1kg').first();
    
    if (existing) {
      // Update quantity
      await env.DB.prepare(`
        UPDATE cart_items 
        SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(quantity || 1, existing.id).run();
      
      // Log history
      await env.DB.prepare(`
        INSERT INTO cart_history (user_phone, action, product_id, product_name, quantity, details)
        VALUES (?, 'update', ?, ?, ?, ?)
      `).bind(
        user_phone,
        product_id,
        product_name,
        quantity || 1,
        JSON.stringify({ weight, new_quantity: existing.quantity + (quantity || 1) })
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Cart item updated'
      }), { headers: corsHeaders });
      
    } else {
      // Add new item
      await env.DB.prepare(`
        INSERT INTO cart_items (user_phone, product_id, product_name, product_price, product_image, quantity, weight)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user_phone,
        product_id,
        product_name,
        product_price,
        product_image || '',
        quantity || 1,
        weight || '1kg'
      ).run();
      
      // Log history
      await env.DB.prepare(`
        INSERT INTO cart_history (user_phone, action, product_id, product_name, quantity, details)
        VALUES (?, 'add', ?, ?, ?, ?)
      `).bind(
        user_phone,
        product_id,
        product_name,
        quantity || 1,
        JSON.stringify({ weight })
      ).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Item added to cart'
      }), { headers: corsHeaders });
    }
    
  } catch (error) {
    console.error('Cart POST error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to add to cart',
      error: error.message
    }), { headers: corsHeaders, status: 500 });
  }
}

// DELETE - Remove item from cart
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const cartItemId = url.searchParams.get('id');
    const userPhone = url.searchParams.get('phone');
    
    if (!cartItemId || !userPhone) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Cart item ID and phone are required'
      }), { headers: corsHeaders, status: 400 });
    }
    
    // Get item details before deleting
    const item = await env.DB.prepare(`
      SELECT * FROM cart_items WHERE id = ? AND user_phone = ?
    `).bind(cartItemId, userPhone).first();
    
    if (item) {
      // Delete item
      await env.DB.prepare(`
        DELETE FROM cart_items WHERE id = ? AND user_phone = ?
      `).bind(cartItemId, userPhone).run();
      
      // Log history
      await env.DB.prepare(`
        INSERT INTO cart_history (user_phone, action, product_id, product_name, quantity, details)
        VALUES (?, 'remove', ?, ?, ?, ?)
      `).bind(
        userPhone,
        item.product_id,
        item.product_name,
        item.quantity,
        JSON.stringify({ weight: item.weight })
      ).run();
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Item removed from cart'
    }), { headers: corsHeaders });
    
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to remove from cart',
      error: error.message
    }), { headers: corsHeaders, status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
