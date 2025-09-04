// Update order status API

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const orderId = params.id;
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return Response.json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      }, { status: 400 });
    }
    
    const { success } = await db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, orderId).run();
    
    if (!success) {
      throw new Error('Failed to update order status');
    }
    
    return Response.json({
      success: true,
      message: 'Order status updated successfully'
    });
    
  } catch (error) {
    console.error('Order status PUT error:', error);
    return Response.json({
      success: false,
      message: 'Failed to update order status'
    }, { status: 500 });
  }
}