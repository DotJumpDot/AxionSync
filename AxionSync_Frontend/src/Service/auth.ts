import http from "./http";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";

// Login service
function login(data: LoginRequest) {
  console.log("Logging in with data:", data);
  return http.post<LoginResponse>("/auth/login", data);
}

const AuthService = { login };

export default AuthService;
