import http from "./http";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";

// ✅ Login service
function login(data: LoginRequest) {
  return http.post<LoginResponse>("/login", data);
}

export default { login };
