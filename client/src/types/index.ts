export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'UPI_SIMULATED' | 'CARD_SIMULATED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt?: string;
}

export interface MenuItemAddon {
  id?: string;
  menuItemId?: string;
  name: string;
  price: number;
  isRequired?: boolean;
  maxSelection?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  imageUrl: string;
  prepTimeMinutes: number;
  spiceLevel: number; // 1 Mild, 2 Medium, 3 Spicy, 4 Extra Hot
  calories?: number;
  allergens?: string;
  addons: MenuItemAddon[];
  createdAt?: string;
}

export interface CartAddon {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart row id (itemId + sorted addons hash)
  menuItem: MenuItem;
  quantity: number;
  selectedAddons: CartAddon[];
  itemTotal: number; // (unitPrice + addons) * quantity
}

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  menuItemId?: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
  selectedAddons?: CartAddon[];
  menuItem?: {
    id: string;
    imageUrl: string;
    isVeg: boolean;
  };
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  changedBy: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string | null;
  orderNotes?: string | null;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  currentStatus: OrderStatus;
  cancellationReason?: string | null;
  estimatedDeliveryTime?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSnapshot[];
  statusHistory: OrderStatusHistoryItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  isActive: boolean;
}

export interface CustomerSummary {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    currentStatus: OrderStatus;
    createdAt: string;
  }[];
}

export interface OperationalKPIs {
  ordersTodayCount: number;
  awaitingConfirmationCount: number;
  inPreparationCount: number;
  outForDeliveryCount: number;
  completedTodayCount: number;
  todayRevenue: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: Order[];
}

export interface SalesAnalytics {
  trend: {
    date: string;
    label: string;
    revenue: number;
    ordersCount: number;
  }[];
  topSellingDishes: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  statusCounts: Record<string, number>;
  totalPeriodOrders: number;
  totalPeriodRevenue: number;
}
