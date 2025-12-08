/**
 * Users API - Handle user profile management
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { phone_number, name, email, address, pincode, city, state } = await request.json();
    
    if (!phone_number || !name) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Phone number and name are required' 
      }), { headers: corsHeaders });
    }

    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE phone_number = ?'
    ).bind(phone_number).first();

    if (existingUser) {
      // Update existing user
      await env.DB.prepare(`
        UPDATE users 
        SET name = ?, email = ?, address = ?, pincode = ?, city = ?, state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE phone_number = ?
      `).bind(name, email || null, address || null, pincode || null, city || null, state || null, phone_number).run();

      const updatedUser = await env.DB.prepare(
        'SELECT * FROM users WHERE phone_number = ?'
      ).bind(phone_number).first();

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User updated successfully',
        user: updatedUser
      }), { headers: corsHeaders });
    } else {
      // Create new user
      const result = await env.DB.prepare(`
        INSERT INTO users (phone_number, name, email, address, pincode, city, state)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(phone_number, name, email || null, address || null, pincode || null, city || null, state || null).run();

      const newUser = await env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(result.meta.last_row_id).first();

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        user: newUser
      }), { headers: corsHeaders });
    }

  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to save user data',
      error: error.message 
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const url = new URL(request.url);
    const phone_number = url.searchParams.get('phone_number');

    if (!phone_number) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Phone number is required' 
      }), { headers: corsHeaders });
    }

    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE phone_number = ?'
    ).bind(phone_number).first();

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User not found' 
      }), { 
        status: 404,
        headers: corsHeaders 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: user
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('User API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to fetch user data',
      error: error.message 
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
