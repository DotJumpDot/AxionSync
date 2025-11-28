import type { Memo, CreateMemoRequest, UpdateMemoRequest } from "@/Types/Memo";
import http from "./http";

function getMemos() {
  return http.get<Memo[]>("/memos/");
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

const MemoService = { getMemos, getMemo, createMemo, updateMemo, deleteMemo };

export default MemoService;
