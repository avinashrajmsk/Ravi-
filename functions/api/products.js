// Products API - Complete CRUD operations

export async function onRequestGet({ request, env, params }) {
  try {
    const db = env.DB;
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    
    // Get single product by ID
    if (productId) {
      const product = await db.prepare(`
        SELECT * FROM products WHERE id = ?
      `).bind(productId).first();
      
      if (!product) {
        return Response.json({
          success: false,
          message: 'Product not found'
        }, { status: 404 });
      }
      
      return Response.json({
        success: true,
        product: product
      });
    }
    
    // Get all products with pagination
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    
    const { results } = await db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return Response.json({
      success: true,
      products: results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Products GET error:', error);
    return Response.json({
      success: false,
      message: 'Failed to load products',
      error: error.message
    }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = env.DB;
    const product = await request.json();
    
    console.log('Adding product:', product);
    
    // Validate required fields
    if (!product.name || !product.price) {
      return Response.json({
        success: false,
        message: 'Product name and price are required'
      }, { status: 400 });
    }
    
    const { success, meta } = await db.prepare(`
      INSERT INTO products (name, description, price, original_price, unit, image_url, 
                           category, in_stock, weight_options, loved_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      product.name,
      product.description || '',
      parseFloat(product.price),
      parseFloat(product.original_price || product.price),
      product.unit || 'kg',
      product.image_url || '/images/placeholder-product.jpg',
      product.category || 'General',
      product.in_stock ? 1 : 0,
      product.weight_options || '1',
      parseInt(product.loved_by || 0)
    ).run();
    
    if (!success) {
      throw new Error('Failed to insert product');
    }
    
    console.log('Product added with ID:', meta.last_row_id);
    
    return Response.json({
      success: true,
      message: 'Product added successfully',
      product_id: meta.last_row_id
    });
    
  } catch (error) {
    console.error('Products POST error:', error);
    return Response.json({
      success: false,
      message: 'Failed to add product',
      error: error.message
    }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    const db = env.DB;
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    const product = await request.json();
    
    console.log('Updating product ID:', productId, product);
    
    if (!productId) {
      return Response.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }
    
    // Check if product exists
    const existing = await db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).bind(productId).first();
    
    if (!existing) {
      return Response.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }
    
    const { success } = await db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, original_price = ?, unit = ?, 
          image_url = ?, category = ?, in_stock = ?, weight_options = ?, 
          loved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      product.name || existing.name,
      product.description !== undefined ? product.description : existing.description,
      product.price !== undefined ? parseFloat(product.price) : existing.price,
      product.original_price !== undefined ? parseFloat(product.original_price) : existing.original_price,
      product.unit || existing.unit,
      product.image_url || existing.image_url,
      product.category || existing.category,
      product.in_stock !== undefined ? (product.in_stock ? 1 : 0) : existing.in_stock,
      product.weight_options || existing.weight_options,
      product.loved_by !== undefined ? parseInt(product.loved_by) : existing.loved_by,
      productId
    ).run();
    
    if (!success) {
      throw new Error('Failed to update product');
    }
    
    console.log('Product updated successfully');
    
    return Response.json({
      success: true,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Products PUT error:', error);
    return Response.json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    const db = env.DB;
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    
    console.log('Deleting product ID:', productId);
    
    if (!productId) {
      return Response.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }
    
    const { success } = await db.prepare(`
      DELETE FROM products WHERE id = ?
    `).bind(productId).run();
    
    if (!success) {
      throw new Error('Failed to delete product');
    }
    
    console.log('Product deleted successfully');
    
    return Response.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Products DELETE error:', error);
    return Response.json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
