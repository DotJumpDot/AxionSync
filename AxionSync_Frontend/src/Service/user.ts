import type { User } from "@/Types/User";
import http from "./http";

function getUser(id: number) {
  return http.get<User>(`/users/${id}`); // ใส่ generic <User> จะได้ type response
}

function getUsers() {
  return http.get<User[]>("/users/users"); // <User[]> สำหรับ array
}

const UserService = { getUser, getUsers };

export default UserService;
