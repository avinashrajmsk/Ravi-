// Admin login API (placeholder for future implementation)

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const { username, password } = await request.json();
    
    // Get admin credentials
    const { results } = await db.prepare(`
      SELECT * FROM admin_auth WHERE username = ?
    `).bind(username || 'admin').all();
    
    if (results.length === 0) {
      return Response.json({
        success: false,
        message: 'Admin account not found'
      }, { status: 401 });
    }
    
    const admin = results[0];
    
    // If no password is set (first time), allow login
    if (!admin.password_hash) {
      // Generate session token
      const sessionToken = crypto.randomUUID();
      
      await db.prepare(`
        UPDATE admin_auth 
        SET session_token = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(sessionToken, admin.id).run();
      
      return Response.json({
        success: true,
        message: 'Login successful',
        token: sessionToken,
        first_login: true
      });
    }
    
    // For now, we'll implement a simple password check
    // In production, use proper password hashing like bcrypt
    if (admin.password_hash !== password) {
      return Response.json({
        success: false,
        message: 'Invalid password'
      }, { status: 401 });
    }
    
    // Generate session token
    const sessionToken = crypto.randomUUID();
    
    await db.prepare(`
      UPDATE admin_auth 
      SET session_token = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(sessionToken, admin.id).run();
    
    return Response.json({
      success: true,
      message: 'Login successful',
      token: sessionToken
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 });
  }
}