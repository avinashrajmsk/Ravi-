// Products API

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    
    const { results } = await db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return Response.json({
      success: true,
      products: results
    });
    
  } catch (error) {
    console.error('Products GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load products'
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const product = await request.json();
    
    const { success, meta } = await db.prepare(`
      INSERT INTO products (name, description, price, unit, image_url, category, in_stock, weight_options, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      product.name,
      product.description || '',
      product.price,
      product.unit || 'kg',
      product.image_url || '',
      product.category || 'General',
      product.in_stock ? 1 : 0,
      product.weight_options || '1'
    ).run();
    
    if (!success) {
      throw new Error('Failed to insert product');
    }
    
    return Response.json({
      success: true,
      message: 'Product added successfully',
      product_id: meta.last_row_id
    });
    
  } catch (error) {
    console.error('Products POST error:', error);
    return Response.json({
      success: false,
      message: 'Failed to add product'
    }, { status: 500 });
  }
}