import type { User } from "@/Types/User";
import http from "./http";

function getUser(id: number) {
  return http.get<User>(`/users/${id}`); // ใส่ generic <User> จะได้ type response
}

function getUsers() {
  return http.get<User[]>("/users"); // <User[]> สำหรับ array
}

export default { getUser, getUsers };
