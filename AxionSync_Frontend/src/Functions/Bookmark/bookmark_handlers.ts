import type {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
} from "@/Types/Bookmark";

type NotifyFn = (msg: string, type?: "error" | "warning" | "info") => void;
type Messages = {
  success?: string;
  error?: string;
};

/**
 * Handle bookmark creation
 */
export async function handleBookmarkCreate(
  data: CreateBookmarkRequest,
  createBookmark: (
    data: CreateBookmarkRequest
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>,
  showNotification: NotifyFn,
  onSuccess: (bookmark: Bookmark) => void,
  messages: Messages = {}
): Promise<void> {
  const result = await createBookmark(data);
  if (result.success && result.bookmark) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess(result.bookmark);
  } else {
    showNotification(
      messages.error || result.message || "Failed to create bookmark",
      "error"
    );
  }
}

/**
 * Handle bookmark update
 */
export async function handleBookmarkUpdate(
  id: number,
  data: UpdateBookmarkRequest,
  updateBookmark: (
    id: number,
    data: UpdateBookmarkRequest
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>,
  showNotification: NotifyFn,
  onSuccess: (bookmark: Bookmark) => void,
  messages: Messages = {}
): Promise<void> {
  const result = await updateBookmark(id, data);
  if (result.success && result.bookmark) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess(result.bookmark);
  } else {
    showNotification(
      messages.error || result.message || "Failed to update bookmark",
      "error"
    );
  }
}

/**
 * Handle bookmark soft delete
 */
export async function handleBookmarkDelete(
  id: number,
  deleteBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>,
  showNotification: NotifyFn,
  onSuccess: () => void,
  messages: Messages = {}
): Promise<void> {
  const result = await deleteBookmark(id);
  if (result.success) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess();
  } else {
    showNotification(
      messages.error || result.message || "Failed to delete bookmark",
      "error"
    );
  }
}

/**
 * Handle bookmark permanent delete
 */
export async function handleBookmarkPermanentDelete(
  id: number,
  permanentDeleteBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>,
  showNotification: NotifyFn,
  onSuccess: () => void,
  messages: Messages = {}
): Promise<void> {
  const result = await permanentDeleteBookmark(id);
  if (result.success) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess();
  } else {
    showNotification(
      messages.error ||
        result.message ||
        "Failed to permanently delete bookmark",
      "error"
    );
  }
}

/**
 * Handle bookmark restore
 */
export async function handleBookmarkRestore(
  id: number,
  restoreBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>,
  showNotification: NotifyFn,
  onSuccess: (bookmark: Bookmark) => void,
  messages: Messages = {}
): Promise<void> {
  const result = await restoreBookmark(id);
  if (result.success && result.bookmark) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess(result.bookmark);
  } else {
    showNotification(
      messages.error || result.message || "Failed to restore bookmark",
      "error"
    );
  }
}

/**
 * Handle cover image upload
 */
export async function handleCoverImageUpload(
  id: number,
  file: File,
  uploadCoverImage: (
    id: number,
    file: File
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>,
  showNotification: NotifyFn,
  onSuccess: (bookmark: Bookmark) => void,
  messages: Messages = {}
): Promise<void> {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showNotification("File size must be less than 5MB", "error");
    return;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    showNotification("Invalid file type. Use JPEG, PNG, GIF, or WebP", "error");
    return;
  }

  const result = await uploadCoverImage(id, file);
  if (result.success && result.bookmark) {
    if (messages.success) showNotification(messages.success, "info");
    onSuccess(result.bookmark);
  } else {
    showNotification(
      messages.error || result.message || "Failed to upload cover image",
      "error"
    );
  }
}
