// Site settings API

export async function onRequestGet({ env, params }) {
  try {
    const db = env.DB;
    
    // Get all site settings
    const { results } = await db.prepare(`
      SELECT setting_key, setting_value 
      FROM site_settings 
      ORDER BY setting_key
    `).all();
    
    // Convert to object
    const settings = {};
    results.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    return Response.json({
      success: true,
      settings: settings
    });
    
  } catch (error) {
    console.error('Settings GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load settings'
    }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const settings = await request.json();
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db.prepare(`
        INSERT INTO site_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) 
        DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(key, value, value).run();
    }
    
    return Response.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Settings PUT error:', error);
    return Response.json({
      success: false,
      message: 'Failed to update settings'
    }, { status: 500 });
  }
}