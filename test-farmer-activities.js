// Test script to create sample farmer activities
import { ActivityLogger } from './lib/utils/activity-helper.js';
import { ActivityAction, ResourceType, ActivityStatus } from './lib/models/AdminAuditLog.js';

async function createTestFarmerActivities() {
  console.log('🧪 Creating test farmer activities...\n');
  
  try {
    // Create a test user ID (you can replace this with an actual farmer ID)
    const testUserId = '65c1234567890abcdef123456'; // Example farmer ID
    
    console.log('👤 Using test user ID:', testUserId);
    
    // Create sample activities for testing
    const activities = [
      {
        action: ActivityAction.LOGIN,
        resourceType: ResourceType.FARMER,
        resourceId: testUserId,
        resourceName: 'Farmer Login',
        userId: testUserId,
        userEmail: 'test.farmer@example.com',
        userName: 'Test Farmer',
        userRole: 'farmer',
        description: 'Farmer logged into the system',
        metadata: { loginMethod: 'web' }
      },
      {
        action: ActivityAction.CREATE,
        resourceType: ResourceType.ORDER,
        resourceId: 'order_test_123',
        resourceName: 'Marketplace Order',
        userId: testUserId,
        userEmail: 'test.farmer@example.com',
        userName: 'Test Farmer',
        userRole: 'farmer',
        description: 'Created new marketplace order for wheat seeds',
        metadata: { 
          orderValue: '₹2,500',
          cropType: 'wheat',
          quantity: '50kg'
        }
      },
      {
        action: ActivityAction.UPDATE,
        resourceType: ResourceType.PRODUCT,
        resourceId: 'product_test_456',
        resourceName: 'Product Update',
        userId: testUserId,
        userEmail: 'test.farmer@example.com',
        userName: 'Test Farmer',
        userRole: 'farmer',
        description: 'Updated product price and availability',
        metadata: { 
          oldPrice: '₹2,000',
          newPrice: '₹2,200',
          productId: 'wheat_seeds_premium'
        }
      },
      {
        action: ActivityAction.UPLOAD,
        resourceType: ResourceType.DOCUMENT,
        resourceId: 'doc_test_789',
        resourceName: 'KYC Document',
        userId: testUserId,
        userEmail: 'test.farmer@example.com',
        userName: 'Test Farmer',
        userRole: 'farmer',
        description: 'Uploaded land ownership document',
        metadata: { 
          documentType: 'land_ownership',
          fileSize: '2.5MB',
          documentName: 'land_certificate.pdf'
        }
      }
    ];

    // Log each activity
    for (const activity of activities) {
      console.log(`📝 Logging activity: ${activity.action} - ${activity.description}`);
      
      const result = await ActivityLogger.logActivity({
        ...activity,
        status: ActivityStatus.SUCCESS
      });
      
      if (result) {
        console.log(`✅ Successfully logged activity: ${activity.action}`);
      } else {
        console.log(`❌ Failed to log activity: ${activity.action}`);
      }
    }

    console.log('\n🧪 Test completed! Check farmer dashboard for activities.');
    console.log('📊 URL: http://localhost:3000/dashboard/farmer?userId=' + testUserId);
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
createTestFarmerActivities();
