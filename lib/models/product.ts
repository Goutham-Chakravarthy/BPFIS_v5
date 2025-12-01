import mongoose, { Document, Schema } from 'mongoose';

// Dimensions Interface
interface IDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

const DimensionsSchema = new Schema<IDimensions>({
  length: { type: Number, min: 0 },
  width: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  weight: { type: Number, min: 0 }
});

// Product Image Interface
interface IProductImage {
  url: string;
  alt: string;
  position: number;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: { type: String, required: true },
  position: { type: Number, required: true }
});

// Product Interface
export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  reorderThreshold: number;
  reorderLevel: number;
  maxStock: number;
  dimensions: IDimensions;
  specifications: Record<string, any>;
  images: IProductImage[];
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured: boolean;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  salesData: {
    totalSold: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
    viewCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product Schema
const ProductSchema = new Schema<IProduct>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'equipment', 'feed', 'other'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    index: true
  },
  reorderThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maxStock: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  dimensions: {
    type: DimensionsSchema,
    default: {}
  },
  specifications: {
    type: Schema.Types.Mixed,
    default: {}
  },
  images: [ProductImageSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft',
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  seo: {
    title: { type: String, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 160 },
    keywords: [{ type: String, trim: true, lowercase: true }]
  },
  salesData: {
    totalSold: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
ProductSchema.index({ sellerId: 1, status: 1 });
ProductSchema.index({ sellerId: 1, category: 1 });
ProductSchema.index({ sellerId: 1, featured: 1 });
ProductSchema.index({ sellerId: 1, stockQuantity: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ featured: 1, status: 1 });
ProductSchema.index({ 'salesData.totalSold': -1 });
ProductSchema.index({ 'salesData.totalRevenue': -1 });
ProductSchema.index({ 'salesData.averageRating': -1 });

// Text search index
ProductSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  sku: 'text'
});

// Pre-save middleware
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  next();
});

// Virtual for low stock status
ProductSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.reorderThreshold;
});

// Virtual for out of stock status
ProductSchema.virtual('isOutOfStock').get(function() {
  return this.stockQuantity === 0;
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
