const API_BASE = 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dastaan_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
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
