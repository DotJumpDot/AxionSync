"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, Empty, Spin, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useBookmarkStore } from "@/Store/bookmark";
import { useTagStore } from "@/Store/tag";
import { useNotification } from "@/Functions/Notification/useNotification";
import {
  BookmarkCard,
  BookmarkFilters,
  BookmarkFormModal,
  BookmarkDetailDrawer,
  TypeSelector,
} from "@/Components/Bookmark";
import {
  filterBookmarks,
  sortBookmarks,
  searchBookmarks,
} from "@/Functions/Bookmark/bookmark_helpers";
import {
  handleBookmarkDelete,
  handleBookmarkPermanentDelete,
  handleBookmarkRestore,
  handleCoverImageUpload,
} from "@/Functions/Bookmark/bookmark_handlers";
import useShowDeleteConfirm from "@/Components/Modal/DeleteConfirmModal";
import type {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  BookmarkType,
} from "@/Types/Bookmark";

// Type for translation function
type TranslateFunction = (key: string) => string;

export default function BookmarkPage() {
  const {
    bookmarks,
    loading,
    selectedBookmark,
    filterType,
    filterStatus,
    filterMood,
    filterTag,
    sortBy,
    includeDeleted,
    getBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    permanentDeleteBookmark,
    restoreBookmark,
    uploadCoverImage,
    setSelectedBookmark,
    setFilterType,
    setFilterStatus,
    setFilterMood,
    setFilterTag,
    setSortBy,
    setIncludeDeleted,
    clearFilters,
  } = useBookmarkStore();

  const { tags, getTags } = useTagStore();
  const { showNotification: baseShowNotification, modal } = useNotification();
  const tBookmark = useTranslations("bookmark");
  const tCommon = useTranslations("common");
  const showDeleteConfirm = useShowDeleteConfirm();

  // Cast translation functions for component props
  const t = tBookmark as TranslateFunction;
  const tc = tCommon as TranslateFunction;

  // Wrap notification to use topLeft placement and 1.5s duration
  const showNotification = (
    msg: string,
    type?: "error" | "warning" | "info"
  ) => {
    baseShowNotification(msg, type, 1.5, "topLeft");
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // TypeSelector state
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [selectedTypeForForm, setSelectedTypeForForm] =
    useState<BookmarkType | null>(null);

  // Fetch data on mount
  useEffect(() => {
    getBookmarks({ include_deleted: includeDeleted });
    getTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    getBookmarks({
      type: filterType,
      status: filterStatus,
      include_deleted: includeDeleted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus, includeDeleted]);

  // Filter, search, and sort bookmarks
  const displayedBookmarks = useMemo(() => {
    let filtered = filterBookmarks(
      bookmarks,
      filterType,
      filterStatus,
      includeDeleted,
      filterMood,
      filterTag
    );
    filtered = searchBookmarks(filtered, searchQuery);
    return sortBookmarks(filtered, sortBy);
  }, [
    bookmarks,
    filterType,
    filterStatus,
    includeDeleted,
    filterMood,
    filterTag,
    searchQuery,
    sortBy,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setTypeSelectorOpen(true);
  };

  const handleTypeSelect = (type: BookmarkType) => {
    setSelectedTypeForForm(type);
    setTypeSelectorOpen(false);
    setModalMode("create");
    setEditingBookmark(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (bookmark: Bookmark) => {
    setModalMode("edit");
    setEditingBookmark(bookmark);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBookmark(null);
    setSelectedTypeForForm(null);
  };

  const handleCreate = async (data: CreateBookmarkRequest) => {
    const result = await createBookmark(data);
    if (result.success) {
      showNotification(tBookmark("form.createSuccess"), "info");
    } else {
      showNotification(tBookmark("form.createFailed"), "error");
    }
  };

  const handleUpdate = async (id: number, data: UpdateBookmarkRequest) => {
    const result = await updateBookmark(id, data);
    if (result.success) {
      showNotification(tBookmark("form.updateSuccess"), "info");
    } else {
      showNotification(tBookmark("form.updateFailed"), "error");
    }
  };

  const handleDelete = (bookmark: Bookmark) => {
    showDeleteConfirm(modal, {
      title: tBookmark("confirm.deleteTitle"),
      content: tBookmark("confirm.deleteMessage"),
      okText: tCommon("delete"),
      cancelText: tCommon("cancel"),
      onConfirm: async () => {
        await handleBookmarkDelete(
          bookmark.id,
          deleteBookmark,
          showNotification,
          () => {
            if (selectedBookmark?.id === bookmark.id) {
              setSelectedBookmark(null);
              setDetailDrawerOpen(false);
            }
          },
          {
            success: tBookmark("form.deleteSuccess"),
            error: tBookmark("form.deleteFailed"),
          }
        );
      },
    });
  };

  const handlePermanentDelete = (bookmark: Bookmark) => {
    showDeleteConfirm(modal, {
      title: tBookmark("confirm.permanentDeleteTitle"),
      content: tBookmark("confirm.permanentDeleteMessage"),
      okText: tBookmark("permanentDelete"),
      cancelText: tCommon("cancel"),
      onConfirm: async () => {
        await handleBookmarkPermanentDelete(
          bookmark.id,
          permanentDeleteBookmark,
          showNotification,
          () => {
            if (selectedBookmark?.id === bookmark.id) {
              setSelectedBookmark(null);
              setDetailDrawerOpen(false);
            }
          },
          {
            success: tBookmark("form.permanentDeleteSuccess"),
            error: tBookmark("form.permanentDeleteFailed"),
          }
        );
      },
    });
  };

  const handleRestore = async (bookmark: Bookmark) => {
    await handleBookmarkRestore(
      bookmark.id,
      restoreBookmark,
      showNotification,
      () => {},
      {
        success: tBookmark("form.restoreSuccess"),
        error: tBookmark("form.restoreFailed"),
      }
    );
  };

  const handleUploadCover = async (id: number, file: File) => {
    await handleCoverImageUpload(
      id,
      file,
      uploadCoverImage,
      showNotification,
      () => {},
      {
        success: tBookmark("form.uploadSuccess"),
        error: tBookmark("form.uploadFailed"),
      }
    );
  };

  const handleCardClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setDetailDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#36393f] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#202225]">
        <h1 className="text-2xl font-bold">{tBookmark("myBookmarks")}</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder={tCommon("search") || "Search..."}
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            {tBookmark("addBookmark")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <BookmarkFilters
        filterType={filterType}
        filterStatus={filterStatus}
        filterMood={filterMood}
        filterTag={filterTag}
        sortBy={sortBy}
        includeDeleted={includeDeleted}
        onTypeChange={setFilterType}
        onStatusChange={setFilterStatus}
        onMoodChange={setFilterMood}
        onTagChange={setFilterTag}
        onSortByChange={setSortBy}
        onIncludeDeletedChange={setIncludeDeleted}
        onClearFilters={clearFilters}
        t={t}
        tags={tags}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        ) : displayedBookmarks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              description={
                <div className="text-gray-400">
                  <p>{tBookmark("noBookmarks")}</p>
                  <p className="text-sm">
                    {tBookmark("noBookmarksDescription")}
                  </p>
                </div>
              }
            >
              <Button type="primary" onClick={handleOpenCreate}>
                {tBookmark("addBookmark")}
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="group">
                <BookmarkCard
                  bookmark={bookmark}
                  onClick={() => handleCardClick(bookmark)}
                  onEdit={() => handleOpenEdit(bookmark)}
                  onDelete={() =>
                    bookmark.deleted_status
                      ? handlePermanentDelete(bookmark)
                      : handleDelete(bookmark)
                  }
                  onRestore={() => handleRestore(bookmark)}
                  isSelected={selectedBookmark?.id === bookmark.id}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <BookmarkFormModal
        open={modalOpen}
        mode={modalMode}
        bookmark={editingBookmark}
        tags={tags}
        initialType={selectedTypeForForm || undefined}
        onClose={handleCloseModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onUploadCover={handleUploadCover}
        t={(key) => {
          // Try bookmark translations first, then common
          try {
            return t(key) || tc(key);
          } catch {
            return tc(key);
          }
        }}
      />

      {/* Type Selector Modal */}
      <TypeSelector
        open={typeSelectorOpen}
        onSelect={handleTypeSelect}
        onClose={() => setTypeSelectorOpen(false)}
        t={t}
      />

      {/* Detail Drawer */}
      <BookmarkDetailDrawer
        open={detailDrawerOpen}
        bookmark={selectedBookmark}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedBookmark(null);
        }}
        onEdit={() => {
          if (selectedBookmark) {
            handleOpenEdit(selectedBookmark);
            setDetailDrawerOpen(false);
          }
        }}
        onDelete={() => {
          if (selectedBookmark) {
            if (selectedBookmark.deleted_status) {
              handlePermanentDelete(selectedBookmark);
            } else {
              handleDelete(selectedBookmark);
            }
          }
        }}
        t={t}
      />
    </div>
  );
}
