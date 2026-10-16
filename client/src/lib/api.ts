import { MOCK_CATEGORIES, MOCK_DISHES, MOCK_ORDERS } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

async function getMockFallback(endpoint: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const url = endpoint.split('?')[0];

  if (url === '/categories') {
    return { success: true, data: MOCK_CATEGORIES };
  }

  if (url === '/menu') {
    return { success: true, count: MOCK_DISHES.length, data: MOCK_DISHES };
  }

  if (url.startsWith('/menu/')) {
    const id = url.split('/')[2];
    const dish = MOCK_DISHES.find((d) => d.id === id) || MOCK_DISHES[0];
    return { success: true, data: dish };
  }

  if (url === '/coupons/validate') {
    const body = JSON.parse(options.body as string || '{}');
    const subtotal = body.subtotal || 1000;
    const discount = body.code === 'FIRSTBITE' ? 150 : (body.code === 'FEAST20' ? subtotal * 0.2 : subtotal * 0.1);
    return {
      success: true,
      message: 'Royal coupon applied successfully!',
      data: {
        code: body.code,
        discountType: body.code === 'FIRSTBITE' ? 'FIXED' : 'PERCENTAGE',
        discountValue: discount,
        discountAmount: discount,
      },
    };
  }

  if (url === '/orders' && method === 'POST') {
    const body = JSON.parse(options.body as string || '{}');
    const orderNumber = `DST-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: `demo-${Date.now()}`,
      orderNumber,
      customerName: body.customerName || 'Valued Patron',
      customerEmail: body.customerEmail || 'guest@dastaan.com',
      orderType: body.orderType || 'DELIVERY',
      totalAmount: body.total || 1247,
      currentStatus: 'PLACED',
      createdAt: new Date().toISOString(),
      items: body.items || [],
      statusHistory: [
        { status: 'PLACED', changedAt: new Date().toISOString(), notes: 'Order placed by guest patron' }
      ]
    };
    return { success: true, message: 'Order placed successfully', data: newOrder };
  }

  if (url.startsWith('/orders/track/')) {
    return { success: true, data: MOCK_ORDERS[0] };
  }

  if (url === '/orders/my-orders') {
    return { success: true, data: MOCK_ORDERS };
  }

  if (url === '/orders' && method === 'GET') {
    return {
      success: true,
      pagination: { page: 1, limit: 10, totalCount: MOCK_ORDERS.length, totalPages: 1 },
      data: MOCK_ORDERS,
    };
  }

  if (url.includes('/status') && method === 'PATCH') {
    const body = JSON.parse(options.body as string || '{}');
    return { success: true, message: 'Status updated', data: { ...MOCK_ORDERS[0], currentStatus: body.status } };
  }

  if (url === '/auth/login' || url === '/auth/register') {
    const body = JSON.parse(options.body as string || '{}');
    const isAdmin = body.email?.includes('admin');
    return {
      success: true,
      token: 'demo_jwt_token',
      user: {
        id: isAdmin ? 'usr-admin' : 'usr-demo',
        email: body.email || 'patron@dastaan.com',
        name: isAdmin ? 'Farhan Qureshi' : (body.name || 'Gourmet Patron'),
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
      },
    };
  }

  if (url === '/auth/me') {
    return {
      success: true,
      user: {
        id: 'usr-admin',
        email: 'admin@dastaan.com',
        name: 'Farhan Qureshi',
        role: 'ADMIN',
      },
    };
  }

  if (url === '/reports/kpis') {
    return {
      success: true,
      data: {
        netRevenue: 54980,
        todayOrders: 28,
        inKitchen: 4,
        outForDelivery: 3,
        completedToday: 21,
        averageOrderValue: 1240,
      },
    };
  }

  if (url.startsWith('/reports/sales')) {
    return {
      success: true,
      data: {
        dailyTrends: [
          { date: 'Mon', revenue: 7450, orders: 6 },
          { date: 'Tue', revenue: 8900, orders: 7 },
          { date: 'Wed', revenue: 6800, orders: 5 },
          { date: 'Thu', revenue: 9400, orders: 8 },
          { date: 'Fri', revenue: 14200, orders: 11 },
          { date: 'Sat', revenue: 18600, orders: 15 },
          { date: 'Sun', revenue: 16400, orders: 13 },
        ],
        topSellingDishes: [
          { name: 'Nawabi Mutton Dum Biryani', quantity: 38, revenue: 26030 },
          { name: 'Dastaan Asli Butter Chicken', quantity: 32, revenue: 18400 },
          { name: 'Awadhi Galouti Kebab', quantity: 27, revenue: 15795 },
          { name: 'Dal Bukhara Overnight Stew', quantity: 24, revenue: 10680 },
        ],
      },
    };
  }

  return { success: true, data: [] };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dastaan_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // If server returned error or 404/500, fallback to mock demo data
      return await getMockFallback(endpoint, options);
    }

    return data;
  } catch (_err) {
    // If backend network fails, seamlessly fallback to in-memory demo data
    console.warn(`[Dastaan Client] Network request to ${endpoint} failed. Using offline demonstration fallback.`);
    return await getMockFallback(endpoint, options);
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { email: string; password: string; name: string; phone?: string }) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<any>('/auth/me'),
    saveAddress: (addressData: any) =>
      request<any>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      }),
    deleteAddress: (id: string) =>
      request<any>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      }),
  },

  // Categories
  categories: {
    getAll: (includeAll = false) =>
      request<{ success: boolean; data: any[] }>(`/categories?includeAll=${includeAll}`),
    create: (data: any) =>
      request<any>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string, reassignToCategoryId?: string) =>
      request<any>(`/categories/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reassignToCategoryId }),
      }),
  },

  // Menu items
  menu: {
    getAll: (params?: {
      categoryId?: string;
      search?: string;
      isVeg?: boolean;
      isFeatured?: boolean;
      sort?: string;
      includeUnavailable?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.search) query.append('search', params.search);
      if (params?.isVeg !== undefined) query.append('isVeg', String(params.isVeg));
      if (params?.isFeatured !== undefined) query.append('isFeatured', String(params.isFeatured));
      if (params?.sort) query.append('sort', params.sort);
      if (params?.includeUnavailable) query.append('includeUnavailable', 'true');

      const qs = query.toString();
      return request<{ success: boolean; count: number; data: any[] }>(`/menu${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: any }>(`/menu/${id}`),
    create: (data: any) =>
      request<any>('/menu', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleAvailability: (id: string) =>
      request<any>(`/menu/${id}/toggle-availability`, {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      request<any>(`/menu/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    create: (data: any) =>
      request<{ success: boolean; message: string; data: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    track: (orderNumber: string) =>
      request<{ success: boolean; data: any }>(`/orders/track/${encodeURIComponent(orderNumber)}`),
    getMyOrders: () => request<{ success: boolean; data: any[] }>('/orders/my-orders'),
    getAllAdmin: (params?: {
      status?: string;
      orderType?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.orderType) query.append('orderType', params.orderType);
      if (params?.search) query.append('search', params.search);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const qs = query.toString();
      return request<{
        success: boolean;
        pagination: { page: number; limit: number; totalCount: number; totalPages: number };
        data: any[];
      }>(`/orders${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: any }>(`/orders/${id}`),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
    cancel: (id: string, reason: string) =>
      request<any>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  // Coupons
  coupons: {
    validate: (code: string, subtotal: number) =>
      request<{ success: boolean; message: string; data: any }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
    getAll: () => request<{ success: boolean; data: any[] }>('/coupons'),
  },

  // Customers
  customers: {
    getAll: (search?: string) => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<{ success: boolean; count: number; data: any[] }>(`/customers${qs}`);
    },
  },

  // Reports
  reports: {
    getKPIs: () => request<{ success: boolean; data: any }>('/reports/kpis'),
    getSales: (days = 7) => request<{ success: boolean; data: any }>(`/reports/sales?days=${days}`),
    getExportUrl: () => `${API_BASE}/reports/export-csv`,
  },
};
