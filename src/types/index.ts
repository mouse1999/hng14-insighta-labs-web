// types/index.ts

export interface Profile {
  id: string;
  name: string;
  gender: string | null;
  genderProbability: number | null;
  age: number | null;
  ageGroup: string | null;
  countryId: string | null;
  countryName: string | null;
  countryProbability: number | null;
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
  accessToken: string;
  refreshToken: string;
  username: string;
  avatarUrl: string;
}

export interface ErrorResponse {
  status: string;
  message: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserState {
  refreshToken: string | null;
  username: string | null;
  avatarUrl: string | null;
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
