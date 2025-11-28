import type { User } from "./User";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  // ISO string when the token expires (from backend)
  expiresAt?: string;
}
