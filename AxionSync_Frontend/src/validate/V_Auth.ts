import type { LoginRequest } from "@/Types/Auth";

export function validateLoginRequest(data: LoginRequest): string | null {
  if (!data.username || data.username.trim() === "") {
    return "Username is required.";
  }

  if (!data.password || data.password.trim() === "") {
    return "Password is required.";
  }

  return null; // ผ่านหมด → valid
}
