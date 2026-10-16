import { PrismaClient, Role, OrderType, PaymentMethod, PaymentStatus, OrderStatus, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemAddon.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding administrative and customer users...');
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dastaan.com',
      passwordHash: adminPasswordHash,
      name: 'Farhan Qureshi',
      phone: '+91 98201 44521',
      role: Role.ADMIN,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'rahul.sharma@example.com',
      passwordHash: customerPasswordHash,
      name: 'Rahul Sharma',
      phone: '+91 98112 34567',
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            recipientName: 'Rahul Sharma',
            phone: '+91 98112 34567',
            street: 'Flat 402, Royal Palms, Golf Course Road',
            landmark: 'Opposite DLF Horizon Centre',
            city: 'Gurugram',
            postalCode: '122002',
            isDefault: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya.nair@example.com',
      passwordHash: customerPasswordHash,
      name: 'Priya Nair',
      phone: '+91 97405 88912',
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            recipientName: 'Priya Nair',
            phone: '+91 97405 88912',
            street: 'Villa 14, Silver Oak Enclave, Indiranagar',
            landmark: 'Near 100ft Road Metro',
            city: 'Bengaluru',
            postalCode: '560038',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('Seeding coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'ROYAL10',
        description: '10% privilege discount on signature orders above ₹800',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 800,
        maxDiscountAmount: 250,
        isActive: true,
      },
      {
        code: 'FIRSTBITE',
        description: '₹150 welcome curations for culinary patrons on orders above ₹600',
        discountType: DiscountType.FIXED,
        discountValue: 150,
        minOrderAmount: 600,
        maxDiscountAmount: 150,
        isActive: true,
      },
      {
        code: 'FEAST20',
        description: '20% off for banquet orders above ₹1,800',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderAmount: 1800,
        maxDiscountAmount: 500,
        isActive: true,
      },
    ],
  });

  console.log('Seeding menu categories...');
  const catBiryani = await prisma.category.create({
    data: {
      name: 'Awadhi & Dum Biryanis',
      slug: 'dum-biryanis',
      description: 'Slow-cooked in clay handis, sealed with whole wheat dough, layered with aged basmati and pure saffron.',
      sortOrder: 1,
    },
  });

  const catStarters = await prisma.category.create({
    data: {
      name: 'Charcoal & Tandoor Kebabs',
      slug: 'charcoal-kebabs',
      description: 'Charred gently over babool embers, spiced with handcrafted potli masalas and hung curd marinades.',
      sortOrder: 2,
    },
  });

  const catCurries = await prisma.category.create({
    data: {
      name: 'Royal Heritage Curries',
      slug: 'royal-curries',
      description: 'Simmered overnight in heavy brass deghs with fragrant rose petal extracts, mace, and crushed cashew creams.',
      sortOrder: 3,
    },
  });

  const catBreads = await prisma.category.create({
    data: {
      name: 'Artisanal Breads & Kulchas',
      slug: 'artisanal-breads',
      description: 'Freshly slapped on red-hot clay tandoor walls, brushed generously with churned white butter.',
      sortOrder: 4,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      name: 'Heritage Confections & Mithai',
      slug: 'heritage-desserts',
      description: 'Rich royal desserts crowned with pure varq (silver leaf), roasted pistachio slivers, and warm saffron reduction.',
      sortOrder: 5,
    },
  });

  const catBeverages = await prisma.category.create({
    data: {
      name: 'Signature Sharbat & Beverages',
      slug: 'signature-beverages',
      description: 'Handcrafted cold elixirs, fragrant floral infusions, and slow-churned heritage buttermilk.',
      sortOrder: 6,
    },
  });

  console.log('Seeding menu items with verified authentic culinary imagery...');
  // 1. Biryanis
  const biryaniAwadhi = await prisma.menuItem.create({
    data: {
      name: 'Nawabi Mutton Dum Biryani',
      slug: 'nawabi-mutton-dum-biryani',
      description: 'Tender baby mutton marinated in raw papaya, brown onion paste, and ittar, slow-baked with aged 2-year old Daawat basmati in sealed handi.',
      price: 685.00,
      categoryId: catBiryani.id,
      isVeg: false,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/nawabi_mutton_biryani.jpg',
      prepTimeMinutes: 30,
      spiceLevel: 2,
      calories: 780,
      allergens: 'Contains Dairy',
      addons: {
        create: [
          { name: 'Burani Garlic Raita', price: 65.00 },
          { name: 'Extra Salan Gravy (200ml)', price: 75.00 },
          { name: 'Boiled Egg (2 pcs)', price: 45.00 },
        ],
      },
    },
  });

  const biryaniChicken = await prisma.menuItem.create({
    data: {
      name: 'Murgh Dum Pukht Biryani',
      slug: 'murgh-dum-pukht-biryani',
      description: 'Farm-fresh chicken thighs steeped in Kashmiri saffron, caramelized garlic, and whole mace, steam-infused under sealed dough.',
      price: 545.00,
      categoryId: catBiryani.id,
      isVeg: false,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/murgh_dum_biryani.jpg',
      prepTimeMinutes: 25,
      spiceLevel: 2,
      calories: 690,
      allergens: 'Contains Dairy',
      addons: {
        create: [
          { name: 'Burani Garlic Raita', price: 65.00 },
          { name: 'Pineapple Mint Raita', price: 70.00 },
        ],
      },
    },
  });

  const biryaniVeg = await prisma.menuItem.create({
    data: {
      name: 'Subz Shahi Dum Handi Biryani',
      slug: 'subz-shahi-dum-biryani',
      description: 'French beans, baby carrots, royal morel mushrooms, and fresh cottage cheese cubes cooked with whole spices and kewra essence.',
      price: 465.00,
      categoryId: catBiryani.id,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/subz_dum_biryani.jpg',
      prepTimeMinutes: 20,
      spiceLevel: 1,
      calories: 520,
      allergens: 'Contains Dairy, Nuts',
      addons: {
        create: [
          { name: 'Burani Garlic Raita', price: 65.00 },
          { name: 'Roasted Papad & Onion Chutney', price: 40.00 },
        ],
      },
    },
  });

  // 2. Kebabs
  const kebabGalouti = await prisma.menuItem.create({
    data: {
      name: 'Lucknowi Mutton Galouti Kebab',
      slug: 'lucknowi-mutton-galouti-kebab',
      description: 'Melt-in-mouth smoked lamb patties infused with 160 aromatic potli herbs, seared on a heavy mahi tawa, served atop mini ulte tawe ke parathe.',
      price: 620.00,
      categoryId: catStarters.id,
      isVeg: false,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/galouti_kebab.jpg',
      prepTimeMinutes: 20,
      spiceLevel: 2,
      calories: 580,
      allergens: 'Contains Dairy, Gluten',
      addons: {
        create: [
          { name: 'Extra Mini Ulte Tawe Paratha (2 pcs)', price: 70.00 },
          { name: 'Mint Coriander Dip', price: 30.00 },
        ],
      },
    },
  });

  const kebabPaneer = await prisma.menuItem.create({
    data: {
      name: 'Angaari Paneer Tikka',
      slug: 'angaari-paneer-tikka',
      description: 'Cubes of fresh organic malai paneer steeped in mustard oil, yellow chili powder, and carom seeds, blistered crisp in clay tandoor.',
      price: 440.00,
      categoryId: catStarters.id,
      isVeg: true,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/paneer_tikka.jpg',
      prepTimeMinutes: 18,
      spiceLevel: 3,
      calories: 490,
      allergens: 'Contains Dairy',
      addons: {
        create: [
          { name: 'Extra Lachha Onion & Green Chili', price: 25.00 },
          { name: 'Amritsari Green Chutney', price: 35.00 },
        ],
      },
    },
  });

  const kebabMalai = await prisma.menuItem.create({
    data: {
      name: 'Murgh Malai Kastoori Tikka',
      slug: 'murgh-malai-kastoori-tikka',
      description: 'Tender chicken supreme cured with hung curd, green cardamom, processed cheese, and aromatic kastoori methi leaves.',
      price: 520.00,
      categoryId: catStarters.id,
      isVeg: false,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/murgh_malai_tikka.jpg',
      prepTimeMinutes: 22,
      spiceLevel: 1,
      calories: 540,
      allergens: 'Contains Dairy',
    },
  });

  // 3. Curries
  const curryButterChicken = await prisma.menuItem.create({
    data: {
      name: 'Purani Dilli Butter Chicken (Aslam Style)',
      slug: 'purani-dilli-butter-chicken',
      description: 'Tandoor-roasted bone-in chicken finished in a velvety, buttery san-marzano tomato reduction with roasted fenugreek and heavy fresh cream.',
      price: 575.00,
      categoryId: catCurries.id,
      isVeg: false,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/butter_chicken.jpg',
      prepTimeMinutes: 25,
      spiceLevel: 2,
      calories: 680,
      allergens: 'Contains Dairy, Cashews',
      addons: {
        create: [
          { name: 'Extra Makkhan (Churned Butter Float)', price: 40.00 },
          { name: 'Boneless Meat Upgrade', price: 75.00 },
        ],
      },
    },
  });

  const curryDalBukhara = await prisma.menuItem.create({
    data: {
      name: 'Dastaan Signature Dal Bukhara',
      slug: 'dastaan-dal-bukhara',
      description: 'Whole black urad lentils slow-simmered over live embers for 24 continuous hours with vine-ripened tomatoes and white churned butter.',
      price: 435.00,
      categoryId: catCurries.id,
      isVeg: true,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/dal_bukhara.jpg',
      prepTimeMinutes: 15,
      spiceLevel: 1,
      calories: 460,
      allergens: 'Contains Dairy',
      addons: {
        create: [
          { name: 'Extra Fresh Dairy Cream & Butter', price: 40.00 },
        ],
      },
    },
  });

  const curryRoganJosh = await prisma.menuItem.create({
    data: {
      name: 'Kashmiri Rogan Josh Lazeez',
      slug: 'kashmiri-rogan-josh',
      description: 'Slow-braised spring lamb shanks cooked in natural Ratanjot root oil, dried Kashmiri chillies, and sun-dried ginger.',
      price: 660.00,
      categoryId: catCurries.id,
      isVeg: false,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/rogan_josh.jpg',
      prepTimeMinutes: 25,
      spiceLevel: 3,
      calories: 630,
      allergens: 'Contains Dairy',
    },
  });

  const curryPaneerLababdar = await prisma.menuItem.create({
    data: {
      name: 'Shahi Paneer Lababdar',
      slug: 'shahi-paneer-lababdar',
      description: 'Soft cottage cheese simmered in a luscious onion-tomato gravy with grated paneer, roasted melon seeds, and fragrant coriander seeds.',
      price: 460.00,
      categoryId: catCurries.id,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/paneer_lababdar.jpg',
      prepTimeMinutes: 20,
      spiceLevel: 2,
      calories: 520,
      allergens: 'Contains Dairy, Nuts',
    },
  });

  // 4. Artisanal Breads
  const breadTruffleNaan = await prisma.menuItem.create({
    data: {
      name: 'Charcoal Garlic Truffle Naan',
      slug: 'charcoal-garlic-truffle-naan',
      description: 'Refined flour bread charred in clay tandoor, spiked with crushed roasted garlic cloves and brushed with Italian black truffle oil butter.',
      price: 165.00,
      categoryId: catBreads.id,
      isVeg: true,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/truffle_garlic_naan.jpg',
      prepTimeMinutes: 10,
      spiceLevel: 1,
      calories: 280,
      allergens: 'Contains Gluten, Dairy',
    },
  });

  const breadWarqiParatha = await prisma.menuItem.create({
    data: {
      name: 'Shahi Warqi Paratha',
      slug: 'shahi-warqi-paratha',
      description: 'Multi-layered flaky Awadhi flatbread folded with clarified desi ghee and saffron-infused milk.',
      price: 135.00,
      categoryId: catBreads.id,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/warqi_paratha.jpg',
      prepTimeMinutes: 12,
      spiceLevel: 1,
      calories: 310,
      allergens: 'Contains Gluten, Dairy',
    },
  });

  // 5. Desserts
  const dessertShahiTukda = await prisma.menuItem.create({
    data: {
      name: 'Royal Shahi Tukda Jama Masjid',
      slug: 'royal-shahi-tukda',
      description: 'Crisp ghee-fried bread steeped in cardamom sugar syrup, drowned in 8-hour reduced khoya rabdi, and embellished with chandi varq.',
      price: 295.00,
      categoryId: catDesserts.id,
      isVeg: true,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/shahi_tukda.jpg',
      prepTimeMinutes: 10,
      spiceLevel: 1,
      calories: 420,
      allergens: 'Contains Dairy, Gluten, Nuts',
    },
  });

  const dessertGulabJamun = await prisma.menuItem.create({
    data: {
      name: 'Flambéed Angaari Gulab Jamun',
      slug: 'flambeed-gulab-jamun',
      description: 'Handmade evaporated milk dumplings filled with pistachio center, lightly flambéed at your table with spiced saffron syrup.',
      price: 245.00,
      categoryId: catDesserts.id,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/gulab_jamun.jpg',
      prepTimeMinutes: 10,
      spiceLevel: 1,
      calories: 360,
      allergens: 'Contains Dairy, Nuts',
    },
  });

  // 6. Beverages
  const bevLassi = await prisma.menuItem.create({
    data: {
      name: 'Kesar Pista Malai Lassi',
      slug: 'kesar-pista-malai-lassi',
      description: 'Hand-churned thick buffalo milk yogurt scented with pure Iranian saffron threads, topped with a thick dollop of malai and slivered almonds.',
      price: 220.00,
      categoryId: catBeverages.id,
      isVeg: true,
      isFeatured: true,
      isAvailable: true,
      imageUrl: '/images/dishes/kesar_pista_lassi.jpg',
      prepTimeMinutes: 8,
      spiceLevel: 1,
      calories: 310,
      allergens: 'Contains Dairy, Nuts',
    },
  });

  const bevRoseSharbat = await prisma.menuItem.create({
    data: {
      name: 'Khus & Gulab Cold Elixir',
      slug: 'khus-gulab-elixir',
      description: 'Wild vetiver root distillate infused with Kannauj damask rose petals, chia seeds, and chilled Himalayan spring water.',
      price: 185.00,
      categoryId: catBeverages.id,
      isVeg: true,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '/images/dishes/khus_gulab_elixir.jpg',
      prepTimeMinutes: 6,
      spiceLevel: 1,
      calories: 140,
    },
  });

  console.log('Seeding initial realistic orders and status histories...');
  // Order 1: Completed earlier today
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261016-1001',
      userId: customer1.id,
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      customerPhone: '+91 98112 34567',
      orderType: OrderType.DELIVERY,
      deliveryAddress: 'Flat 402, Royal Palms, Golf Course Road, Gurugram 122002',
      orderNotes: 'Please ring the doorbell and leave at doorstep.',
      subtotal: 1350.00,
      taxAmount: 67.50,
      deliveryFee: 0.00,
      discountAmount: 135.00,
      totalAmount: 1282.50,
      couponCode: 'ROYAL10',
      paymentMethod: PaymentMethod.UPI_SIMULATED,
      paymentStatus: PaymentStatus.PAID,
      currentStatus: OrderStatus.COMPLETED,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      items: {
        create: [
          {
            menuItemId: biryaniAwadhi.id,
            itemName: 'Nawabi Mutton Dum Biryani',
            itemPrice: 685.00,
            quantity: 1,
            subtotal: 685.00,
            selectedAddons: JSON.stringify([{ name: 'Burani Garlic Raita', price: 65 }]),
          },
          {
            menuItemId: kebabGalouti.id,
            itemName: 'Lucknowi Mutton Galouti Kebab',
            itemPrice: 620.00,
            quantity: 1,
            subtotal: 620.00,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: OrderStatus.PLACED,
            notes: 'Order placed via Online Web Application',
            changedBy: 'CUSTOMER',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.CONFIRMED,
            notes: 'Kitchen confirmed preparation',
            changedBy: 'ADMIN',
            timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.PREPARING,
            notes: 'Executive Chef started slow-cooking handi',
            changedBy: 'KITCHEN',
            timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.OUT_FOR_DELIVERY,
            notes: 'Dispatched with Valet Rajesh Kumar (+91 98711 22334)',
            changedBy: 'ADMIN',
            timestamp: new Date(Date.now() - 3.1 * 60 * 60 * 1000),
          },
          {
            status: OrderStatus.COMPLETED,
            notes: 'Delivered securely to patron',
            changedBy: 'ADMIN',
            timestamp: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Order 2: Currently in PREPARING
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261016-1002',
      userId: customer2.id,
      customerName: 'Priya Nair',
      customerEmail: 'priya.nair@example.com',
      customerPhone: '+91 97405 88912',
      orderType: OrderType.DELIVERY,
      deliveryAddress: 'Villa 14, Silver Oak Enclave, Indiranagar, Bengaluru 560038',
      orderNotes: 'Less spicy please, child dining.',
      subtotal: 1040.00,
      taxAmount: 52.00,
      deliveryFee: 50.00,
      discountAmount: 104.00,
      totalAmount: 1038.00,
      couponCode: 'ROYAL10',
      paymentMethod: PaymentMethod.CARD_SIMULATED,
      paymentStatus: PaymentStatus.PAID,
      currentStatus: OrderStatus.PREPARING,
      createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
      items: {
        create: [
          {
            menuItemId: curryButterChicken.id,
            itemName: 'Purani Dilli Butter Chicken (Aslam Style)',
            itemPrice: 575.00,
            quantity: 1,
            subtotal: 575.00,
          },
          {
            menuItemId: curryDalBukhara.id,
            itemName: 'Dastaan Signature Dal Bukhara',
            itemPrice: 435.00,
            quantity: 1,
            subtotal: 435.00,
          },
          {
            menuItemId: breadTruffleNaan.id,
            itemName: 'Charcoal Garlic Truffle Naan',
            itemPrice: 165.00,
            quantity: 2,
            subtotal: 330.00,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: OrderStatus.PLACED,
            notes: 'Order placed via Online Web Application',
            changedBy: 'CUSTOMER',
            timestamp: new Date(Date.now() - 35 * 60 * 1000),
          },
          {
            status: OrderStatus.CONFIRMED,
            notes: 'Order verified by Front Desk',
            changedBy: 'ADMIN',
            timestamp: new Date(Date.now() - 28 * 60 * 1000),
          },
          {
            status: OrderStatus.PREPARING,
            notes: 'Tandoor master preparing breads and curries',
            changedBy: 'KITCHEN',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Order 3: Newly PLACED (awaiting confirmation)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261016-1003',
      userId: null,
      customerName: 'Dr. Amitav Roy',
      customerEmail: 'amitav.roy@example.com',
      customerPhone: '+91 98301 77654',
      orderType: OrderType.PICKUP,
      deliveryAddress: null,
      orderNotes: 'Will pick up in 20 minutes personally in silver Honda City.',
      subtotal: 825.00,
      taxAmount: 41.25,
      deliveryFee: 0.00,
      discountAmount: 0.00,
      totalAmount: 866.25,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      currentStatus: OrderStatus.PLACED,
      createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 mins ago
      items: {
        create: [
          {
            menuItemId: biryaniChicken.id,
            itemName: 'Murgh Dum Pukht Biryani',
            itemPrice: 545.00,
            quantity: 1,
            subtotal: 545.00,
          },
          {
            menuItemId: dessertShahiTukda.id,
            itemName: 'Royal Shahi Tukda Jama Masjid',
            itemPrice: 295.00,
            quantity: 1,
            subtotal: 295.00,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: OrderStatus.PLACED,
            notes: 'Order received via portal - Awaiting kitchen review',
            changedBy: 'CUSTOMER',
            timestamp: new Date(Date.now() - 8 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully with exact matching culinary images!');
  console.log('Admin account: admin@dastaan.com / Admin@12345');
  console.log('Customer account: rahul.sharma@example.com / Customer@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
