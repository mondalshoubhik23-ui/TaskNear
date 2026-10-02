import type { User, College, TaskCategory, CollegeVerification, AdminStats } from '../types/index.ts';

const TOKEN_KEY = 'taskhop_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    async register(payload: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      collegeId?: string;
      department?: string;
      yearOfStudy?: string;
    }): Promise<{ user: User; token: string }> {
      const data = await request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(data.token);
      return data;
    },

    async login(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
      const data = await request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(data.token);
      return data;
    },

    async logout(): Promise<void> {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },

    async getMe(): Promise<{ user: User }> {
      return request<{ user: User }>('/api/auth/me');
    },

    async verifyEmail(): Promise<{ user: User }> {
      return request<{ user: User }>('/api/auth/verify-email', { method: 'POST' });
    },
  },

  users: {
    async getColleges(): Promise<{ colleges: College[] }> {
      return request<{ colleges: College[] }>('/api/users/colleges');
    },

    async getCategories(): Promise<{ categories: TaskCategory[] }> {
      return request<{ categories: TaskCategory[] }>('/api/users/categories');
    },

    async updateProfile(updates: Partial<any>): Promise<{ user: User }> {
      return request<{ user: User }>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async toggleAvailability(isAvailable: boolean): Promise<{ is_available: boolean; user: User }> {
      return request<{ is_available: boolean; user: User }>('/api/users/me/availability', {
        method: 'PATCH',
        body: JSON.stringify({ is_available: isAvailable }),
      });
    },

    async submitVerification(payload: {
      college_id?: string;
      id_number?: string;
      id_card_url?: string;
    }): Promise<{ success: boolean; verificationId: string; user: User }> {
      return request<{ success: boolean; verificationId: string; user: User }>('/api/users/me/verification', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getVerifications(): Promise<{ verifications: CollegeVerification[] }> {
      return request<{ verifications: CollegeVerification[] }>('/api/users/me/verification');
    },
  },

  admin: {
    async getStats(): Promise<{ stats: AdminStats }> {
      return request<{ stats: AdminStats }>('/api/admin/stats');
    },

    async getUsers(params: { search?: string; status?: string; verification?: string } = {}): Promise<{ users: any[] }> {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.status) query.set('status', params.status);
      if (params.verification) query.set('verification', params.verification);
      return request<{ users: any[] }>(`/api/admin/users?${query.toString()}`);
    },

    async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async getVerifications(status?: string): Promise<{ verifications: CollegeVerification[] }> {
      const query = status ? `?status=${status}` : '';
      return request<{ verifications: CollegeVerification[] }>(`/api/admin/verifications${query}`);
    },

    async reviewVerification(id: string, action: 'APPROVE' | 'REJECT', notes?: string): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/api/admin/verifications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      });
    },

    async getAuditLogs(): Promise<{ logs: any[] }> {
      return request<{ logs: any[] }>('/api/admin/audit-logs');
    },
  },
};
