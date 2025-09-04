// Orders API

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    
    const { results } = await db.prepare(`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    // Parse JSON items for each order
    const orders = results.map(order => ({
      ...order,
      items: JSON.parse(order.items || '[]')
    }));
    
    return Response.json({
      success: true,
      orders: orders
    });
    
  } catch (error) {
    console.error('Orders GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load orders'
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const order = await request.json();
    
    // Generate order number if not provided
    if (!order.order_number) {
      const now = new Date();
      const timestamp = now.getFullYear().toString().substr(-2) + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0') + 
                       now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0') + 
                       now.getSeconds().toString().padStart(2, '0');
      order.order_number = `SG-${timestamp}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    }
    
    const { success, meta } = await db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, 
                         customer_address, items, total_amount, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.customer_address,
      JSON.stringify(order.items || []),
      order.total_amount,
      order.status || 'Pending'
    ).run();
    
    if (!success) {
      throw new Error('Failed to create order');
    }
    
    // Return the created order
    const createdOrder = {
      id: meta.last_row_id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      items: order.items,
      total_amount: order.total_amount,
      status: order.status || 'Pending'
    };
    
    return Response.json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder
    });
    
  } catch (error) {
    console.error('Orders POST error:', error);
    return Response.json({
      success: false,
      message: 'Failed to create order'
    }, { status: 500 });
  }
}