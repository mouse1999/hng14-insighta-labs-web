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

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function attemptRefresh(): Promise<boolean> {
  console.log('[api] Attempting token refresh');
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-API-Version': '1' },
    });
    console.log('[api] Refresh response status:', res.status);
    return res.ok;
  } catch (err) {
    console.error('[api] Refresh request failed:', err);
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401 && !isRetry) {
    console.warn('[api] Got 401 on', path, '— attempting refresh');

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      console.log('[api] Refresh already in progress, queuing request for', path);
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push(async () => {
          try {
            resolve(await request<T>(path, options, true));
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    isRefreshing = true;
    const refreshed = await attemptRefresh();
    isRefreshing = false;

    if (refreshed) {
      console.log('[api] Refresh succeeded — retrying queued requests and original');
      // Flush queued requests
      refreshQueue.forEach((fn) => fn());
      refreshQueue = [];
      // Retry the original request
      return request<T>(path, options, true);
    } else {
      console.error('[api] Refresh failed — logging out');
      refreshQueue = [];
      on401?.();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (res.status === 401 && isRetry) {
    // Refresh succeeded but request still 401 — something else is wrong
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

  getProfiles(filters: FilterParams = {}): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    if (filters.gender)          params.append('gender', filters.gender);
    if (filters.country_id)      params.append('country_id', filters.country_id);
    if (filters.age_group)       params.append('age_group', filters.age_group);
    if (filters.min_age != null) params.append('min_age', filters.min_age.toString());
    if (filters.max_age != null) params.append('max_age', filters.max_age.toString());
    if (filters.sort_by)         params.append('sort_by', filters.sort_by);
    if (filters.order)           params.append('order', filters.order);
    if (filters.page)            params.append('page', filters.page.toString());
    if (filters.limit)           params.append('limit', filters.limit.toString());
    const qs = params.toString();
    return request<PaginatedResponse>(`/api/profiles${qs ? `?${qs}` : ''}`);
  },

  async getProfile(id: string): Promise<Profile> {
    const res = await request<{ status: string; data: Profile }>(`/api/profiles/${id}`);
    return res.data;
  },

  async createProfile(body: CreateProfileRequest): Promise<Profile> {
    const res = await request<{ status: string; data: Profile }>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  deleteProfile(id: string): Promise<void> {
    return request<void>(`/api/profiles/${id}`, { method: 'DELETE' });
  },

  searchProfiles(q: string, page = 1, limit = 10): Promise<PaginatedResponse> {
    limit = Math.min(limit, 50);
    const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
    return request<PaginatedResponse>(`/api/profiles/search?${params}`);
  },

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
