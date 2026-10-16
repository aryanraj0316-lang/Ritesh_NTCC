import bcrypt from 'bcryptjs';

// Pre-computed hashes for demo credentials
// admin@dastaan.com -> Admin@12345
const ADMIN_HASH = bcrypt.hashSync('Admin@12345', 10);
// customer@example.com -> Customer@123
const CUSTOMER_HASH = bcrypt.hashSync('Customer@123', 10);

export interface InMemoryState {
  users: any[];
  addresses: any[];
  categories: any[];
  menuItems: any[];
  menuItemAddons: any[];
  orders: any[];
  orderItems: any[];
  orderStatusHistories: any[];
  coupons: any[];
}

function initializeState(): InMemoryState {
  const categories = [
    { id: 'cat-1', name: 'Dum Biryani & Rice', slug: 'dum-biryani-rice', description: 'Slow-cooked in sealed clay handis with aged basmati rice', sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-2', name: 'Clay Oven Kebabs', slug: 'clay-oven-kebabs', description: 'Charcoal-smoked delicacies marinated in cold-pressed mustard oil', sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-3', name: 'Royal Curries', slug: 'royal-curries', description: 'Simmered overnight in heritage gravies with stone-ground spices', sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-4', name: 'Artisanal Breads', slug: 'artisanal-breads', description: 'Handcrafted flatbreads baked fresh in tandoor', sortOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-5', name: 'Shahi Desserts', slug: 'shahi-desserts', description: 'Traditional confections sweetened with raw palm jaggery & saffron', sortOrder: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-6', name: 'Beverages & Elixirs', slug: 'beverages-elixirs', description: 'Ayurvedic cooling sherbets and whipped yogurt infusions', sortOrder: 6, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  const menuItems = [
    {
      id: 'dish-1',
      name: 'Nawabi Mutton Dum Biryani',
      slug: 'nawabi-mutton-dum-biryani',
      description: 'Tender baby goat shank slow-braised for 6 hours in sealed dough handi with aged Himalayan basmati, whole green cardamom, and saffron mist.',
      price: 685,
      categoryId: 'cat-1',
      imageUrl: '/images/dishes/nawabi_mutton_biryani.jpg',
      isVeg: false,
      spiceLevel: 3,
      prepTimeMinutes: 35,
      calories: 780,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-2',
      name: 'Murgh Dum Pukht Biryani',
      slug: 'murgh-dum-pukht-biryani',
      description: 'Succulent chicken morsels infused with kewra essence, caramelized onions, and royal garam masala, layered over fragrant basmati.',
      price: 545,
      categoryId: 'cat-1',
      imageUrl: '/images/dishes/murgh_dum_biryani.jpg',
      isVeg: false,
      spiceLevel: 2,
      prepTimeMinutes: 30,
      calories: 690,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-3',
      name: 'Subz Nizami Dum Biryani',
      slug: 'subz-nizami-dum-biryani',
      description: 'Seasonal farm heirloom florets, water chestnuts, baby carrots, and mint leaves steamed in aromatic broth with saffron-tinted long-grain rice.',
      price: 445,
      categoryId: 'cat-1',
      imageUrl: '/images/dishes/subz_dum_biryani.jpg',
      isVeg: true,
      spiceLevel: 2,
      prepTimeMinutes: 25,
      calories: 520,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-4',
      name: 'Awadhi Galouti Kebab',
      slug: 'awadhi-galouti-kebab',
      description: 'Melt-in-mouth smoked lamb patties infused with 160 secret medicinal potli herbs, served with golden ulte tawe ka paratha.',
      price: 585,
      categoryId: 'cat-2',
      imageUrl: '/images/dishes/galouti_kebab.jpg',
      isVeg: false,
      spiceLevel: 2,
      prepTimeMinutes: 25,
      calories: 580,
      allergens: 'Gluten, Nuts',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-5',
      name: 'Peshawari Paneer Tikka',
      slug: 'peshawari-paneer-tikka',
      description: 'Artisanal malai cottage cheese cubes cured in hung curd, yellow chili powder, crushed ajwain, and char-grilled over smoldering sal wood.',
      price: 465,
      categoryId: 'cat-2',
      imageUrl: '/images/dishes/paneer_tikka.jpg',
      isVeg: true,
      spiceLevel: 2,
      prepTimeMinutes: 20,
      calories: 490,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-6',
      name: 'Murgh Malai Chaap Tikka',
      slug: 'murgh-malai-chaap-tikka',
      description: 'Boneless chicken supreme cuts steeped in cream cheese, white pepper, royal cardamom, and roasted garlic emulsion.',
      price: 525,
      categoryId: 'cat-2',
      imageUrl: '/images/dishes/murgh_malai_tikka.jpg',
      isVeg: false,
      spiceLevel: 1,
      prepTimeMinutes: 25,
      calories: 610,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-7',
      name: 'Dastaan Asli Butter Chicken',
      slug: 'dastaan-asli-butter-chicken',
      description: 'Hand-pulled tandoori chicken simmered in stone-milled vine-ripened plum tomato veloute, finished with white churned butter and kasoori methi.',
      price: 575,
      categoryId: 'cat-3',
      imageUrl: '/images/dishes/butter_chicken.jpg',
      isVeg: false,
      spiceLevel: 2,
      prepTimeMinutes: 30,
      calories: 740,
      allergens: 'Dairy, Nuts',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-8',
      name: 'Dal Bukhara Overnight Stew',
      slug: 'dal-bukhara-overnight-stew',
      description: 'Whole black urad lentils slow-simmered over live charcoal embers for 24 continuous hours with dairy cream, garlic puree, and plum tomatoes.',
      price: 445,
      categoryId: 'cat-3',
      imageUrl: '/images/dishes/dal_bukhara.jpg',
      isVeg: true,
      spiceLevel: 1,
      prepTimeMinutes: 20,
      calories: 460,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-9',
      name: 'Kashmiri Mutton Rogan Josh',
      slug: 'kashmiri-mutton-rogan-josh',
      description: 'Prime cut pot-roasted goat cooked in authentic Kashmiri deggi mirch, fennel essence, and ratanjot herb bark extracts.',
      price: 665,
      categoryId: 'cat-3',
      imageUrl: '/images/dishes/rogan_josh.jpg',
      isVeg: false,
      spiceLevel: 3,
      prepTimeMinutes: 35,
      calories: 710,
      allergens: 'Dairy',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-10',
      name: 'Paneer Lababdar Shahi Gravy',
      slug: 'paneer-lababdar-shahi-gravy',
      description: 'Cottage cheese cubes bathed in rich onion-melon seed and cashew gravy with grated paneer reduction and whole aromatic spices.',
      price: 495,
      categoryId: 'cat-3',
      imageUrl: '/images/dishes/paneer_lababdar.jpg',
      isVeg: true,
      spiceLevel: 2,
      prepTimeMinutes: 25,
      calories: 560,
      allergens: 'Dairy, Nuts',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-11',
      name: 'Truffle Butter Garlic Naan',
      slug: 'truffle-butter-garlic-naan',
      description: 'Tandoor-blistered leavened bread brushed with wild summer truffle butter, toasted garlic granules, and fresh garden chives.',
      price: 185,
      categoryId: 'cat-4',
      imageUrl: '/images/dishes/truffle_garlic_naan.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 12,
      calories: 290,
      allergens: 'Gluten, Dairy',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-12',
      name: 'Warqi Laccha Paratha',
      slug: 'warqi-laccha-paratha',
      description: 'Multi-layered flaky whole wheat bread infused with smoked ghee, ajwain seeds, and crushed dried fenugreek leaves.',
      price: 135,
      categoryId: 'cat-4',
      imageUrl: '/images/dishes/warqi_paratha.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 12,
      calories: 270,
      allergens: 'Gluten, Dairy',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-13',
      name: 'Shahi Awadhi Tukda with Rabdi',
      slug: 'shahi-awadhi-tukda-rabdi',
      description: 'Crisp ghee-fried bread soaked in cardamom sugar syrup, crowned with 8-hour reduced saffron rabdi and 24K edible gold vark.',
      price: 295,
      categoryId: 'cat-5',
      imageUrl: '/images/dishes/shahi_tukda.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 15,
      calories: 420,
      allergens: 'Gluten, Dairy, Nuts',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-14',
      name: 'Angaari Gulab Jamun Flambé',
      slug: 'angaari-gulab-jamun-flambe',
      description: 'Mawa spheres stuffed with green pistachio and wild rose petal gulkand, soaked in hot saffron and cardamom attar syrup.',
      price: 245,
      categoryId: 'cat-5',
      imageUrl: '/images/dishes/gulab_jamun.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 10,
      calories: 380,
      allergens: 'Dairy, Nuts',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-15',
      name: 'Kesar Pista Malai Lassi',
      slug: 'kesar-pista-malai-lassi',
      description: 'Traditional earthen pot churned organic yogurt infused with Kashmiri saffron threads, slivered green pistachios, and thick clotted cream.',
      price: 215,
      categoryId: 'cat-6',
      imageUrl: '/images/dishes/kesar_pista_lassi.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 8,
      calories: 310,
      allergens: 'Dairy, Nuts',
      isAvailable: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dish-16',
      name: 'Khus Gulab Heritage Elixir',
      slug: 'khus-gulab-heritage-elixir',
      description: 'Sparkling botanical infusion of natural vetiver root (khus), Damascus rose water, basil seeds (sabja), and cold-pressed lime.',
      price: 195,
      categoryId: 'cat-6',
      imageUrl: '/images/dishes/khus_gulab_elixir.jpg',
      isVeg: true,
      spiceLevel: 0,
      prepTimeMinutes: 5,
      calories: 140,
      allergens: 'None',
      isAvailable: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const menuItemAddons = [
    { id: 'acc-1', menuItemId: 'dish-1', name: 'Burani Garlic Raita', price: 65, isRequired: false, maxSelection: 1 },
    { id: 'acc-2', menuItemId: 'dish-1', name: 'Mirchi Ka Salan', price: 75, isRequired: false, maxSelection: 1 },
    { id: 'acc-3', menuItemId: 'dish-1', name: 'Sirka Pyaz & Mint Chutney', price: 35, isRequired: false, maxSelection: 1 },
    { id: 'acc-4', menuItemId: 'dish-2', name: 'Kewra Infused Raita', price: 55, isRequired: false, maxSelection: 1 },
    { id: 'acc-5', menuItemId: 'dish-2', name: 'Extra Salan Gravy', price: 70, isRequired: false, maxSelection: 1 },
    { id: 'acc-6', menuItemId: 'dish-3', name: 'Pomegranate Raita', price: 65, isRequired: false, maxSelection: 1 },
    { id: 'acc-7', menuItemId: 'dish-3', name: 'Roasted Papad Medley', price: 40, isRequired: false, maxSelection: 1 },
    { id: 'acc-8', menuItemId: 'dish-4', name: 'Ulte Tawe Ka Paratha (2 Pcs)', price: 95, isRequired: false, maxSelection: 2 },
    { id: 'acc-9', menuItemId: 'dish-4', name: 'Laccha Onion with Walnut Dip', price: 45, isRequired: false, maxSelection: 1 },
    { id: 'acc-10', menuItemId: 'dish-5', name: 'Mint Coriander Relish', price: 30, isRequired: false, maxSelection: 1 },
    { id: 'acc-11', menuItemId: 'dish-6', name: 'Spiced Bell Pepper Relish', price: 40, isRequired: false, maxSelection: 1 },
    { id: 'acc-12', menuItemId: 'dish-7', name: 'Fresh Cream Float', price: 40, isRequired: false, maxSelection: 1 },
    { id: 'acc-13', menuItemId: 'dish-7', name: 'Ginger Juliennes & Green Chili', price: 20, isRequired: false, maxSelection: 1 },
    { id: 'acc-14', menuItemId: 'dish-8', name: 'White Makhan Dollop', price: 45, isRequired: false, maxSelection: 1 },
    { id: 'acc-15', menuItemId: 'dish-9', name: 'Kashmiri Walnut Chutney', price: 60, isRequired: false, maxSelection: 1 },
    { id: 'acc-16', menuItemId: 'dish-10', name: 'Fresh Coriander Crisp', price: 20, isRequired: false, maxSelection: 1 },
  ];

  const coupons = [
    {
      id: 'cpn-1',
      code: 'ROYAL10',
      description: '10% Royal Welcome Discount on orders above ₹500',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscountAmount: 300,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'cpn-2',
      code: 'FIRSTBITE',
      description: '₹150 Flat Savings for your maiden feast above ₹800',
      discountType: 'FIXED',
      discountValue: 150,
      minOrderAmount: 800,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'cpn-3',
      code: 'FEAST20',
      description: '20% Grand Gathering Discount on orders above ₹2000',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 2000,
      maxDiscountAmount: 800,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  const users = [
    {
      id: 'usr-admin',
      email: 'admin@dastaan.com',
      passwordHash: ADMIN_HASH,
      name: 'Farhan Qureshi',
      phone: '+91 98201 44521',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'usr-customer-1',
      email: 'rahul.sharma@example.com',
      passwordHash: CUSTOMER_HASH,
      name: 'Rahul Sharma',
      phone: '+91 98112 34567',
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const addresses = [
    {
      id: 'addr-1',
      userId: 'usr-customer-1',
      recipientName: 'Rahul Sharma',
      phone: '+91 98112 34567',
      street: 'Tower 4, Apt 1102, DLF Magnolias, Golf Course Road',
      landmark: 'Near Club House',
      city: 'Gurugram',
      postalCode: '122002',
      isDefault: true,
      createdAt: new Date(),
    },
  ];

  const orders: any[] = [
    {
      id: 'ord-1',
      orderNumber: 'DST-2026-90412',
      userId: 'usr-customer-1',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      customerPhone: '+91 98112 34567',
      orderType: 'DELIVERY',
      deliveryAddress: 'Tower 4, Apt 1102, DLF Magnolias, Golf Course Road, Gurugram - 122002',
      orderNotes: 'Please ring bell once and leave at front door.',
      subtotal: 1260,
      taxAmount: 63,
      deliveryFee: 50,
      discountAmount: 126,
      totalAmount: 1247,
      couponCode: 'ROYAL10',
      paymentMethod: 'UPI_SIMULATED',
      paymentStatus: 'PAID',
      currentStatus: 'PREPARING',
      cancellationReason: null,
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000),
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: 'ord-2',
      orderNumber: 'DST-2026-90411',
      userId: 'usr-customer-1',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      customerPhone: '+91 98112 34567',
      orderType: 'DELIVERY',
      deliveryAddress: 'Tower 4, Apt 1102, DLF Magnolias, Golf Course Road, Gurugram - 122002',
      orderNotes: null,
      subtotal: 1030,
      taxAmount: 51.5,
      deliveryFee: 50,
      discountAmount: 150,
      totalAmount: 981.5,
      couponCode: 'FIRSTBITE',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      currentStatus: 'COMPLETED',
      cancellationReason: null,
      estimatedDeliveryTime: null,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  ];

  const orderItems = [
    {
      id: 'item-1',
      orderId: 'ord-1',
      menuItemId: 'dish-1',
      itemName: 'Nawabi Mutton Dum Biryani',
      itemPrice: 685,
      quantity: 1,
      subtotal: 685,
      selectedAddons: JSON.stringify([{ name: 'Burani Garlic Raita', price: 65 }]),
    },
    {
      id: 'item-2',
      orderId: 'ord-1',
      menuItemId: 'dish-7',
      itemName: 'Dastaan Asli Butter Chicken',
      itemPrice: 575,
      quantity: 1,
      subtotal: 575,
      selectedAddons: JSON.stringify([{ name: 'Fresh Cream Float', price: 40 }]),
    },
    {
      id: 'item-3',
      orderId: 'ord-2',
      menuItemId: 'dish-4',
      itemName: 'Awadhi Galouti Kebab',
      itemPrice: 585,
      quantity: 1,
      subtotal: 585,
      selectedAddons: JSON.stringify([{ name: 'Ulte Tawe Ka Paratha (2 Pcs)', price: 95 }]),
    },
    {
      id: 'item-4',
      orderId: 'ord-2',
      menuItemId: 'dish-8',
      itemName: 'Dal Bukhara Overnight Stew',
      itemPrice: 445,
      quantity: 1,
      subtotal: 445,
      selectedAddons: JSON.stringify([{ name: 'White Makhan Dollop', price: 45 }]),
    },
  ];

  const orderStatusHistories = [
    { id: 'osh-1', orderId: 'ord-1', status: 'PLACED', notes: 'Order placed by guest patron', changedAt: new Date(Date.now() - 20 * 60 * 1000) },
    { id: 'osh-2', orderId: 'ord-1', status: 'CONFIRMED', notes: 'Confirmed by royal kitchen desk', changedAt: new Date(Date.now() - 15 * 60 * 1000) },
    { id: 'osh-3', orderId: 'ord-1', status: 'PREPARING', notes: 'Cooking in sealed clay handi', changedAt: new Date(Date.now() - 10 * 60 * 1000) },
    { id: 'osh-4', orderId: 'ord-2', status: 'PLACED', notes: null, changedAt: new Date(Date.now() - 180 * 60 * 1000) },
    { id: 'osh-5', orderId: 'ord-2', status: 'CONFIRMED', notes: null, changedAt: new Date(Date.now() - 170 * 60 * 1000) },
    { id: 'osh-6', orderId: 'ord-2', status: 'PREPARING', notes: null, changedAt: new Date(Date.now() - 150 * 60 * 1000) },
    { id: 'osh-7', orderId: 'ord-2', status: 'OUT_FOR_DELIVERY', notes: null, changedAt: new Date(Date.now() - 120 * 60 * 1000) },
    { id: 'osh-8', orderId: 'ord-2', status: 'COMPLETED', notes: null, changedAt: new Date(Date.now() - 90 * 60 * 1000) },
  ];

  return {
    users,
    addresses,
    categories,
    menuItems,
    menuItemAddons,
    orders,
    orderItems,
    orderStatusHistories,
    coupons,
  };
}

let state: InMemoryState = initializeState();

function matchWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const condition = where[key];
    if (condition === undefined) continue;

    if (key === 'OR' && Array.isArray(condition)) {
      const orMatched = condition.some((cond: any) => matchWhere(item, cond));
      if (!orMatched) return false;
      continue;
    }

    if (key === 'AND' && Array.isArray(condition)) {
      const andMatched = condition.every((cond: any) => matchWhere(item, cond));
      if (!andMatched) return false;
      continue;
    }

    const itemVal = item[key];
    if (condition !== null && typeof condition === 'object' && !(condition instanceof Date)) {
      if ('contains' in condition) {
        const needle = String(condition.contains).toLowerCase();
        const haystack = String(itemVal || '').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if ('in' in condition && Array.isArray(condition.in)) {
        if (!condition.in.includes(itemVal)) return false;
      }
      if ('not' in condition) {
        if (itemVal === condition.not) return false;
      }
      if ('gte' in condition) {
        if (new Date(itemVal) < new Date(condition.gte)) return false;
      }
      if ('lte' in condition) {
        if (new Date(itemVal) > new Date(condition.lte)) return false;
      }
      if ('equals' in condition) {
        if (itemVal !== condition.equals) return false;
      }
    } else {
      if (itemVal !== condition) return false;
    }
  }
  return true;
}

export const inMemoryDb: any = {
  user: {
    findUnique: async (args: any) => {
      const found = state.users.find((u) => matchWhere(u, args.where));
      if (!found) return null;
      const res = { ...found };
      if (args.include?.addresses) {
        res.addresses = state.addresses.filter((a) => a.userId === found.id);
      }
      if (args.include?.orders) {
        res.orders = state.orders.filter((o) => o.userId === found.id);
      }
      return res;
    },
    findFirst: async (args: any) => {
      const found = state.users.find((u) => matchWhere(u, args?.where));
      return found ? { ...found } : null;
    },
    findMany: async (args: any) => {
      let list = state.users.filter((u) => matchWhere(u, args?.where));
      if (args?.select) {
        return list.map((u) => {
          const mapped: any = {};
          for (const key of Object.keys(args.select)) {
            if (key === 'orders') {
              mapped.orders = state.orders.filter((o) => o.userId === u.id);
            } else if (key === '_count') {
              mapped._count = { orders: state.orders.filter((o) => o.userId === u.id).length };
            } else {
              mapped[key] = u[key];
            }
          }
          return mapped;
        });
      }
      return list.map((u) => {
        const res = { ...u };
        if (args?.include?.orders) {
          res.orders = state.orders.filter((o) => o.userId === u.id);
        }
        if (args?.include?.addresses) {
          res.addresses = state.addresses.filter((a) => a.userId === u.id);
        }
        if (args?.include?._count) {
          res._count = { orders: state.orders.filter((o) => o.userId === u.id).length };
        }
        return res;
      });
    },
    create: async (args: any) => {
      const newUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'CUSTOMER',
        ...args.data,
      };
      state.users.push(newUser);
      return { ...newUser };
    },
    count: async (args: any) => state.users.filter((u) => matchWhere(u, args?.where)).length,
  },

  address: {
    findMany: async (args: any) => state.addresses.filter((a) => matchWhere(a, args?.where)),
    create: async (args: any) => {
      const newAddr = {
        id: `addr-${Date.now()}`,
        createdAt: new Date(),
        ...args.data,
      };
      state.addresses.push(newAddr);
      return { ...newAddr };
    },
    delete: async (args: any) => {
      const idx = state.addresses.findIndex((a) => matchWhere(a, args.where));
      if (idx !== -1) {
        const removed = state.addresses.splice(idx, 1)[0];
        return removed;
      }
      return null;
    },
    deleteMany: async () => {
      state.addresses = [];
      return { count: 0 };
    },
  },

  category: {
    findUnique: async (args: any) => {
      const found = state.categories.find((c) => matchWhere(c, args.where));
      if (!found) return null;
      const res = { ...found };
      if (args.include?.items) {
        res.items = state.menuItems.filter((m) => m.categoryId === found.id);
      }
      if (args.include?._count) {
        res._count = { items: state.menuItems.filter((m) => m.categoryId === found.id).length };
      }
      return res;
    },
    findMany: async (args: any) => {
      let list = state.categories.filter((c) => matchWhere(c, args?.where));
      return list.map((c) => {
        const res = { ...c };
        if (args?.include?._count) {
          res._count = { items: state.menuItems.filter((m) => m.categoryId === c.id).length };
        }
        if (args?.include?.items) {
          res.items = state.menuItems.filter((m) => m.categoryId === c.id);
        }
        return res;
      });
    },
    create: async (args: any) => {
      const newCat = {
        id: `cat-${Date.now()}`,
        sortOrder: state.categories.length + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      state.categories.push(newCat);
      return { ...newCat };
    },
    update: async (args: any) => {
      const cat = state.categories.find((c) => matchWhere(c, args.where));
      if (!cat) throw new Error('Category not found');
      Object.assign(cat, args.data, { updatedAt: new Date() });
      return { ...cat };
    },
    delete: async (args: any) => {
      const idx = state.categories.findIndex((c) => matchWhere(c, args.where));
      if (idx !== -1) {
        const removed = state.categories.splice(idx, 1)[0];
        return removed;
      }
      throw new Error('Category not found');
    },
    count: async (args: any) => state.categories.filter((c) => matchWhere(c, args?.where)).length,
  },

  menuItem: {
    findUnique: async (args: any) => {
      const found = state.menuItems.find((m) => matchWhere(m, args.where));
      if (!found) return null;
      const res = { ...found };
      if (args.include?.category) {
        res.category = state.categories.find((c) => c.id === found.categoryId);
      }
      if (args.include?.addons) {
        res.addons = state.menuItemAddons.filter((a) => a.menuItemId === found.id);
      }
      if (args.include?._count) {
        res._count = { orderItems: state.orderItems.filter((o) => o.menuItemId === found.id).length };
      }
      return res;
    },
    findFirst: async (args: any) => {
      const found = state.menuItems.find((m) => matchWhere(m, args?.where));
      return found ? { ...found } : null;
    },
    findMany: async (args: any) => {
      let list = state.menuItems.filter((m) => matchWhere(m, args?.where));
      if (args?.orderBy) {
        // Simple sort if needed
      }
      return list.map((m) => {
        const res = { ...m };
        if (args?.include?.category) {
          res.category = state.categories.find((c) => c.id === m.categoryId);
        }
        if (args?.include?.addons) {
          res.addons = state.menuItemAddons.filter((a) => a.menuItemId === m.id);
        }
        return res;
      });
    },
    create: async (args: any) => {
      const data = { ...args.data };
      const addonsData = data.addons?.create || [];
      delete data.addons;

      const newDish = {
        id: `dish-${Date.now()}`,
        isAvailable: true,
        isVeg: true,
        isFeatured: false,
        prepTimeMinutes: 20,
        spiceLevel: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      state.menuItems.push(newDish);

      if (Array.isArray(addonsData)) {
        for (const addon of addonsData) {
          state.menuItemAddons.push({
            id: `addon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            menuItemId: newDish.id,
            isRequired: false,
            maxSelection: 1,
            ...addon,
          });
        }
      }

      const res: any = { ...newDish };
      if (args.include?.category) {
        res.category = state.categories.find((c) => c.id === newDish.categoryId);
      }
      if (args.include?.addons) {
        res.addons = state.menuItemAddons.filter((a) => a.menuItemId === newDish.id);
      }
      return res;
    },
    update: async (args: any) => {
      const dish = state.menuItems.find((m) => matchWhere(m, args.where));
      if (!dish) throw new Error('Menu item not found');
      Object.assign(dish, args.data, { updatedAt: new Date() });
      const res: any = { ...dish };
      if (args.include?.category) {
        res.category = state.categories.find((c) => c.id === dish.categoryId);
      }
      if (args.include?.addons) {
        res.addons = state.menuItemAddons.filter((a) => a.menuItemId === dish.id);
      }
      return res;
    },
    updateMany: async (args: any) => {
      const matched = state.menuItems.filter((m) => matchWhere(m, args.where));
      matched.forEach((m) => Object.assign(m, args.data, { updatedAt: new Date() }));
      return { count: matched.length };
    },
    delete: async (args: any) => {
      const idx = state.menuItems.findIndex((m) => matchWhere(m, args.where));
      if (idx !== -1) {
        const removed = state.menuItems.splice(idx, 1)[0];
        state.menuItemAddons = state.menuItemAddons.filter((a) => a.menuItemId !== removed.id);
        return removed;
      }
      throw new Error('Menu item not found');
    },
    count: async (args: any) => state.menuItems.filter((m) => matchWhere(m, args?.where)).length,
  },

  menuItemAddon: {
    createMany: async (args: any) => {
      if (Array.isArray(args.data)) {
        args.data.forEach((item: any) => {
          state.menuItemAddons.push({
            id: `addon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...item,
          });
        });
      }
      return { count: args.data?.length || 0 };
    },
    deleteMany: async (args: any) => {
      const before = state.menuItemAddons.length;
      state.menuItemAddons = state.menuItemAddons.filter((a) => !matchWhere(a, args?.where));
      return { count: before - state.menuItemAddons.length };
    },
  },

  coupon: {
    findUnique: async (args: any) => {
      const found = state.coupons.find((c) => matchWhere(c, args.where));
      return found ? { ...found } : null;
    },
    findMany: async (args: any) => state.coupons.filter((c) => matchWhere(c, args?.where)),
  },

  order: {
    findUnique: async (args: any) => {
      const found = state.orders.find((o) => matchWhere(o, args.where));
      if (!found) return null;
      const res = { ...found };
      if (args.include?.items) {
        res.items = state.orderItems.filter((i) => i.orderId === found.id);
      }
      if (args.include?.statusHistory) {
        res.statusHistory = state.orderStatusHistories.filter((h) => h.orderId === found.id);
      }
      if (args.include?.user) {
        res.user = state.users.find((u) => u.id === found.userId);
      }
      return res;
    },
    findMany: async (args: any) => {
      let list = state.orders.filter((o) => matchWhere(o, args?.where));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (args?.skip !== undefined && args?.take !== undefined) {
        list = list.slice(args.skip, args.skip + args.take);
      }

      return list.map((o) => {
        const res = { ...o };
        if (args?.include?.items) {
          res.items = state.orderItems.filter((i) => i.orderId === o.id);
        }
        if (args?.include?.statusHistory) {
          res.statusHistory = state.orderStatusHistories.filter((h) => h.orderId === o.id);
        }
        if (args?.include?.user) {
          res.user = state.users.find((u) => u.id === o.userId);
        }
        return res;
      });
    },
    create: async (args: any) => {
      const data = { ...args.data };
      const itemsData = data.items?.create || [];
      const statusHistoryData = data.statusHistory?.create || [];
      delete data.items;
      delete data.statusHistory;

      const newOrder = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        currentStatus: 'PLACED',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        orderType: 'DELIVERY',
        discountAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      state.orders.push(newOrder);

      if (Array.isArray(itemsData)) {
        itemsData.forEach((item: any) => {
          state.orderItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderId: newOrder.id,
            ...item,
          });
        });
      }

      if (Array.isArray(statusHistoryData)) {
        statusHistoryData.forEach((h: any) => {
          state.orderStatusHistories.push({
            id: `osh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderId: newOrder.id,
            changedAt: new Date(),
            ...h,
          });
        });
      }

      const res: any = { ...newOrder };
      if (args.include?.items) {
        res.items = state.orderItems.filter((i) => i.orderId === newOrder.id);
      }
      if (args.include?.statusHistory) {
        res.statusHistory = state.orderStatusHistories.filter((h) => h.orderId === newOrder.id);
      }
      return res;
    },
    update: async (args: any) => {
      const order = state.orders.find((o) => matchWhere(o, args.where));
      if (!order) throw new Error('Order not found');
      Object.assign(order, args.data, { updatedAt: new Date() });
      const res: any = { ...order };
      if (args.include?.items) {
        res.items = state.orderItems.filter((i) => i.orderId === order.id);
      }
      if (args.include?.statusHistory) {
        res.statusHistory = state.orderStatusHistories.filter((h) => h.orderId === order.id);
      }
      return res;
    },
    count: async (args: any) => state.orders.filter((o) => matchWhere(o, args?.where)).length,
  },

  orderItem: {
    findMany: async (args: any) => state.orderItems.filter((i) => matchWhere(i, args?.where)),
    deleteMany: async () => {
      state.orderItems = [];
      return { count: 0 };
    },
  },

  orderStatusHistory: {
    create: async (args: any) => {
      const entry = {
        id: `osh-${Date.now()}`,
        changedAt: new Date(),
        ...args.data,
      };
      state.orderStatusHistories.push(entry);
      return { ...entry };
    },
    findMany: async (args: any) => state.orderStatusHistories.filter((h) => matchWhere(h, args?.where)),
    deleteMany: async () => {
      state.orderStatusHistories = [];
      return { count: 0 };
    },
  },

  $transaction: async (fnOrArray: any) => {
    if (typeof fnOrArray === 'function') {
      return fnOrArray(inMemoryDb);
    }
    if (Array.isArray(fnOrArray)) {
      return Promise.all(fnOrArray);
    }
    return null;
  },
};

export default inMemoryDb;
