// Contact form API

export async function onRequestPost({ request, env, params }) {
  try {
    const formData = await request.json();
    
    // For now, we'll just return success
    // In the future, this could send emails or store messages in database
    
    console.log('Contact form submission:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.requirements || formData.message,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      message: 'Thank you for your message. We will contact you soon!'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({
      success: false,
      message: 'Failed to send message. Please try again.'
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