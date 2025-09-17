// Get user orders by user ID
export async function onRequestGet(context) {
    const { params, env } = context;
    const { userId } = params;

    try {
        // Get user orders from database
        const ordersQuery = await env.DB.prepare(`
            SELECT 
                id,
                user_id,
                items,
                total_amount,
                total_items,
                customer_name,
                customer_phone,
                customer_address,
                status,
                status_message,
                created_at
            FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).bind(userId).all();

        const orders = ordersQuery.results || [];

        // Parse items JSON for each order
        const ordersWithItems = orders.map(order => ({
            ...order,
            items: JSON.parse(order.items || '[]')
        }));

        return new Response(JSON.stringify({
            success: true,
            orders: ordersWithItems,
            count: orders.length
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error fetching user orders:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch orders'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}