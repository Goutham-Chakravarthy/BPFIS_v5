import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/models/product';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();

    // Get a seller for the products
    const seller = await Seller.findOne({ companyName: 'Demo Agricultural Supplies' });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const sampleProducts = [
      {
        name: 'Premium Wheat Seeds - High Yield Variety',
        description: 'High-quality wheat seeds suitable for Indian climate. Disease resistant and high yielding variety perfect for commercial farming.',
        price: 299,
        category: 'seeds',
        sellerId: seller._id,
        inventory: {
          currentStock: 150,
          lowStockThreshold: 20,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['wheat', 'seeds', 'high-yield', 'organic'],
        rating: 4.5,
        reviewCount: 23,
        specifications: {
          variety: 'HD-2967',
          germination: '85%',
          purity: '98%',
          seedRate: '100 kg/ha',
          maturity: '120-130 days'
        },
        featured: true
      },
      {
        name: 'Organic Bio Fertilizer - NPK Rich',
        description: '100% organic bio-fertilizer rich in Nitrogen, Phosphorus, and Potassium. Improves soil fertility and crop yield naturally.',
        price: 450,
        category: 'fertilizers',
        sellerId: seller._id,
        inventory: {
          currentStock: 80,
          lowStockThreshold: 15,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['fertilizer', 'organic', 'npk', 'bio'],
        rating: 4.7,
        reviewCount: 18,
        specifications: {
          npkRatio: '10:10:10',
          formulation: 'Granular',
          application: 'Soil application',
          packaging: '50 kg bag',
          certification: 'Organic Certified'
        }
      },
      {
        name: 'Professional Garden Tools Set - 5 Pieces',
        description: 'Complete garden tools set including spade, fork, hoe, rake, and trowel. Perfect for all gardening needs.',
        price: 899,
        category: 'tools',
        sellerId: seller._id,
        inventory: {
          currentStock: 25,
          lowStockThreshold: 5,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['tools', 'garden', 'set', 'professional'],
        rating: 4.3,
        reviewCount: 12,
        specifications: {
          pieces: '5',
          material: 'Stainless steel with wooden handles',
          warranty: '1 year',
          weight: '2.5 kg total',
          includes: 'Spade, Fork, Hoe, Rake, Trowel'
        }
      },
      {
        name: 'Drip Irrigation Kit - Complete Setup',
        description: 'Complete drip irrigation system for efficient water management in farms. Includes all necessary components for easy installation.',
        price: 2499,
        category: 'irrigation',
        sellerId: seller._id,
        inventory: {
          currentStock: 12,
          lowStockThreshold: 3,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['irrigation', 'drip', 'water-saving', 'kit'],
        rating: 4.8,
        reviewCount: 8,
        specifications: {
          coverage: '1 acre',
          pipeMaterial: 'UV stabilized HDPE',
          dripSpacing: '30 cm',
          pressure: '1.0 - 2.0 kg/cm²',
          warranty: '2 years'
        }
      },
      {
        name: 'Organic Pesticide - Neem Oil Based',
        description: 'Natural neem oil based pesticide effective against common pests. Safe for organic farming and environment friendly.',
        price: 399,
        category: 'pesticides',
        sellerId: seller._id,
        inventory: {
          currentStock: 60,
          lowStockThreshold: 10,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['pesticide', 'organic', 'neem', 'natural'],
        rating: 4.4,
        reviewCount: 15,
        specifications: {
          activeIngredient: 'Neem oil 3000 ppm',
          formulation: 'Emulsifiable concentrate',
          dosage: '2 ml/liter of water',
          packaging: '500 ml bottle',
          toxicity: 'Low toxicity to humans and animals'
        }
      },
      {
        name: 'Mini Tractor - 20 HP Power',
        description: 'Compact mini tractor perfect for small to medium farms. Easy to operate and maintain with excellent fuel efficiency.',
        price: 285000,
        category: 'machinery',
        sellerId: seller._id,
        inventory: {
          currentStock: 3,
          lowStockThreshold: 1,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['tractor', 'machinery', 'mini', 'farm'],
        rating: 4.6,
        reviewCount: 6,
        specifications: {
          power: '20 HP',
          engine: '4-stroke diesel',
          fuelTank: '25 liters',
          liftingCapacity: '750 kg',
          warranty: '2 years'
        },
        featured: true
      },
      {
        name: 'Organic Vegetable Seeds Mix',
        description: 'Assorted organic vegetable seeds including tomato, chili, brinjal, and more. Perfect for kitchen garden.',
        price: 199,
        category: 'organic',
        sellerId: seller._id,
        inventory: {
          currentStock: 200,
          lowStockThreshold: 30,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['vegetable', 'seeds', 'organic', 'mixed'],
        rating: 4.2,
        reviewCount: 31,
        specifications: {
          varieties: 'Tomato, Chili, Brinjal, Okra, Bottle gourd',
          totalSeeds: '500+ seeds',
          germination: '80%+',
          shelfLife: '18 months',
          certification: 'Organic Certified'
        }
      },
      {
        name: 'Solar Water Pump - 1 HP',
        description: 'Energy efficient solar water pump for irrigation. Works on solar power, reduces electricity costs significantly.',
        price: 18500,
        category: 'irrigation',
        sellerId: seller._id,
        inventory: {
          currentStock: 8,
          lowStockThreshold: 2,
          lastUpdated: new Date()
        },
        images: [],
        tags: ['pump', 'solar', 'irrigation', 'energy-saving'],
        rating: 4.9,
        reviewCount: 4,
        specifications: {
          power: '1 HP',
          head: '100 feet',
          flowRate: '3000 L/hour',
          solarPanel: '300W monocrystalline',
          warranty: '5 years'
        }
      }
    ];

    // Insert products
    const insertedProducts = [];
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      insertedProducts.push(product);
    }

    return NextResponse.json({
      message: 'Sample products created successfully',
      count: insertedProducts.length,
      products: insertedProducts.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category
      }))
    });
  } catch (error) {
    console.error('Error creating sample products:', error);
    return NextResponse.json({ error: 'Failed to create sample products' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'Sample products API - Use POST to create sample products'
  });
}
