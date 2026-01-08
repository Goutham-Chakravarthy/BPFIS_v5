// Test script to verify supplier verification status updates
async function testSupplierVerification() {
  console.log('🧪 Testing Supplier Verification Status Updates...\n');
  
  try {
    // Step 1: Get a test supplier
    console.log('📋 Step 1: Getting test supplier...');
    const supplierResponse = await fetch('http://localhost:3000/api/supplier');
    const supplierData = await supplierResponse.json();
    
    if (!supplierData.success || !supplierData.supplier) {
      console.log('❌ No test supplier found. Creating one...');
      
      // Create a test supplier
      const createResponse = await fetch('http://localhost:3000/api/supplier/create-test', {
        method: 'POST'
      });
      
      if (createResponse.ok) {
        const newSupplier = await createResponse.json();
        console.log('✅ Created test supplier:', newSupplier.supplier._id);
        testWithSupplierId(newSupplier.supplier._id);
      } else {
        console.log('❌ Failed to create test supplier');
      }
    } else {
      testWithSupplierId(supplierData.supplier._id);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

async function testWithSupplierId(supplierId) {
  try {
    // Step 2: Check initial verification status
    console.log('\n📋 Step 2: Checking initial verification status...');
    const initialStatusResponse = await fetch(`http://localhost:3000/api/supplier/${supplierId}/profile`);
    const initialStatus = await initialStatusResponse.json();
    
    console.log('📊 Initial Status:', {
      verificationStatus: initialStatus.verificationStatus,
      documentsUploaded: initialStatus.documentsUploaded
    });

    // Step 3: Simulate admin verification
    console.log('\n🔐 Step 3: Simulating admin verification...');
    const verifyResponse = await fetch(`http://localhost:3000/api/admin/suppliers/${supplierId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'admin-token=test-admin-token' // You'll need to be logged in as admin
      }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Admin verification successful:', verifyData.success);
    } else {
      console.log('❌ Admin verification failed. Make sure admin is logged in.');
      return;
    }

    // Step 4: Check if verification status updates
    console.log('\n⏱️ Step 4: Waiting for status update...');
    console.log('💡 The supplier dashboard should automatically detect the verification change within 30 seconds');
    console.log('🌐 Test URL: http://localhost:3000/dashboard/supplier/profile/verification');
    
    // Check status after a delay
    setTimeout(async () => {
      console.log('\n📋 Step 5: Checking updated verification status...');
      const updatedStatusResponse = await fetch(`http://localhost:3000/api/supplier/verification-status`, {
        headers: {
          'Authorization': 'Bearer test-supplier-token'
        }
      });
      
      if (updatedStatusResponse.ok) {
        const updatedStatus = await updatedStatusResponse.json();
        console.log('✅ Updated Status:', updatedStatus.verificationStatus);
        
        if (updatedStatus.verificationStatus.verificationStatus === 'verified') {
          console.log('🎉 SUCCESS: Verification status is now showing as verified in supplier dashboard!');
        } else {
          console.log('⚠️ Status updated but not verified yet:', updatedStatus.verificationStatus.verificationStatus);
        }
      } else {
        console.log('❌ Failed to get updated status');
      }
    }, 35000); // Wait 35 seconds for periodic check
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testSupplierVerification();
