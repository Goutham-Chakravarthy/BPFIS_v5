// Test script to verify cart API functionality
async function testCartAPI() {
  console.log('🧪 Testing Cart API...\n');
  
  const testUserId = 'test_farmer_123';
  const testProduct = {
    productId: 'product_test_456',
    name: 'Test Wheat Seeds',
    price: 999,
    quantity: 2,
    image: '/test-image.jpg',
    sellerId: 'seller_test_789',
    sellerName: 'Test Supplier'
  };

  try {
    // Test POST - Add item to cart
    console.log('📦 Testing POST /api/farmer/cart');
    const postResponse = await fetch('http://localhost:3000/api/farmer/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        ...testProduct
      })
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST successful:', postData);
    } else {
      console.log('❌ POST failed:', await postResponse.text());
      return;
    }

    // Test GET - Retrieve cart
    console.log('\n📋 Testing GET /api/farmer/cart');
    const getResponse = await fetch(`http://localhost:3000/api/farmer/cart?userId=${testUserId}`);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET successful:', getData);
      console.log('🛒 Cart items:', getData.items?.length || 0);
    } else {
      console.log('❌ GET failed:', await getResponse.text());
    }

    // Test PUT - Update cart
    console.log('\n🔄 Testing PUT /api/farmer/cart');
    const putResponse = await fetch('http://localhost:3000/api/farmer/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        items: [
          { ...testProduct, quantity: 3 }
        ]
      })
    });

    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('✅ PUT successful:', putData);
    } else {
      console.log('❌ PUT failed:', await putResponse.text());
    }

    // Test DELETE - Clear cart
    console.log('\n🗑️ Testing DELETE /api/farmer/cart');
    const deleteResponse = await fetch(`http://localhost:3000/api/farmer/cart?userId=${testUserId}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE successful:', deleteData);
    } else {
      console.log('❌ DELETE failed:', await deleteResponse.text());
    }

    console.log('\n🎉 Cart API test completed!');
    console.log('📊 Test URL: http://localhost:3000/dashboard/farmer/marketplace/cart?userId=' + testUserId);
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testCartAPI();
