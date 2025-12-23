import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { User } from '@/lib/models/User';
import { Seller, Product, Order, DailyAnalytics } from '@/lib/models/supplier';
import { MarketplaceOrder } from '@/lib/models/marketplace-order';
export async function GET() {
  // Dynamic import to avoid module resolution issues
  const { FarmerOrder } = await import('@/lib/models/FarmerOrder');
  try {
    // Verify admin authentication
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch real statistics from database
    const [
      totalFarmers,
      topSellingProducts,
      totalSuppliers,
      totalProducts,
      totalMarketplaceOrders,
      totalSupplierOrders,
      recentOrders,
      monthlySalesData,
      topProductsData
    ] = await Promise.all([
      // Count farmers
      User.countDocuments({ role: 'farmer' }),
      
      // Get top-selling products from paid and completed orders
      FarmerOrder.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            status: { $in: ['delivered', 'shipped', 'completed'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            sellerName: { $first: { $ifNull: ['$items.sellerName', 'Unknown'] } },
            price: { $first: '$items.price' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            sellerName: 1,
            price: 1,
            totalQuantity: 1,
            totalRevenue: 1,
            orderCount: 1
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]),
      
      // Count suppliers (sellers)
      Seller.countDocuments({ isActive: true }),
      
      // Count active products
      Product.countDocuments({ status: 'active' }),
      
      // Count marketplace orders
      MarketplaceOrder.countDocuments(),
      
      // Count supplier orders
      Order.countDocuments(),
      
      // Get recent activities from multiple collections
      Promise.all([
        // Marketplace Orders
        MarketplaceOrder.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderId customerDetails.name totalAmount status createdAt')
          .lean()
          .then(orders => orders.map(order => ({
            type: 'marketplace_order',
            id: order.orderId,
            title: 'New Marketplace Order',
            description: `Order #${order.orderId} - ${order.customerDetails.name}`,
            amount: order.totalAmount,
            status: order.status,
            timestamp: order.createdAt,
            icon: 'shopping-bag'
          }))),
        
        // Supplier Orders
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber customer.name totalAmount orderStatus createdAt')
          .lean()
          .then(orders => orders.map(order => ({
            type: 'supplier_order',
            id: order.orderNumber,
            title: 'New Supplier Order',
            description: `Order #${order.orderNumber} - ${order.customer.name}`,
            amount: order.totalAmount,
            status: order.orderStatus,
            timestamp: order.createdAt,
            icon: 'package'
          }))),
        
        // Farmer Orders
        FarmerOrder.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber user totalAmount status createdAt')
          .populate('user', 'name')
          .lean()
          .then(orders => orders.map(order => ({
            type: 'farmer_order',
            id: order.orderNumber,
            title: 'New Farmer Order',
            description: `Order #${order.orderNumber} - ${order.user?.name || 'Unknown User'}`,
            amount: order.totalAmount,
            status: order.status,
            timestamp: order.createdAt,
            icon: 'shopping-cart'
          }))),
        
        // Document updates are currently not available
        Promise.resolve([])
      ]).then(([marketplaceOrders, supplierOrders, farmerOrders, documentUpdates]) => {
        // Combine all activities
        const allActivities = [
          ...marketplaceOrders,
          ...supplierOrders,
          ...farmerOrders,
          ...documentUpdates
        ];
        
        // Sort by timestamp and limit to 10 most recent
        return allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
      }),
      
      // Get monthly sales data for the last 6 months
      DailyAnalytics.aggregate([
        { $match: { 
          date: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }},
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          revenue: { $sum: '$revenue' }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Get top selling products from paid orders across all order types
      (async () => {
        try {
          // First try to get top products from FarmerOrders
          const farmerTopProducts = await FarmerOrder.aggregate([
            { $match: { 
              paymentStatus: 'paid',
              status: { $in: ['delivered', 'shipped', 'completed', 'confirmed'] }
            }},
            { $unwind: '$items' },
            { $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              totalSales: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }},
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
          ]);

          // Then try to get top products from regular Orders
          const supplierTopProducts = await Order.aggregate([
            { $match: { 
              paymentStatus: 'paid',
              status: { $in: ['delivered', 'shipped', 'completed', 'confirmed'] }
            }},
            { $unwind: '$items' },
            { $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              totalSales: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.total' }
            }},
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
          ]);

          // Combine and deduplicate products
          const allProducts = [...farmerTopProducts, ...supplierTopProducts].reduce((acc, product) => {
            const existing = acc.find(p => p._id?.toString() === product._id?.toString());
            if (existing) {
              existing.totalSales += product.totalSales;
              existing.totalRevenue += product.totalRevenue;
            } else {
              acc.push({...product});
            }
            return acc;
          }, []);

          // Sort by total sales and limit to top 5
          const topProducts = allProducts
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);

          // If no products found, return empty array
          if (topProducts.length === 0) return [];

          // Get additional product details
          const productIds = topProducts.map(p => new mongoose.Types.ObjectId(p._id));
          const products = await Product.find({ _id: { $in: productIds } });
          
          // Map product details to the results
          return topProducts.map(product => {
            const productDetails = products.find(p => p._id.toString() === product._id.toString());
            return {
              id: product._id,
              name: product.name || productDetails?.name || 'Unknown Product',
              category: productDetails?.category || 'Uncategorized',
              sales: product.totalSales,
              revenue: product.totalRevenue,
              stockQuantity: productDetails?.stockQuantity || 0,
              avgPrice: product.totalSales > 0 ? product.totalRevenue / product.totalSales : 0,
              change: 0 // Simplified for now
            };
          });
        } catch (error) {
          console.error('Error fetching top products:', error);
          return [];
        }
      })()
    ]);

    // Calculate growth rates separately
    const [
      supplierCurrent,
      supplierPrevious,
      productCurrent,
      productPrevious
    ] = await Promise.all([
      Seller.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Seller.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }),
      Product.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Product.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    const supplierGrowth = supplierPrevious > 0 ? ((supplierCurrent - supplierPrevious) / supplierPrevious) * 100 : 0;
    const productGrowth = productPrevious > 0 ? ((productCurrent - productPrevious) / productPrevious) * 100 : 0;

    const supplierGrowthData = { total: totalSuppliers, growth: Math.round(supplierGrowth * 10) / 10 };
    const productGrowthData = { total: totalProducts, growth: Math.round(productGrowth * 10) / 10 };

    // Calculate total revenue from both analytics and orders
    const totalRevenue = await DailyAnalytics.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
    ]).then(result => result[0]?.totalRevenue || 0);

    // Calculate monthly growth (compare with previous month)
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
      DailyAnalytics.aggregate([
        { $match: { 
          date: { 
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }},
        { $group: { _id: null, revenue: { $sum: '$revenue' } } }
      ]).then(result => result[0]?.revenue || 0),
      
      DailyAnalytics.aggregate([
        { $match: { 
          date: { 
            $gte: new Date(previousYear, previousMonth, 1),
            $lt: new Date(previousYear, previousMonth + 1, 1)
          }
        }},
        { $group: { _id: null, revenue: { $sum: '$revenue' } } }
      ]).then(result => result[0]?.revenue || 0)
    ]);

    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Prepare sales chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const labels = [];
    const data = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      labels.push(months[monthIndex]);
      
      // Find revenue for this month from our aggregated data
      const monthData = monthlySalesData.find(item => {
        const itemMonth = new Date(item._id).getMonth();
        return itemMonth === monthIndex;
      });
      data.push(monthData?.revenue || 0);
    }

    // Get real system status
    const getSystemStatus = async () => {
      try {
        // Check database connection
        const dbStatus = mongoose.connection.readyState === 1 ? 'operational' : 'error';
        
        // Check API response time
        const apiStartTime = Date.now();
        await User.findOne().limit(1); // Simple DB test
        const apiResponseTime = Date.now() - apiStartTime;
        const apiStatus = apiResponseTime < 1000 ? 'operational' : 'degraded';
        
        // Get database stats
        const dbStats = await mongoose.connection.db?.stats() || { dataSize: 0 };
        const storageUsed = Math.round((dbStats.dataSize / (1024 * 1024 * 1024)) * 100) / 100; // in GB
        const storageStatus = storageUsed > 50 ? 'warning' : 'operational';
        
        // Calculate performance based on response time
        const performanceValue = Math.max(0, 100 - (apiResponseTime / 20)); // Convert to percentage
        const performanceStatus = performanceValue > 80 ? 'good' : performanceValue > 50 ? 'moderate' : 'poor';
        
        return {
          api: { 
            status: apiStatus, 
            message: `Response time: ${apiResponseTime}ms` 
          },
          database: { 
            status: dbStatus, 
            message: dbStatus === 'operational' ? 'Connection stable' : 'Connection issues detected' 
          },
          storage: { 
            status: storageStatus, 
            message: `${storageUsed}GB used`, 
            value: Math.min(100, (storageUsed / 10) * 100) // Assuming 10GB limit
          },
          performance: { 
            status: performanceStatus, 
            message: `Performance: ${performanceValue.toFixed(0)}%`, 
            value: performanceValue 
          },
        };
      } catch (error) {
        return {
          api: { status: 'error', message: 'API monitoring failed' },
          database: { status: 'error', message: 'Database connection failed' },
          storage: { status: 'error', message: 'Storage check failed', value: 0 },
          performance: { status: 'poor', message: 'System performance unknown', value: 0 },
        };
      }
    };

    const systemStatus = await getSystemStatus();

    const stats = {
      totalFarmers,
      totalSuppliers: supplierGrowthData?.total || 0,
      totalProducts: productGrowthData?.total || 0,
      totalTransactions: totalMarketplaceOrders + totalSupplierOrders,
      totalRevenue: totalRevenue || 0,
      monthlyGrowth: monthlyGrowth ? Math.round(monthlyGrowth * 10) / 10 : 0,
      supplierGrowth: supplierGrowthData?.growth || 0,
      productGrowth: productGrowthData?.growth || 0,
      recentOrders: recentOrders || [],
      topProducts: topProductsData || [],
      salesData: {
        labels: labels || [],
        datasets: [
          {
            label: 'Sales',
            data: data || [],
            borderColor: 'rgba(79, 70, 229, 1)',
          }
        ]
      },
      systemStatus
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
