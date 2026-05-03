// types/index.ts

export interface Profile {
  id: string;
  name: string;
  gender: string | null;
  gender_probability: number | null;
  age: number | null;
  age_group: string | null;
  country_id: string | null;
  country_name: string | null;
  country_probability: number | null;
  createdAt: string;
}

export interface PaginatedResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: Profile[];
}

export interface CreateProfileRequest {
  name: string;
}

export interface AuthResponse {
  status: string;
  username: string;
  avatarUrl: string;
  role: 'ROLE_ADMIN' | 'ROLE_ANALYST';
}

export interface ErrorResponse {
  status: string;
  message: string;
}

// No refreshToken — tokens stay in HTTP-only cookies only
export interface UserState {
  username: string | null;
  avatarUrl: string | null;
  role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | null;
}

export interface FilterParams {
  gender?: string;
  country_id?: string;
  age_group?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  order?: string;
  page?: number;
  limit?: number;
}
