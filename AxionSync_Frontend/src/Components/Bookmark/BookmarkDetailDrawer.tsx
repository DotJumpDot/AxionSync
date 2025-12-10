"use client";

import { useMemo } from "react";
import { Drawer, Tag, Image, Divider, Button, Tooltip } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import type { Bookmark } from "@/Types/Bookmark";
import { TYPE_FIELDS } from "@/Types/Bookmark";
import {
  getStatusColor,
  getTypeColor,
  formatRating,
  formatTimeUsed,
} from "@/Functions/Bookmark/bookmark_helpers";

type BookmarkDetailDrawerProps = {
  open: boolean;
  bookmark: Bookmark | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  t: (key: string) => string;
};

export default function BookmarkDetailDrawer({
  open,
  bookmark,
  onClose,
  onEdit,
  onDelete,
  t,
}: BookmarkDetailDrawerProps) {
  // Calculate applicable fields based on bookmark type - must be before early return
  const applicableFields = useMemo(() => {
    return bookmark?.type ? TYPE_FIELDS[bookmark.type] : [];
  }, [bookmark]);

  const shouldShowField = (fieldName: string) =>
    applicableFields.includes(fieldName);

  if (!bookmark) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={bookmark.name}
      size="large"
      className="dark-drawer"
      extra={
        <div className="flex gap-2">
          <Button type="primary" onClick={onEdit}>
            {t("editBookmark")}
          </Button>
          <Button danger onClick={onDelete}>
            {t("deleteBookmark")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cover Image */}
        {bookmark.cover_image && (
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={`/bookmark/cover/${bookmark.cover_image}`}
              alt={bookmark.name}
              className="object-cover w-full h-full"
              fallback="/bookmark/unidentifiedCover.jpg"
            />
          </div>
        )}

        {/* Type and Status */}
        <div className="flex gap-2 flex-wrap">
          <Tag color={getTypeColor(bookmark.type)} className="text-sm">
            {t(`types.${bookmark.type}`)}
          </Tag>
          <Tag color={getStatusColor(bookmark.status)} className="text-sm">
            {t(`statuses.${bookmark.status}`)}
          </Tag>
          {bookmark.public && (
            <Tag color="blue" className="text-sm">
              {t("public")}
            </Tag>
          )}
        </div>

        {/* Reviewer Info */}
        {bookmark.user && (
          <div className="bg-[#2f3136] rounded-lg p-3">
            <DetailItem
              label={t("reviewedBy") || "Reviewed by"}
              value={bookmark.user.firstname || bookmark.user.username}
              icon="👤"
            />
            {bookmark.review_version && (
              <DetailItem
                label={t("reviewVersion")}
                value={`v${bookmark.review_version}`}
                icon="📝"
              />
            )}
          </div>
        )}

        {/* Ratings - Type Filtered */}
        <div className="grid grid-cols-2 gap-4">
          {shouldShowField("rating") && (
            <DetailItem
              label={t("rating")}
              value={formatRating(bookmark.rating)}
              icon="★"
              iconColor="text-yellow-400"
            />
          )}
          {shouldShowField("story_rating") && (
            <DetailItem
              label={t("storyRating")}
              value={formatRating(bookmark.story_rating)}
              icon="📖"
            />
          )}
          {shouldShowField("action_rating") && (
            <DetailItem
              label={t("actionRating")}
              value={formatRating(bookmark.action_rating)}
              icon="⚔️"
            />
          )}
          {shouldShowField("graphic_rating") && (
            <DetailItem
              label={t("graphicRating")}
              value={formatRating(bookmark.graphic_rating)}
              icon="🎨"
            />
          )}
          {shouldShowField("sound_rating") && (
            <DetailItem
              label={t("soundRating")}
              value={formatRating(bookmark.sound_rating)}
              icon="🎵"
            />
          )}
          {shouldShowField("time_used") && (
            <DetailItem
              label={t("timeUsed")}
              value={formatTimeUsed(bookmark.time_used)}
              icon="⏱️"
            />
          )}
        </div>

        <Divider />

        {/* Progress */}
        {shouldShowField("chapter") && bookmark.chapter && (
          <DetailItem label={t("chapter")} value={bookmark.chapter} icon="📑" />
        )}

        {/* Mood - Display as tags */}
        {shouldShowField("mood") &&
          bookmark.mood &&
          bookmark.mood.length > 0 && (
            <div className="space-y-2">
              <span className="text-gray-400 text-sm">{t("mood")}</span>
              <div className="flex flex-wrap gap-1">
                {bookmark.mood.map((m) => (
                  <Tag key={m} color="purple">
                    {t(`moods.${m}`) || m}
                  </Tag>
                ))}
              </div>
            </div>
          )}

        {/* Watch From - Clickable Link */}
        {bookmark.watch_from?.siteName && (
          <div className="space-y-1">
            <span className="text-gray-400 text-sm">{t("watchFrom")}</span>
            <div>
              {bookmark.watch_from.siteURL ? (
                <Tooltip title={bookmark.watch_from.siteURL}>
                  <a
                    href={bookmark.watch_from.siteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    {bookmark.watch_from.siteName}
                    <LinkOutlined />
                  </a>
                </Tooltip>
              ) : (
                <span className="text-gray-200">
                  {bookmark.watch_from.siteName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Release Time */}
        {bookmark.release_time && (
          <DetailItem
            label={t("releaseTime")}
            value={new Date(bookmark.release_time).toLocaleDateString()}
            icon="📅"
          />
        )}

        <Divider />

        {/* Short Review */}
        {bookmark.short_review && (
          <div className="space-y-1">
            <span className="text-gray-400 text-sm">{t("shortReview")}</span>
            <p className="text-gray-200">{bookmark.short_review}</p>
          </div>
        )}

        {/* Full Review */}
        {bookmark.review && (
          <div className="space-y-1">
            <span className="text-gray-400 text-sm">{t("review")}</span>
            <p className="text-gray-200 whitespace-pre-wrap">
              {bookmark.review}
            </p>
          </div>
        )}

        <Divider />

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="space-y-2">
            <span className="text-gray-400 text-sm">{t("tags")}</span>
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-gray-500 text-xs space-y-1 pt-4">
          <p>Created: {new Date(bookmark.created_at).toLocaleString()}</p>
          {bookmark.updated_at && (
            <p>Updated: {new Date(bookmark.updated_at).toLocaleString()}</p>
          )}
          {bookmark.last_viewed_at && (
            <p>
              {t("lastViewed")}:{" "}
              {new Date(bookmark.last_viewed_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Drawer>
  );
}

// Helper component for detail items
function DetailItem({
  label,
  value,
  icon,
  iconColor = "text-gray-400",
}: {
  label: string;
  value: string;
  icon?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className={iconColor}>{icon}</span>}
      <div>
        <span className="text-gray-400 text-xs">{label}</span>
        <p className="text-gray-200">{value}</p>
      </div>
    </div>
  );
}
