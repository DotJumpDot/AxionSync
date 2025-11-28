import type { User } from "./User";

export type Memo = {
  id: number;
  title: string;
  content: string;
  user: User;
  deleted_status: boolean;
  created_at: string;
  updated_at: string | null;
};

export type CreateMemoRequest = {
  title: string;
  content: string;
};

export type UpdateMemoRequest = {
  title: string;
  content: string;
};

export type MemoResponse = {
  success: boolean;
  message?: string;
  memo?: Memo;
};
