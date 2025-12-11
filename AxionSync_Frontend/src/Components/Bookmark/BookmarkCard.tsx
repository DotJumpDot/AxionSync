"use client";

import { Tag } from "antd";
import type { Bookmark } from "@/Types/Bookmark";
import {
  getStatusColor,
  getTypeColor,
  formatRating,
} from "@/Functions/Bookmark";
import { Image } from "antd";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  t: (key: string) => string;
};

export default function BookmarkCard({
  bookmark,
  onClick,
  onEdit,
  onDelete,
  onRestore,
  isSelected = false,
  showActions = true,
  t,
}: BookmarkCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all
        ${
          isSelected
            ? "ring-2 ring-blue-500 bg-[#36393f]"
            : "bg-[#2f3136] hover:bg-[#36393f]"
        }
        ${bookmark.deleted_status ? "opacity-60" : ""}
      `}
    >
      {/* Cover Image */}
      <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden bg-[#202225]">
        {bookmark.cover_image ? (
          <Image
            src={`/bookmark/cover/${bookmark.cover_image}`}
            alt={bookmark.name}
            className="object-cover w-full h-full"
            preview={false}
            fallback="/bookmark/unidentifiedCover.jpg"
            // style={{ marginBottom: "-20px" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Type Badge */}
        <Tag
          color={getTypeColor(bookmark.type)}
          className="absolute left-2"
          style={{ bottom: "10px", position: "absolute" }}
        >
          {t(`types.${bookmark.type}`)}
        </Tag>

        {/* Status Badge */}
        <Tag
          color={getStatusColor(bookmark.status)}
          className="absolute right-1"
          style={{ bottom: "10px", position: "absolute" }}
        >
          {t(`statuses.${bookmark.status}`)}
        </Tag>

        {/* Deleted overlay */}
        {bookmark.deleted_status && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-red-400 font-semibold">DELETED</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3
          className="font-semibold text-white text-lg truncate"
          title={bookmark.name}
        >
          {bookmark.name}
        </h3>

        {/* Rating */}
        {bookmark.rating !== null && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-300">
              {formatRating(bookmark.rating)}
            </span>
            <span className="text-gray-500">/10</span>
          </div>
        )}

        {/* Short Review */}
        {bookmark.short_review && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {bookmark.short_review}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <Tag key={tag.id} className="text-xs">
                {tag.name}
              </Tag>
            ))}
            {bookmark.tags.length > 3 && (
              <Tag className="text-xs">+{bookmark.tags.length - 3}</Tag>
            )}
          </div>
        )}

        {/* Chapter/Progress */}
        {bookmark.chapter && (
          <div className="text-gray-500 text-xs">
            {t("chapter")}: {bookmark.chapter}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {bookmark.deleted_status ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore?.();
              }}
              className="p-1.5 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400"
              title={t("restore")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                title={t("editBookmark")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400"
                title={t("deleteBookmark")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
