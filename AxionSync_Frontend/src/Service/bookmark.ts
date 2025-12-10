import type {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  CoverImageResponse,
} from "@/Types/Bookmark";
import http from "./http";

function getBookmarks(params?: {
  type?: string;
  status?: string;
  include_deleted?: boolean;
}) {
  return http.get<Bookmark[]>("/bookmarks/", { params });
}

function getPublicBookmarks(type?: string) {
  const params = type ? { type } : {};
  return http.get<Bookmark[]>("/bookmarks/public", { params });
}

function getBookmark(id: number) {
  return http.get<Bookmark>(`/bookmarks/${id}`);
}

function createBookmark(data: CreateBookmarkRequest) {
  return http.post<Bookmark>("/bookmarks/", data);
}

function updateBookmark(id: number, data: UpdateBookmarkRequest) {
  return http.put<Bookmark>(`/bookmarks/${id}`, data);
}

function deleteBookmark(id: number) {
  return http.delete(`/bookmarks/${id}`);
}

function permanentDeleteBookmark(id: number) {
  return http.delete(`/bookmarks/${id}/permanent`);
}

function restoreBookmark(id: number) {
  return http.patch<Bookmark>(`/bookmarks/${id}/restore`);
}

function uploadCoverImage(id: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return http.post<CoverImageResponse>(`/bookmarks/${id}/cover`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function getBookmarksByTag(tagId: number) {
  return http.get<Bookmark[]>(`/bookmarks/by-tag/${tagId}`);
}

const BookmarkService = {
  getBookmarks,
  getPublicBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  permanentDeleteBookmark,
  restoreBookmark,
  uploadCoverImage,
  getBookmarksByTag,
};

export default BookmarkService;
