// lib/api.ts
import type { PaginatedResponse, Profile, CreateProfileRequest, FilterParams } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Version': '1',
};

let on401: (() => void) | null = null;
export function register401Handler(fn: () => void) {
  on401 = fn;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401) {
    on401?.();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  logout(): Promise<void> {
    return request<void>('/auth/logout', { method: 'POST' });
  },

  // GET /api/profiles
  getProfiles(filters: FilterParams = {}): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (filters.gender)           params.append('gender', filters.gender);
    if (filters.country_id)       params.append('country_id', filters.country_id);
    if (filters.age_group)        params.append('age_group', filters.age_group);
    if (filters.min_age != null)  params.append('min_age', filters.min_age.toString());
    if (filters.max_age != null)  params.append('max_age', filters.max_age.toString());
    if (filters.sort_by)          params.append('sort_by', filters.sort_by);
    if (filters.order)            params.append('order', filters.order);
    if (filters.page)             params.append('page', filters.page.toString());
    if (filters.limit)            params.append('limit', filters.limit.toString());
    const qs = params.toString();
    return request<PaginatedResponse>(`/api/profiles${qs ? `?${qs}` : ''}`);
  },

  // GET /api/profiles/:id
  async getProfile(id: string): Promise<Profile> {
    const res = await request<{ status: string; data: Profile }>(`/api/profiles/${id}`);
    return res.data;
  },

  // POST /api/profiles — admin only
  async createProfile(body: CreateProfileRequest): Promise<Profile> {
    const res = await request<{ status: string; data: Profile }>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  // DELETE /api/profiles/:id — admin only
  deleteProfile(id: string): Promise<void> {
    return request<void>(`/api/profiles/${id}`, { method: 'DELETE' });
  },

  // GET /api/profiles/search
  searchProfiles(q: string, page = 1, limit = 10): Promise<PaginatedResponse> {
    limit = Math.min(limit, 50);
    const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
    return request<PaginatedResponse>(`/api/profiles/search?${params}`);
  },

  // GET /api/profiles/export?format=csv
  async exportCSV(gender?: string, countryId?: string): Promise<void> {
    const params = new URLSearchParams({ format: 'csv' });
    if (gender)    params.append('gender', gender);
    if (countryId) params.append('country_id', countryId);

    const res = await fetch(`${BASE_URL}/api/profiles/export?${params}`, {
      credentials: 'include',
      headers: { 'X-API-Version': '1' },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'Export failed');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profiles.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
