export type Tag = {
  id: number;
  name: string;
  tag_priority: number;
};

export type CreateTagRequest = {
  name: string;
  tag_priority?: number;
};

export type UpdateTagRequest = {
  name?: string;
  tag_priority?: number;
};

export type TagResponse = {
  success: boolean;
  message?: string;
  tag?: Tag;
};
