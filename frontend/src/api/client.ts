import axios, { AxiosError } from 'axios';
import {
  User,
  Vehicle,
  ParkingSlot,
  ParkingRecord,
  Reservation,
  Notification,
  UserDashboard,
  AdminDashboard,
  PagedResponse,
  ApiResponse,
  SlotStatus,
  SlotType,
  AuditLog,
  AnalyticsReport,
} from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parking_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('parking_token');
      localStorage.removeItem('parking_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: { fullName: string; email: string; phone: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/api/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', data);
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('parking_token');
      localStorage.removeItem('parking_user');
    }
  },
  me: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return res.data;
  },
  updateProfile: async (data: { fullName: string; phone: string }) => {
    const res = await apiClient.put<ApiResponse<User>>('/api/auth/profile', data);
    return res.data;
  },
};

// Vehicles API
export const vehicleApi = {
  list: async (params?: { page?: number; size?: number; search?: string; type?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Vehicle>> | PagedResponse<Vehicle> | Vehicle[]>('/api/vehicles', { params });
    return res.data;
  },
  create: async (data: Partial<Vehicle>) => {
    const res = await apiClient.post<ApiResponse<Vehicle>>('/api/vehicles', data);
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Vehicle>>(`/api/vehicles/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<Vehicle>) => {
    const res = await apiClient.put<ApiResponse<Vehicle>>(`/api/vehicles/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/api/vehicles/${id}`);
    return res.data;
  },
};

// Slots API
export const slotApi = {
  list: async (params?: { status?: SlotStatus; slotType?: SlotType; search?: string; page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<ParkingSlot[]> | ParkingSlot[]>('/api/parking-slots', { params });
    return res.data;
  },
  listAvailable: async (slotType?: SlotType) => {
    const res = await apiClient.get<ApiResponse<ParkingSlot[]> | ParkingSlot[]>('/api/parking-slots/available', {
      params: { slotType },
    });
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<{ total: number; available: number; occupied: number; reserved: number; maintenance: number }>>('/api/parking-slots/stats');
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<ParkingSlot>>(`/api/parking-slots/${id}`);
    return res.data;
  },
};

// Admin Slots API
export const adminSlotApi = {
  create: async (data: { slotNumber: string; slotType: SlotType; status?: SlotStatus }) => {
    const res = await apiClient.post<ApiResponse<ParkingSlot>>('/api/admin/parking-slots', data);
    return res.data;
  },
  update: async (id: string, data: Partial<ParkingSlot>) => {
    const res = await apiClient.put<ApiResponse<ParkingSlot>>(`/api/admin/parking-slots/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: SlotStatus) => {
    const res = await apiClient.patch<ApiResponse<ParkingSlot>>(`/api/admin/parking-slots/${id}/status`, { status });
    return res.data;
  },
};

// Sessions API
export const sessionApi = {
  entry: async (data: { vehicleId: string; slotId: string }) => {
    const res = await apiClient.post<ApiResponse<ParkingRecord>>('/api/parking-sessions/entry', data);
    return res.data;
  },
  exit: async (sessionId: string) => {
    const res = await apiClient.post<ApiResponse<ParkingRecord>>(`/api/parking-sessions/${sessionId}/exit`);
    return res.data;
  },
  active: async () => {
    const res = await apiClient.get<ApiResponse<ParkingRecord[]> | ParkingRecord[]>('/api/parking-sessions/active');
    return res.data;
  },
  history: async (params?: { page?: number; size?: number; search?: string; status?: string; startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ParkingRecord>> | PagedResponse<ParkingRecord>>('/api/parking-sessions/history', { params });
    return res.data;
  },
};

// Admin Sessions API
export const adminSessionApi = {
  active: async (params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ParkingRecord> | ParkingRecord[]> | ParkingRecord[]>('/api/admin/parking-sessions/active', { params });
    return res.data;
  },
  history: async (params?: { page?: number; size?: number; search?: string; status?: string; startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ParkingRecord>> | PagedResponse<ParkingRecord>>('/api/admin/parking-sessions/history', { params });
    return res.data;
  },
};

// Reservations API
export const reservationApi = {
  create: async (data: { vehicleId: string; slotId: string; startTime: string; endTime: string }) => {
    const res = await apiClient.post<ApiResponse<Reservation>>('/api/reservations', data);
    return res.data;
  },
  list: async (params?: { page?: number; size?: number; tab?: 'upcoming' | 'past'; status?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Reservation> | Reservation[]> | Reservation[]>('/api/reservations', { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Reservation>>(`/api/reservations/${id}`);
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Reservation>>(`/api/reservations/${id}/cancel`);
    return res.data;
  },
};

// Admin Reservations API
export const adminReservationApi = {
  list: async (params?: { page?: number; size?: number; status?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Reservation> | Reservation[]> | Reservation[]>('/api/admin/reservations', { params });
    return res.data;
  },
};

// Dashboard API
export const dashboardApi = {
  user: async () => {
    const res = await apiClient.get<ApiResponse<UserDashboard> | UserDashboard>('/api/dashboard/user');
    return res.data;
  },
  admin: async () => {
    const res = await apiClient.get<ApiResponse<AdminDashboard> | AdminDashboard>('/api/dashboard/admin');
    return res.data;
  },
};

// Notifications API
export const notificationApi = {
  list: async (params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Notification> | Notification[]> | Notification[]>('/api/notifications', { params });
    return res.data;
  },
  unreadCount: async () => {
    const res = await apiClient.get<ApiResponse<{ count: number }> | { count: number }>('/api/notifications/unread-count');
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post<ApiResponse<void>>('/api/notifications/mark-all-read');
    return res.data;
  },
};

// Reports API
export const reportApi = {
  analytics: async (period: string) => {
    const res = await apiClient.get<ApiResponse<AnalyticsReport> | AnalyticsReport>('/api/reports/analytics', {
      params: { period },
    });
    return res.data;
  },
  exportCsv: async (params?: { type?: string; period?: string }) => {
    const res = await apiClient.get('/api/reports/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
  exportPdf: async (params?: { type?: string; period?: string }) => {
    const res = await apiClient.get('/api/reports/export/pdf', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

// Admin Users API
export const adminUserApi = {
  list: async (params?: { page?: number; size?: number; search?: string; role?: string; active?: boolean }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<User>> | PagedResponse<User>>('/api/admin/users', { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/api/admin/users/${id}`);
    return res.data;
  },
  activate: async (id: string) => {
    const res = await apiClient.post<ApiResponse<User>>(`/api/admin/users/${id}/activate`);
    return res.data;
  },
  deactivate: async (id: string) => {
    const res = await apiClient.post<ApiResponse<User>>(`/api/admin/users/${id}/deactivate`);
    return res.data;
  },
};

// Admin Audit API
export const auditApi = {
  list: async (params?: { page?: number; size?: number; action?: string; entityType?: string }) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AuditLog>> | PagedResponse<AuditLog>>('/api/admin/audit-logs', { params });
    return res.data;
  },
};
