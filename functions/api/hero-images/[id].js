// Hero images delete API - individual image by ID

export async function onRequestDelete({ request, env, params }) {
  try {
    const db = env.DB;
    const { id } = params;
    
    if (!id) {
      return Response.json({
        success: false,
        message: 'Hero image ID is required'
      }, { status: 400 });
    }
    
    // Check if image exists
    const { results } = await db.prepare(`
      SELECT id FROM hero_images WHERE id = ?
    `).bind(id).all();
    
    if (!results.length) {
      return Response.json({
        success: false,
        message: 'Hero image not found'
      }, { status: 404 });
    }
    
    // Delete the hero image
    const { success } = await db.prepare(`
      DELETE FROM hero_images WHERE id = ?
    `).bind(id).run();
    
    if (!success) {
      throw new Error('Failed to delete hero image');
    }
    
    return Response.json({
      success: true,
      message: 'Hero image deleted successfully'
    });
    
  } catch (error) {
    console.error('Hero images DELETE error:', error);
    return Response.json({
      success: false,
      message: 'Failed to delete hero image'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}