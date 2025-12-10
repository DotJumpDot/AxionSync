import type { Tag, CreateTagRequest, UpdateTagRequest } from "@/Types/Tag";
import http from "./http";

function getTags() {
  return http.get<Tag[]>("/tags/");
}

function getTag(id: number) {
  return http.get<Tag>(`/tags/${id}`);
}

function createTag(data: CreateTagRequest) {
  return http.post<Tag>("/tags/", data);
}

function updateTag(id: number, data: UpdateTagRequest) {
  return http.put<Tag>(`/tags/${id}`, data);
}

function deleteTag(id: number) {
  return http.delete(`/tags/${id}`);
}

const TagService = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
};

export default TagService;
