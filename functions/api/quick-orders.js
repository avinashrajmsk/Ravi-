// Quick Orders API for WhatsApp bulk orders

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    
    const { results } = await db.prepare(`
      SELECT id, customer_name, customer_phone, message, status, admin_notes, created_at
      FROM quick_orders 
      ORDER BY created_at DESC
    `).all();
    
    return Response.json({
      success: true,
      orders: results
    });
    
  } catch (error) {
    console.error('Quick orders GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load quick orders'
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const orderData = await request.json();
    
    const { success, meta } = await db.prepare(`
      INSERT INTO quick_orders (customer_name, customer_phone, message, status, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      orderData.customer_name,
      orderData.customer_phone,
      orderData.message,
      'pending'
    ).run();
    
    if (!success) {
      throw new Error('Failed to save quick order');
    }
    
    return Response.json({
      success: true,
      message: 'Quick order saved successfully',
      order_id: meta.last_row_id
    });
    
  } catch (error) {
    console.error('Quick orders POST error:', error);
    return Response.json({
      success: false,
      message: 'Failed to save quick order'
    }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const orderData = await request.json();
    
    const { success } = await db.prepare(`
      UPDATE quick_orders 
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      orderData.status,
      orderData.admin_notes || '',
      orderData.id
    ).run();
    
    if (!success) {
      throw new Error('Failed to update quick order');
    }
    
    return Response.json({
      success: true,
      message: 'Quick order updated successfully'
    });
    
  } catch (error) {
    console.error('Quick orders PUT error:', error);
    return Response.json({
      success: false,
      message: 'Failed to update quick order'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}