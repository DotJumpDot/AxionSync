export interface Tab {
  id: number;
  tab_name: string;
  color: string;
  user_id: number;
  font_name: string;
  font_size: number;
}

export interface CreateTabRequest {
  tab_name: string;
  color: string;
  font_name: string;
  font_size: number;
}

export interface UpdateTabRequest {
  tab_name: string;
  color: string;
  font_name: string;
  font_size: number;
}
