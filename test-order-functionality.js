// Comprehensive order functionality test
import { createMocks } from 'node-mocks-http';
import ordersHandler from './pages/api/orders/index.js';
import orderByIdHandler from './pages/api/orders/[id].js';
import productsHandler from './pages/api/products/index.js';
import packagingHandler from './pages/api/packaging/index.js';

async function testOrderWorkflow() {
  console.log('🚀 Starting comprehensive order functionality test...\n');

  try {
    // Test 1: Verify products are available
    console.log('📦 Test 1: Checking products availability...');
    const { req: prodReq, res: prodRes } = createMocks({ method: 'GET' });
    await productsHandler(prodReq, prodRes);
    
    if (prodRes._getStatusCode() !== 200) {
      throw new Error(`Products API failed: ${prodRes._getStatusCode()}`);
    }
    
    const products = JSON.parse(prodRes._getData());
    console.log(`✅ Found ${products.length} products available`);
    
    // Test 2: Verify packaging options are available
    console.log('\n📦 Test 2: Checking packaging options...');
    const { req: packReq, res: packRes } = createMocks({ method: 'GET' });
    await packagingHandler(packReq, packRes);
    
    if (packRes._getStatusCode() !== 200) {
      throw new Error(`Packaging API failed: ${packRes._getStatusCode()}`);
    }
    
    const packaging = JSON.parse(packRes._getData());
    console.log(`✅ Found ${packaging.length} packaging options available`);

    // Test 3: Create a new order
    console.log('\n🛒 Test 3: Creating a new order...');
    const orderData = {
      client: {
        client_number: "TEST_CLIENT_001",
        name: "Test Customer for Order",
        address: "123 Test Street",
        application_used: "cafe_app"
      },
      userId: 1,
      application: "cafe_app",
      total: 14.65,
      products: [
        {
          productId: products[0].id,
          recipeId: products[0].recipes?.[0]?.id || null,
          quantity: 2,
          unitPrice: 4.65,
          packagingId: packaging[0].id
        },
        {
          productId: products[1]?.id || products[0].id,
          recipeId: products[1]?.recipes?.[0]?.id || null,
          quantity: 1,
          unitPrice: 5.35,
          packagingId: packaging[1]?.id || packaging[0].id
        }
      ]
    };

    const { req: createReq, res: createRes } = createMocks({
      method: 'POST',
      body: orderData
    });

    await ordersHandler(createReq, createRes);
    
    if (createRes._getStatusCode() !== 201) {
      throw new Error(`Order creation failed: ${createRes._getStatusCode()} - ${createRes._getData()}`);
    }
    
    const createdOrder = JSON.parse(createRes._getData());
    console.log(`✅ Order created successfully with ID: ${createdOrder.id}`);
    console.log(`   Status: ${createdOrder.status}`);
    console.log(`   Total: $${createdOrder.total}`);
    console.log(`   Products: ${createdOrder.products.length} items`);

    // Test 4: Retrieve all orders
    console.log('\n📋 Test 4: Retrieving all orders...');
    const { req: getAllReq, res: getAllRes } = createMocks({ method: 'GET' });
    await ordersHandler(getAllReq, getAllRes);
    
    if (getAllRes._getStatusCode() !== 200) {
      throw new Error(`Get all orders failed: ${getAllRes._getStatusCode()}`);
    }
    
    const allOrders = JSON.parse(getAllRes._getData());
    console.log(`✅ Retrieved ${allOrders.length} orders from the system`);

    // Test 5: Get specific order by ID
    console.log('\n🔍 Test 5: Retrieving specific order by ID...');
    const { req: getByIdReq, res: getByIdRes } = createMocks({
      method: 'GET',
      query: { id: createdOrder.id.toString() }
    });

    await orderByIdHandler(getByIdReq, getByIdRes);
    
    if (getByIdRes._getStatusCode() !== 200) {
      throw new Error(`Get order by ID failed: ${getByIdRes._getStatusCode()}`);
    }
    
    const retrievedOrder = JSON.parse(getByIdRes._getData());
    console.log(`✅ Successfully retrieved order ID: ${retrievedOrder.id}`);

    // Test 6: Update order status
    console.log('\n🔄 Test 6: Updating order status...');
    const statusUpdates = ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
    
    for (const status of statusUpdates) {
      const { req: updateReq, res: updateRes } = createMocks({
        method: 'PUT',
        query: { id: createdOrder.id.toString() },
        body: { status }
      });

      await orderByIdHandler(updateReq, updateRes);
      
      if (updateRes._getStatusCode() !== 200) {
        throw new Error(`Status update to ${status} failed: ${updateRes._getStatusCode()}`);
      }
      
      const updatedOrder = JSON.parse(updateRes._getData());
      console.log(`✅ Order status updated to: ${updatedOrder.status}`);
    }

    // Test 7: Verify order history and data integrity
    console.log('\n🔒 Test 7: Verifying data integrity...');
    const { req: finalCheckReq, res: finalCheckRes } = createMocks({
      method: 'GET',
      query: { id: createdOrder.id.toString() }
    });

    await orderByIdHandler(finalCheckReq, finalCheckRes);
    const finalOrder = JSON.parse(finalCheckRes._getData());
    
    // Verify all required fields are present
    const requiredFields = ['id', 'clientId', 'userId', 'createdAt', 'updatedAt', 'application', 'total', 'status', 'client', 'products'];
    const missingFields = requiredFields.filter(field => !(field in finalOrder));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Verify client data
    if (!finalOrder.client || !finalOrder.client.name) {
      throw new Error('Client data is missing or invalid');
    }
    
    // Verify products data
    if (!finalOrder.products || finalOrder.products.length === 0) {
      throw new Error('Order products are missing');
    }
    
    for (const product of finalOrder.products) {
      if (!product.product || !product.packaging) {
        throw new Error('Product or packaging data is missing from order products');
      }
    }
    
    console.log('✅ All data integrity checks passed');
    console.log(`   Final order status: ${finalOrder.status}`);
    console.log(`   Order total: $${finalOrder.total}`);
    console.log(`   Customer: ${finalOrder.client.name}`);
    console.log(`   Products ordered: ${finalOrder.products.length}`);

    console.log('\n🎉 All order functionality tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Product availability verified');
    console.log('   ✅ Packaging options verified');
    console.log('   ✅ Order creation working');
    console.log('   ✅ Order retrieval working');
    console.log('   ✅ Order status updates working');
    console.log('   ✅ Data integrity maintained');
    console.log('   ✅ Full order workflow functional');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testOrderWorkflow();
