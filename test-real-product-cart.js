// Test adding real products to cart
async function testRealProductCart() {
  console.log('🛒 Testing real product cart functionality...\n');
  
  const testUserId = 'test_farmer_123';
  const realProductId = '695ef5fe3f7e145a0c5ad155'; // NammaMysuru Vermicompost

  try {
    // Get product details first
    console.log('📦 Getting product details...');
    const productResponse = await fetch('http://localhost:3000/api/marketplace/products');
    
    if (productResponse.ok) {
      const data = await productResponse.json();
      const product = data.products.find(p => p._id === realProductId);
      
      if (!product) {
        console.log('❌ Product not found');
        return;
      }

      console.log('✅ Found product:', product.name);
      console.log('💰 Price:', product.price);
      console.log('🏪 Seller:', product.seller?.companyName);

      // Add to cart
      console.log('\n🛒 Adding to cart...');
      const cartResponse = await fetch('http://localhost:3000/api/farmer/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.images?.[0]?.url || '/placeholder.jpg',
          sellerId: product.seller?._id || 'unknown',
          sellerName: product.seller?.companyName || 'Unknown Seller'
        })
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        console.log('✅ Added to cart successfully!');
        console.log('📊 Cart:', cartData);
      } else {
        console.log('❌ Failed to add to cart:', await cartResponse.text());
      }

      // Check cart contents
      console.log('\n📋 Checking cart contents...');
      const getResponse = await fetch(`http://localhost:3000/api/farmer/cart?userId=${testUserId}`);
      
      if (getResponse.ok) {
        const cartData = await getResponse.json();
        console.log('✅ Cart contents:', cartData);
        console.log('🛍️ Items in cart:', cartData.items?.length || 0);
      }

      console.log('\n🌐 Test URLs:');
      console.log('Marketplace: http://localhost:3000/dashboard/farmer/marketplace?userId=' + testUserId);
      console.log('Cart: http://localhost:3000/dashboard/farmer/marketplace/cart?userId=' + testUserId);
      
    } else {
      console.log('❌ Failed to get products:', await productResponse.text());
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testRealProductCart();
