// Hero images API

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    
    const { results } = await db.prepare(`
      SELECT * FROM hero_images 
      WHERE active = 1
      ORDER BY sort_order ASC, created_at DESC
    `).all();
    
    return Response.json({
      success: true,
      images: results
    });
    
  } catch (error) {
    console.error('Hero images GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load hero images'
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const image = await request.json();
    
    const { success, meta } = await db.prepare(`
      INSERT INTO hero_images (image_url, title, subtitle, button_text, button_link, 
                              active, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      image.image_url,
      image.title || '',
      image.subtitle || '',
      image.button_text || '',
      image.button_link || '',
      image.active ? 1 : 0,
      image.sort_order || 0
    ).run();
    
    if (!success) {
      throw new Error('Failed to add hero image');
    }
    
    return Response.json({
      success: true,
      message: 'Hero image added successfully',
      image_id: meta.last_row_id
    });
    
  } catch (error) {
    console.error('Hero images POST error:', error);
    return Response.json({
      success: false,
      message: 'Failed to add hero image'
    }, { status: 500 });
  }
}