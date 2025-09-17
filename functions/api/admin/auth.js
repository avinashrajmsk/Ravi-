// Admin authentication API

const ADMIN_CREDENTIALS = {
  email: 'avinashrajmsk@gmail.com',
  password: 'Satyam16'
};

export async function onRequestPost({ request, env, params }) {
  try {
    const credentials = await request.json();
    
    // Validate credentials
    if (!credentials.email || !credentials.password) {
      return Response.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Check credentials
    if (credentials.email === ADMIN_CREDENTIALS.email && 
        credentials.password === ADMIN_CREDENTIALS.password) {
      
      // Generate session token
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Store session in database
      const db = env.DB;
      await db.prepare(`
        INSERT OR REPLACE INTO admin_auth (username, session_token, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind('admin', sessionToken).run();
      
      return Response.json({
        success: true,
        message: 'Login successful',
        token: sessionToken
      });
      
    } else {
      return Response.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Admin auth error:', error);
    return Response.json({
      success: false,
      message: 'Authentication failed'
    }, { status: 500 });
  }
}

export async function onRequestGet({ request, env, params }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }
    
    // Verify token in database
    const db = env.DB;
    const { results } = await db.prepare(`
      SELECT session_token FROM admin_auth 
      WHERE session_token = ? AND updated_at > datetime('now', '-24 hours')
    `).bind(token).all();
    
    if (results.length > 0) {
      return Response.json({
        success: true,
        message: 'Token valid'
      });
    } else {
      return Response.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Admin token verification error:', error);
    return Response.json({
      success: false,
      message: 'Token verification failed'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}