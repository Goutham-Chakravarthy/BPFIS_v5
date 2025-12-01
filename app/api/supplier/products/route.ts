import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/models/product';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

function getSellerId(request: NextRequest): string | null {
  return request.headers.get('x-seller-id') || null;
}

// GET /api/supplier/products - Get seller's products
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const sellerId = getSellerId(request);
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 401 });
    }

    // For development, handle temp seller ID without ObjectId validation
    if (sellerId === 'temp-seller-id') {
      return NextResponse.json({
        products: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      });
    }

    // For testing, allow mock seller IDs
    if (sellerId === '65a1b2c3d4e5f6789012345') {
      console.log('⚠️ Using test seller ID for development (GET)');
      // Skip seller validation for testing
    } else {
      // Validate seller exists
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    // Build query
    const query: any = { sellerId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get products with pagination
    const skip = (page - 1) * limit;
    
    let products, totalCount;
    
    // For test seller ID, use direct MongoDB query
    if (sellerId === '65a1b2c3d4e5f6789012345') {
      const db = mongoose.connection.db;
      const productsCursor = db.collection('products')
        .find({ sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      products = await productsCursor.toArray();
      totalCount = await db.collection('products').countDocuments({ sellerId });
    } else {
      // Use Mongoose model for real sellers
      [products, totalCount] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('name sku price stockQuantity status category images salesData createdAt')
          .lean(),
        Product.countDocuments(query)
      ]);
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error(' Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/supplier/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const sellerId = getSellerId(request);
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 401 });
    }

    // For development, handle test seller IDs without ObjectId validation
    if (sellerId === 'temp-seller-id') {
      return NextResponse.json(
        { error: 'Cannot create products with temporary seller ID' },
        { status: 400 }
      );
    }

    // For testing, allow mock seller IDs
    if (sellerId === '65a1b2c3d4e5f6789012345') {
      console.log('⚠️ Using test seller ID for development');
      // Skip seller validation for testing
    } else {
      // Validate seller exists
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }
    }

    // Handle FormData (for file uploads)
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData with file uploads
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price'),
        stockQuantity: formData.get('stockQuantity'),
        reorderThreshold: formData.get('reorderThreshold'),
        tags: JSON.parse(formData.get('tags') as string || '[]'),
        dimensions: JSON.parse(formData.get('dimensions') as string || '{}'),
        images: [] as string[]
      };
      
      // Handle image files
      const imageFiles = formData.getAll('images') as File[];
      console.log('Received image files:', imageFiles.length);
      
      // For now, just log the files - in production, you'd upload to cloud storage
      // and store the URLs in the images array
      
    } else {
      // Handle regular JSON (no file uploads)
      body = await request.json();
    }

    const {
      name,
      sku,
      description,
      category,
      subcategory,
      tags,
      price,
      comparePrice,
      costPrice,
      stockQuantity,
      reorderThreshold,
      reorderLevel,
      maxStock,
      dimensions,
      specifications,
      images,
      seo
    } = body;

    // Validate required fields
    if (!name || !sku || !description || !category || !price || stockQuantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, description, category, price, stockQuantity' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Create new product using a simple approach (bypassing model getters)
    const productData = {
      sellerId,
      name,
      sku,
      slug,
      description,
      category,
      subcategory,
      tags: tags || [],
      price,
      comparePrice,
      costPrice,
      stockQuantity,
      reorderThreshold: reorderThreshold || 5,
      reorderLevel: reorderLevel || 10,
      maxStock: maxStock || 1000,
      dimensions: dimensions || {},
      specifications: specifications || {},
      images: images || [],
      status: 'draft',
      featured: false,
      seo: seo || {},
      salesData: {
        totalSold: 0,
        totalRevenue: 0,
        averageRating: 0,
        reviewCount: 0,
        viewCount: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating product with data:', productData);

    // Use direct MongoDB insertion to bypass Mongoose model issues
    const db = mongoose.connection.db;
    const result = await db.collection('products').insertOne(productData);
    
    const createdProduct = {
      _id: result.insertedId,
      ...productData
    };

    console.log('✅ Product created:', { id: createdProduct._id, sku, name });

    return NextResponse.json({
      message: 'Product created successfully',
      product: createdProduct
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      const field = Object.keys((error as any).keyValue)[0];
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
