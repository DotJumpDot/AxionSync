import type { Memo, CreateMemoRequest, UpdateMemoRequest } from "@/Types/Memo";
import http from "./http";

function getMemos(tabId?: number | null) {
  const params = tabId ? { tab_id: tabId } : {};
  return http.get<Memo[]>("/memos/", { params });
}

function getMemo(id: number) {
  return http.get<Memo>(`/memos/${id}`);
}

function createMemo(data: CreateMemoRequest) {
  return http.post<Memo>("/memos/", data);
}

function updateMemo(id: number, data: UpdateMemoRequest) {
  return http.put<Memo>(`/memos/${id}`, data);
}

function deleteMemo(id: number) {
  return http.delete(`/memos/${id}`);
}

function collectMemo(id: number) {
  return http.patch<Memo>(`/memos/${id}/collect`);
}

function uncollectMemo(id: number) {
  return http.patch<Memo>(`/memos/${id}/uncollect`);
}

const MemoService = {
  getMemos,
  getMemo,
  createMemo,
  updateMemo,
  deleteMemo,
  collectMemo,
  uncollectMemo,
};

export default MemoService;
