// Single product API

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    const productId = params.id;
    
    const { results } = await db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).bind(productId).all();
    
    if (results.length === 0) {
      return Response.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      product: results[0]
    });
    
  } catch (error) {
    console.error('Product GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load product'
    }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const productId = params.id;
    const product = await request.json();
    
    const { success } = await db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, unit = ?, image_url = ?, 
          category = ?, in_stock = ?, weight_options = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      product.name,
      product.description || '',
      product.price,
      product.unit || 'kg',
      product.image_url || '',
      product.category || 'General',
      product.in_stock ? 1 : 0,
      product.weight_options || '1',
      productId
    ).run();
    
    if (!success) {
      throw new Error('Failed to update product');
    }
    
    return Response.json({
      success: true,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Product PUT error:', error);
    return Response.json({
      success: false,
      message: 'Failed to update product'
    }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    const db = env.DB;
    const productId = params.id;
    
    const { success } = await db.prepare(`
      DELETE FROM products WHERE id = ?
    `).bind(productId).run();
    
    if (!success) {
      throw new Error('Failed to delete product');
    }
    
    return Response.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Product DELETE error:', error);
    return Response.json({
      success: false,
      message: 'Failed to delete product'
    }, { status: 500 });
  }
}