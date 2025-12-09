import type { User, UserUpdate, UserPictureResponse } from "@/Types/User";
import http from "./http";

function getUser(id: number) {
  return http.get<User>(`/users/${id}`);
}

function getUsers() {
  return http.get<User[]>("/users/users");
}

function updateProfile(userId: number, data: UserUpdate) {
  return http.put<User>(`/users/${userId}/profile`, data);
}

function uploadPicture(userId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return http.post<UserPictureResponse>(`/users/${userId}/picture`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

const UserService = { getUser, getUsers, updateProfile, uploadPicture };

export default UserService;
