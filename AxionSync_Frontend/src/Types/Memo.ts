import type { User } from "./User";

export type Memo = {
  id: number;
  title: string;
  content: string;
  user: User;
  tab_id: number | null;
  font_color: string | null;
  deleted_status: boolean;
  collected: boolean;
  collected_time: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CreateMemoRequest = {
  title: string;
  content: string;
  tab_id?: number | null;
  font_color?: string | null;
};

export type UpdateMemoRequest = {
  title: string;
  content: string;
  font_color?: string | null;
};

export type MemoResponse = {
  success: boolean;
  message?: string;
  memo?: Memo;
};
