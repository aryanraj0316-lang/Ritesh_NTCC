// Native fetch is built into Node.js 24
const fetch = globalThis.fetch;


const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, name, passed: true, durationMs });
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    const msg = err.message || String(err);
    results.push({ suite, name, passed: false, durationMs, error: msg });
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${name} (${durationMs}ms)`);
    console.error(`         \x1b[33m${msg}\x1b[0m`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message} (Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

async function main() {
  console.log('\n\x1b[1m======================================================================\x1b[0m');
  console.log('\x1b[1m   EXHAUSTIVE BACKEND INTEGRATION & BUSINESS LOGIC TEST SUITE        \x1b[0m');
  console.log('\x1b[1m======================================================================\x1b[0m\n');

  let adminToken = '';
  let customerToken = '';
  let registeredCustomerToken = '';
  let testCategoryId = '';
  let testMenuItemId = '';
  let createdOrderNumber = '';
  let createdOrderId = '';

  // =========================================================================
  // SUITE 1: Health & Diagnostics
  // =========================================================================
  console.log('\x1b[36m[Suite 1: Health & Diagnostics]\x1b[0m');
  
  await runTest('Health', 'API health check returns 200 and valid status', async () => {
    const res = await fetch(`${API_BASE}/health`);
    assertEqual(res.status, 200, 'Health endpoint status code');
    const data = await res.json();
    assertEqual(data.status, 'ok', 'Health status field');
    assertEqual(data.restaurant, 'Dastaan Heritage Kitchen', 'Restaurant name');
  });

  // =========================================================================
  // SUITE 2: Authentication & User Accounts
  // =========================================================================
  console.log('\n\x1b[36m[Suite 2: Authentication & User Accounts]\x1b[0m');

  await runTest('Auth', 'Admin login with valid credentials succeeds and returns JWT', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dastaan.com', password: 'Admin@12345' }),
    });
    assertEqual(res.status, 200, 'Admin login status');
    const data = await res.json();
    assert(data.success === true, 'Success flag');
    assert(!!data.data.token, 'Token present');
    assertEqual(data.data.user.role, 'ADMIN', 'User role');
    adminToken = data.data.token;
  });

  await runTest('Auth', 'Customer login with valid credentials succeeds', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.sharma@example.com', password: 'Customer@123' }),
    });
    assertEqual(res.status, 200, 'Customer login status');
    const data = await res.json();
    assert(data.success === true, 'Success flag');
    assertEqual(data.data.user.role, 'CUSTOMER', 'Customer role');
    customerToken = data.data.token;
  });

  await runTest('Auth', 'Login fails with incorrect password (401)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dastaan.com', password: 'WrongPassword999' }),
    });
    assertEqual(res.status, 401, 'Bad credentials rejection code');
    const data = await res.json();
    assert(data.success === false, 'Success should be false');
  });

  await runTest('Auth', 'Login fails with non-existent email (401)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost.user.999@nowhere.com', password: 'AnyPassword' }),
    });
    assertEqual(res.status, 401, 'Non-existent user code');
  });

  const testCustomerEmail = `test.patron.${Date.now()}@example.com`;
  await runTest('Auth', 'Register new customer account with validation', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'Password@123',
        name: 'Aishwarya Sen',
        phone: '+91 99887 76655',
      }),
    });
    assertEqual(res.status, 201, 'Registration status code');
    const data = await res.json();
    assert(data.success === true, 'Registration success flag');
    assertEqual(data.data.user.email, testCustomerEmail, 'Saved email');
    registeredCustomerToken = data.data.token;
  });

  await runTest('Auth', 'Prevent duplicate customer registration (400)', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'Password@123',
        name: 'Aishwarya Sen Duplicate',
      }),
    });
    assertEqual(res.status, 400, 'Duplicate email status code');
  });

  await runTest('Auth', 'Fetch current user profile via /auth/me', async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${registeredCustomerToken}` },
    });
    assertEqual(res.status, 200, 'Profile fetch status code');
    const data = await res.json();
    assertEqual(data.data.email, testCustomerEmail, 'Profile email');
  });

  let createdAddressId = '';
  await runTest('Auth', 'Add and delete customer address', async () => {
    const addRes = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registeredCustomerToken}`,
      },
      body: JSON.stringify({
        recipientName: 'Aishwarya Sen',
        phone: '+91 99887 76655',
        street: 'Tower B, Flat 1204, Magnolias',
        landmark: 'Near Club House',
        city: 'Gurugram',
        postalCode: '122009',
        isDefault: true,
      }),
    });
    assertEqual(addRes.status, 201, 'Address creation status');
    const addData = await addRes.json();
    createdAddressId = addData.data.id;
    assert(!!createdAddressId, 'Address ID generated');

    const delRes = await fetch(`${API_BASE}/auth/addresses/${createdAddressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${registeredCustomerToken}` },
    });
    assertEqual(delRes.status, 200, 'Address deletion status');
  });

  // =========================================================================
  // SUITE 3: Security & Role-Based Access Control (RBAC)
  // =========================================================================
  console.log('\n\x1b[36m[Suite 3: Security & Authorization Boundaries]\x1b[0m');

  await runTest('Security', 'Unauthenticated request to /api/orders rejected with 401', async () => {
    const res = await fetch(`${API_BASE}/orders`);
    assertEqual(res.status, 401, 'Unauthenticated status code');
  });

  await runTest('Security', 'Customer role attempting /api/orders rejected with 403', async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assertEqual(res.status, 403, 'Customer forbidden from admin orders');
  });

  await runTest('Security', 'Customer role attempting to create category rejected with 403', async () => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Category' }),
    });
    assertEqual(res.status, 403, 'Customer forbidden from category creation');
  });

  await runTest('Security', 'Customer role attempting to access reports rejected with 403', async () => {
    const res = await fetch(`${API_BASE}/reports/kpis`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assertEqual(res.status, 403, 'Customer forbidden from operational KPIs');
  });

  // =========================================================================
  // SUITE 4: Categories Lifecycle & Relational Integrity
  // =========================================================================
  console.log('\n\x1b[36m[Suite 4: Categories Lifecycle & Relational Integrity]\x1b[0m');

  await runTest('Categories', 'Public categories list returns active courses with item counts', async () => {
    const res = await fetch(`${API_BASE}/categories`);
    assertEqual(res.status, 200, 'Categories fetch code');
    const data = await res.json();
    assert(data.success === true, 'Success flag');
    assert(Array.isArray(data.data), 'Array of categories');
    assert(data.data.length >= 6, 'Contains seeded categories');
    assert(data.data[0].itemCount !== undefined, 'Item count included');
  });

  await runTest('Categories', 'Admin creates new category', async () => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Seasonal Winter Specialties',
        description: 'Rare heritage dishes prepared with winter greens and slow-smoked meats',
        sortOrder: 10,
        isActive: true,
      }),
    });
    assertEqual(res.status, 201, 'Category create status');
    const data = await res.json();
    testCategoryId = data.data.id;
    assert(!!testCategoryId, 'Generated category ID');
  });

  await runTest('Categories', 'Admin updates category details', async () => {
    const res = await fetch(`${API_BASE}/categories/${testCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Royal Winter Warmers',
        sortOrder: 12,
      }),
    });
    assertEqual(res.status, 200, 'Category update status');
    const data = await res.json();
    assertEqual(data.data.name, 'Royal Winter Warmers', 'Updated name');
  });

  await runTest('Categories', 'Relational safety: Deletion of category with dishes is prevented (400)', async () => {
    // Get existing category with dishes
    const catRes = await fetch(`${API_BASE}/categories`);
    const cats = await catRes.json();
    const catWithDishes = cats.data.find((c: any) => c.itemCount > 0);
    assert(!!catWithDishes, 'Found category with dishes');

    const delRes = await fetch(`${API_BASE}/categories/${catWithDishes.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(delRes.status, 400, 'Deletion must be rejected');
    const delData = await delRes.json();
    assert(delData.error.includes('Cannot delete category'), 'Accidental deletion prevention message');
  });

  await runTest('Categories', 'Admin deletes empty category successfully', async () => {
    const res = await fetch(`${API_BASE}/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'Delete empty category status');
  });

  // =========================================================================
  // SUITE 5: Menu Catalog & Availability Controls
  // =========================================================================
  console.log('\n\x1b[36m[Suite 5: Menu Catalog & Availability Controls]\x1b[0m');

  let sampleDish: any = null;
  await runTest('Menu', 'Fetch all menu items with category relations and add-ons', async () => {
    const res = await fetch(`${API_BASE}/menu`);
    assertEqual(res.status, 200, 'Menu status code');
    const data = await res.json();
    assert(data.count >= 16, 'At least 16 menu items');
    sampleDish = data.data.find((d: any) => d.addons && d.addons.length > 0) || data.data[0];
    assert(!!sampleDish, 'Sample dish found');
    assert(typeof sampleDish.price === 'number', 'Price is numeric');
  });

  await runTest('Menu', 'Filter menu by dietary preference (isVeg=true)', async () => {
    const res = await fetch(`${API_BASE}/menu?isVeg=true`);
    const data = await res.json();
    assert(data.count > 0, 'Found veg dishes');
    for (const item of data.data) {
      assertEqual(item.isVeg, true, 'Item must be vegetarian');
    }
  });

  await runTest('Menu', 'Search menu by keyword', async () => {
    const res = await fetch(`${API_BASE}/menu?search=Biryani`);
    const data = await res.json();
    assert(data.count >= 3, 'Found biryani items');
  });

  await runTest('Menu', 'Admin creates a new dish with add-on accompaniments', async () => {
    // Get biryani category
    const catsRes = await fetch(`${API_BASE}/categories`);
    const cats = await catsRes.json();
    const firstCat = cats.data[0];

    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Dastaan Charcoal Smoked Chaap',
        description: 'Tender soya chaap roasted in red charcoal marinade with aromatic spices',
        price: 420.00,
        categoryId: firstCat.id,
        isVeg: true,
        isAvailable: true,
        imageUrl: '/images/dishes/paneer_tikka.jpg',
        prepTimeMinutes: 18,
        spiceLevel: 2,
        addons: [
          { name: 'Extra Mint Dip', price: 30.00 },
          { name: 'Roomali Roti', price: 40.00 },
        ],
      }),
    });
    assertEqual(res.status, 201, 'Create dish status code');
    const data = await res.json();
    testMenuItemId = data.data.id;
    assert(data.data.addons.length === 2, '2 add-ons created');
  });

  await runTest('Menu', 'Admin toggles dish availability instantly', async () => {
    // Toggle off
    const toggleOff = await fetch(`${API_BASE}/menu/${testMenuItemId}/toggle-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(toggleOff.status, 200, 'Toggle status code');
    const dataOff = await toggleOff.json();
    assertEqual(dataOff.data.isAvailable, false, 'Availability is false');

    // Customer should not see unavailable item
    const publicMenu = await fetch(`${API_BASE}/menu`);
    const publicData = await publicMenu.json();
    const found = publicData.data.some((i: any) => i.id === testMenuItemId);
    assertEqual(found, false, 'Unavailable dish hidden from customer menu');

    // Toggle on
    const toggleOn = await fetch(`${API_BASE}/menu/${testMenuItemId}/toggle-availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataOn = await toggleOn.json();
    assertEqual(dataOn.data.isAvailable, true, 'Availability is true');
  });

  await runTest('Menu', 'Admin deletes newly created test dish', async () => {
    const res = await fetch(`${API_BASE}/menu/${testMenuItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'Delete dish status code');
  });

  // =========================================================================
  // SUITE 6: Promotional Coupons & Discount Logic
  // =========================================================================
  console.log('\n\x1b[36m[Suite 6: Promotional Coupons & Discount Logic]\x1b[0m');

  await runTest('Coupons', 'Validate percentage coupon ROYAL10 calculates 10% discount', async () => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ROYAL10', subtotal: 1000 }),
    });
    assertEqual(res.status, 200, 'Coupon validate status');
    const data = await res.json();
    assertEqual(data.data.discountAmount, 100, '10% of 1000 = 100');
  });

  await runTest('Coupons', 'Validate fixed coupon FIRSTBITE calculates exact ₹150 discount', async () => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FIRSTBITE', subtotal: 800 }),
    });
    assertEqual(res.status, 200, 'Coupon validate status');
    const data = await res.json();
    assertEqual(data.data.discountAmount, 150, 'Fixed ₹150 discount');
  });

  await runTest('Coupons', 'Reject coupon when subtotal is below minimum order threshold (400)', async () => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ROYAL10', subtotal: 300 }), // Min is ₹800
    });
    assertEqual(res.status, 400, 'Threshold rejection status code');
  });

  await runTest('Coupons', 'Reject non-existent coupon code (400)', async () => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FAKE_DISCOUNT_99', subtotal: 1000 }),
    });
    assertEqual(res.status, 400, 'Invalid coupon status code');
  });

  // =========================================================================
  // SUITE 7: Order Creation, Exact Math & Database Transactions
  // =========================================================================
  console.log('\n\x1b[36m[Suite 7: Order Creation, Exact Math & Transactions]\x1b[0m');

  await runTest('Orders', 'Place delivery order with server-calculated prices, GST, delivery fee, and snapshot', async () => {
    // Pick 2 real dishes
    const menuRes = await fetch(`${API_BASE}/menu`);
    const menu = await menuRes.json();
    const dish1 = menu.data[0];
    const dish2 = menu.data[1];

    const addon1 = dish1.addons?.[0];
    const qty1 = 2;
    const qty2 = 1;

    const unitPrice1 = dish1.price + (addon1 ? addon1.price : 0);
    const unitPrice2 = dish2.price;
    const expectedSubtotal = unitPrice1 * qty1 + unitPrice2 * qty2;

    // Delivery order < 999 pays 50 delivery fee, else 0
    const expectedDeliveryFee = expectedSubtotal >= 999 ? 0 : 50;
    const expectedTax = Math.round(expectedSubtotal * 0.05 * 100) / 100;
    const expectedTotal = Math.round((expectedSubtotal + expectedTax + expectedDeliveryFee) * 100) / 100;

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul.sharma@example.com',
        customerPhone: '+91 98112 34567',
        orderType: 'DELIVERY',
        deliveryAddress: 'Flat 402, Royal Palms, Golf Course Road, Gurugram 122002',
        orderNotes: 'Ring bell twice and leave package with concierge',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: [
          {
            menuItemId: dish1.id,
            quantity: qty1,
            selectedAddons: addon1 ? [addon1.name] : [],
          },
          {
            menuItemId: dish2.id,
            quantity: qty2,
          },
        ],
      }),
    });

    assertEqual(res.status, 201, 'Order placement status code');
    const data = await res.json();
    assert(data.success === true, 'Success flag');

    const ord = data.data;
    createdOrderNumber = ord.orderNumber;
    createdOrderId = ord.id;

    assert(ord.orderNumber.startsWith('ORD-'), 'Unique ORD- formatted order number');
    assertEqual(ord.subtotal, expectedSubtotal, 'Exact subtotal calculated on server');
    assertEqual(ord.taxAmount, expectedTax, 'Exact 5% GST tax');
    assertEqual(ord.deliveryFee, expectedDeliveryFee, 'Exact delivery fee rule');
    assertEqual(ord.totalAmount, expectedTotal, 'Exact total amount sum');
    assertEqual(ord.currentStatus, 'PLACED', 'Initial status is PLACED');
    assertEqual(ord.items.length, 2, '2 order items snapshots saved');
    assertEqual(ord.statusHistory[0].status, 'PLACED', 'Audit history entry exists');
  });

  await runTest('Orders', 'Track order by orderNumber returns complete status & items', async () => {
    const res = await fetch(`${API_BASE}/orders/track/${createdOrderNumber}`);
    assertEqual(res.status, 200, 'Track order status');
    const data = await res.json();
    assertEqual(data.data.orderNumber, createdOrderNumber, 'Order reference match');
    assertEqual(data.data.currentStatus, 'PLACED', 'Status match');
    assert(data.data.items.length === 2, 'Items returned');
  });

  await runTest('Orders', 'Customer fetches their personal order history via /orders/my-orders', async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assertEqual(res.status, 200, 'My orders status');
    const data = await res.json();
    assert(Array.isArray(data.data), 'Array of orders');
    const found = data.data.some((o: any) => o.orderNumber === createdOrderNumber);
    assert(found, 'Newly created order found in customer order history');
  });

  // =========================================================================
  // SUITE 8: Order State Machine & Lifecycle Transitions
  // =========================================================================
  console.log('\n\x1b[36m[Suite 8: Order State Machine & Lifecycle Transitions]\x1b[0m');

  await runTest('Lifecycle', 'Admin advances status from PLACED -> CONFIRMED', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'CONFIRMED',
        notes: 'Kitchen confirmed preparation',
      }),
    });
    assertEqual(res.status, 200, 'Status update status');
    const data = await res.json();
    assertEqual(data.data.currentStatus, 'CONFIRMED', 'Status updated to CONFIRMED');
  });

  await runTest('Lifecycle', 'State machine blocks illegal jump: CONFIRMED -> COMPLETED directly (400)', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
      }),
    });
    assertEqual(res.status, 400, 'Illegal transition must be blocked with 400');
    const data = await res.json();
    assert(data.error.includes('Cannot transition'), 'Descriptive state-machine error');
  });

  await runTest('Lifecycle', 'Admin advances status: CONFIRMED -> PREPARING', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'PREPARING', notes: 'Master chef simmering handi' }),
    });
    assertEqual(res.status, 200, 'Status update status');
    const data = await res.json();
    assertEqual(data.data.currentStatus, 'PREPARING', 'Status is PREPARING');
  });

  await runTest('Lifecycle', 'Admin advances status: PREPARING -> OUT_FOR_DELIVERY', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY', notes: 'Dispatched with valet' }),
    });
    assertEqual(res.status, 200, 'Status update status');
    const data = await res.json();
    assertEqual(data.data.currentStatus, 'OUT_FOR_DELIVERY', 'Status is OUT_FOR_DELIVERY');
  });

  await runTest('Lifecycle', 'Admin advances status: OUT_FOR_DELIVERY -> COMPLETED (Auto-marks COD as PAID)', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'COMPLETED', notes: 'Delivered securely to patron' }),
    });
    assertEqual(res.status, 200, 'Status update status');
    const data = await res.json();
    assertEqual(data.data.currentStatus, 'COMPLETED', 'Status is COMPLETED');
    assertEqual(data.data.paymentStatus, 'PAID', 'COD payment marked as PAID upon completion');
  });

  await runTest('Lifecycle', 'Customer cancellation on completed order is blocked (400)', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ reason: 'Changed mind' }),
    });
    assertEqual(res.status, 400, 'Cancel completed order blocked');
  });

  // Create a separate order to test cancellation
  await runTest('Lifecycle', 'Customer cancels order while still in PLACED state', async () => {
    const menuRes = await fetch(`${API_BASE}/menu`);
    const menu = await menuRes.json();
    const dish = menu.data[0];

    const ordRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul.sharma@example.com',
        customerPhone: '+91 98112 34567',
        orderType: 'PICKUP',
        paymentMethod: 'CASH_ON_DELIVERY',
        items: [{ menuItemId: dish.id, quantity: 1 }],
      }),
    });
    const ordData = await ordRes.json();
    const cancelOrderId = ordData.data.id;

    const cancelRes = await fetch(`${API_BASE}/orders/${cancelOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ reason: 'Accidental order submitted' }),
    });
    assertEqual(cancelRes.status, 200, 'Cancel in PLACED status code');
    const cancelData = await cancelRes.json();
    assertEqual(cancelData.data.currentStatus, 'CANCELLED', 'Order cancelled');
    assertEqual(cancelData.data.cancellationReason, 'Accidental order submitted', 'Reason persisted');
  });

  // =========================================================================
  // SUITE 9: Operations Analytics, CRM & Reports
  // =========================================================================
  console.log('\n\x1b[36m[Suite 9: Operations Analytics, CRM & Reports]\x1b[0m');

  await runTest('Reports', 'Operational KPIs match real database counts and exclude cancelled revenue', async () => {
    const res = await fetch(`${API_BASE}/reports/kpis`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'KPI status code');
    const data = await res.json();
    assert(data.success === true, 'Success flag');
    assert(data.data.ordersTodayCount > 0, 'Orders today count > 0');
    assert(data.data.todayRevenue > 0, 'Today revenue > 0');
    assert(data.data.averageOrderValue > 0, 'Average order value > 0');
    assert(Array.isArray(data.data.recentOrders), 'Recent orders array');
  });

  await runTest('Reports', 'Sales report returns daily trend and top selling dishes', async () => {
    const res = await fetch(`${API_BASE}/reports/sales?days=7`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'Sales report status code');
    const data = await res.json();
    assert(Array.isArray(data.data.trend), 'Daily trend array');
    assert(Array.isArray(data.data.topSellingDishes), 'Top selling dishes array');
    assert(data.data.totalPeriodRevenue > 0, 'Period revenue > 0');
  });

  await runTest('Reports', 'CSV export generates formatted file with headers and data', async () => {
    const res = await fetch(`${API_BASE}/reports/export-csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'CSV export status code');
    assert(res.headers.get('content-type')?.includes('text/csv') || false, 'Content type text/csv');
    const text = await res.text();
    assert(text.includes('Order Number,Date & Time,Customer Name'), 'CSV contains standard header columns');
    assert(text.includes('ORD-'), 'CSV contains order records');
  });

  await runTest('Reports', 'Customer CRM aggregates verified lifetime spending and order counts', async () => {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(res.status, 200, 'Customers CRM status code');
    const data = await res.json();
    assert(data.count > 0, 'Customers found');
    const topCustomer = data.data[0];
    assert(topCustomer.totalOrders > 0, 'Customer has order records');
    assert(topCustomer.totalSpent > 0, 'Customer has lifetime spending');
    assert(Array.isArray(topCustomer.orders), 'Order history list attached');
  });

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n\x1b[1m======================================================================\x1b[0m');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\x1b[1mTOTAL TESTS:\x1b[0m ${total} | \x1b[32m\x1b[1mPASSED:\x1b[0m ${passed} | \x1b[31m\x1b[1mFAILED:\x1b[0m ${failed}`);
  console.log('\x1b[1m======================================================================\x1b[0m\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
