// Bulk order request API

export async function onRequestPost({ request, env, params }) {
  try {
    const orderData = await request.json();
    
    // For now, we'll just return success and log the request
    // In the future, this could send emails or store in database
    
    console.log('Bulk order request:', {
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      product_name: orderData.product_name,
      quantity: orderData.quantity,
      requirements: orderData.requirements,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      message: 'Thank you for your bulk order request. We will contact you with pricing and availability.'
    });
    
  } catch (error) {
    console.error('Bulk order error:', error);
    return Response.json({
      success: false,
      message: 'Failed to submit bulk order request. Please try again.'
    }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}