// Admin change password API

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const { current_password, new_password } = await request.json();
    
    // Get admin record
    const { results } = await db.prepare(`
      SELECT * FROM admin_auth WHERE username = 'admin'
    `).bind().all();
    
    if (results.length === 0) {
      return Response.json({
        success: false,
        message: 'Admin account not found'
      }, { status: 404 });
    }
    
    const admin = results[0];
    
    // If this is first time setup (no password set)
    if (!admin.password_hash && !current_password) {
      // Set new password
      await db.prepare(`
        UPDATE admin_auth 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(new_password, admin.id).run();
      
      return Response.json({
        success: true,
        message: 'Password set successfully'
      });
    }
    
    // Verify current password
    if (admin.password_hash !== current_password) {
      return Response.json({
        success: false,
        message: 'Current password is incorrect'
      }, { status: 401 });
    }
    
    // Update password
    await db.prepare(`
      UPDATE admin_auth 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(new_password, admin.id).run();
    
    return Response.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    return Response.json({
      success: false,
      message: 'Failed to change password'
    }, { status: 500 });
  }
}