"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Rate,
  Switch,
  InputNumber,
  DatePicker,
  Button,
  Collapse,
  Image,
} from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import type {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  BookmarkType,
  BookmarkStatus,
  WatchFrom,
} from "@/Types/Bookmark";
import type { Tag } from "@/Types/Tag";
import {
  BOOKMARK_TYPES,
  BOOKMARK_STATUSES,
  BOOKMARK_MOODS,
  TYPE_FIELDS,
} from "@/Types/Bookmark";
import dayjs from "dayjs";

type BookmarkFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  bookmark?: Bookmark | null;
  tags: Tag[];
  initialType?: BookmarkType;
  onClose: () => void;
  onCreate?: (data: CreateBookmarkRequest) => Promise<void>;
  onUpdate?: (id: number, data: UpdateBookmarkRequest) => Promise<void>;
  onUploadCover?: (id: number, file: File) => Promise<void>;
  onUploadCoverCreate?: (file: File) => void;
  t: (key: string) => string;
};

export default function BookmarkFormModal({
  open,
  mode,
  bookmark,
  tags,
  initialType,
  onClose,
  onCreate,
  onUpdate,
  onUploadCover,
  onUploadCoverCreate,
  t,
}: BookmarkFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch for type changes to re-render applicable fields
  const selectedType = Form.useWatch("type", form) as BookmarkType | undefined;

  const isEdit = mode === "edit" && bookmark;

  // Calculate applicable fields based on selected type
  const applicableFields = useMemo(() => {
    const type = selectedType || initialType || bookmark?.type;
    return type ? TYPE_FIELDS[type] : [];
  }, [selectedType, initialType, bookmark?.type]);

  const shouldShowField = (fieldName: string) =>
    applicableFields.includes(fieldName);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCoverPreview(null);
      setPendingCoverFile(null);
      if (isEdit && bookmark) {
        form.setFieldsValue({
          name: bookmark.name,
          type: bookmark.type,
          review: bookmark.review,
          short_review: bookmark.short_review,
          chapter: bookmark.chapter,
          mood: bookmark.mood || [],
          status: bookmark.status,
          rating: bookmark.rating,
          story_rating: bookmark.story_rating,
          action_rating: bookmark.action_rating,
          graphic_rating: bookmark.graphic_rating,
          sound_rating: bookmark.sound_rating,
          time_used: bookmark.time_used,
          release_time: bookmark.release_time
            ? dayjs(bookmark.release_time)
            : null,
          public: bookmark.public,
          tag_ids: bookmark.tags.map((tag) => tag.id),
          siteName: bookmark.watch_from?.siteName || "",
          siteURL: bookmark.watch_from?.siteURL || "",
        });
      } else {
        form.resetFields();
        if (initialType) {
          form.setFieldValue("type", initialType);
        }
      }
    }
  }, [open, bookmark, isEdit, initialType, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Build watch_from object
      const watchFrom: WatchFrom | null = values.siteName
        ? {
            siteName: values.siteName,
            siteURL: values.siteURL || undefined,
          }
        : null;

      const data = {
        name: values.name,
        type: values.type,
        review: values.review || null,
        short_review: values.short_review || null,
        chapter: values.chapter || null,
        mood: values.mood?.length > 0 ? values.mood : null,
        status: values.status || "PreWatch",
        rating: values.rating || null,
        story_rating: values.story_rating || null,
        action_rating: values.action_rating || null,
        graphic_rating: values.graphic_rating || null,
        sound_rating: values.sound_rating || null,
        time_used: values.time_used || null,
        release_time: values.release_time
          ? values.release_time.toISOString()
          : null,
        public: values.public || false,
        tag_ids: values.tag_ids || [],
        watch_from: watchFrom,
      };

      if (isEdit) {
        await onUpdate?.(bookmark.id, data);
      } else {
        await onCreate?.(data as CreateBookmarkRequest);
        // Handle cover upload for create mode
        if (pendingCoverFile && onUploadCoverCreate) {
          onUploadCoverCreate(pendingCoverFile);
        }
      }

      form.resetFields();
      setCoverPreview(null);
      setPendingCoverFile(null);
      onClose();
    } catch (error) {
      console.error("Form validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (isEdit && onUploadCover) {
      await onUploadCover(bookmark.id, file);
    } else {
      // Store file for upload after creation
      setPendingCoverFile(file);
    }
  };

  const initialValues = {
    type: initialType || ("Anime" as BookmarkType),
    status: "PreWatch" as BookmarkStatus,
    public: false,
    mood: [],
  };

  // Collapse items configuration
  const collapseItems = [
    {
      key: "basic",
      label: t("sections.basicInfo") || "Basic Information",
      children: (
        <div className="space-y-4">
          <Form.Item
            name="name"
            label={t("name")}
            rules={[{ required: true, message: t("form.nameRequired") }]}
          >
            <Input placeholder={t("name")} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label={t("type")}
              rules={[{ required: true, message: t("form.typeRequired") }]}
            >
              <Select
                disabled={!!isEdit}
                options={BOOKMARK_TYPES.map((type) => ({
                  value: type,
                  label: t(`types.${type}`),
                }))}
              />
            </Form.Item>

            <Form.Item name="status" label={t("status")}>
              <Select
                options={BOOKMARK_STATUSES.map((status) => ({
                  value: status,
                  label: t(`statuses.${status}`),
                }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="public"
              label={t("public")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            {isEdit && bookmark && (
              <Form.Item label={t("reviewVersion")}>
                <Input
                  value={bookmark.review_version}
                  disabled
                  className="bg-gray-700"
                />
              </Form.Item>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "source",
      label: t("sections.source") || "Source",
      children: (
        <div className="space-y-4">
          <Form.Item name="siteName" label={t("siteName") || "Site Name"}>
            <Input
              placeholder={t("siteName") || "e.g., Netflix, Steam, Crunchyroll"}
            />
          </Form.Item>

          <Form.Item name="siteURL" label={t("siteURL") || "Site URL"}>
            <Input
              placeholder="https://..."
              type="url"
              prefix={<LinkOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item name="release_time" label={t("releaseTime")}>
            <DatePicker className="w-full" />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "progress",
      label: t("sections.progress") || "Progress",
      children: (
        <div className="space-y-4">
          {shouldShowField("chapter") && (
            <Form.Item name="chapter" label={t("chapter")}>
              <Input placeholder={t("chapter")} />
            </Form.Item>
          )}

          {shouldShowField("time_used") && (
            <Form.Item
              name="time_used"
              label={`${t("timeUsed")} (${t("minutes")})`}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          )}
        </div>
      ),
      hidden: !shouldShowField("chapter") && !shouldShowField("time_used"),
    },
    {
      key: "ratings",
      label: t("sections.ratings") || "Ratings",
      children: (
        <div className="space-y-4">
          {shouldShowField("rating") && (
            <Form.Item name="rating" label={t("rating")}>
              <Rate count={10} allowHalf />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            {shouldShowField("story_rating") && (
              <Form.Item name="story_rating" label={t("storyRating")}>
                <Rate count={10} allowHalf />
              </Form.Item>
            )}

            {shouldShowField("action_rating") && (
              <Form.Item name="action_rating" label={t("actionRating")}>
                <Rate count={10} allowHalf />
              </Form.Item>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {shouldShowField("graphic_rating") && (
              <Form.Item name="graphic_rating" label={t("graphicRating")}>
                <Rate count={10} allowHalf />
              </Form.Item>
            )}

            {shouldShowField("sound_rating") && (
              <Form.Item name="sound_rating" label={t("soundRating")}>
                <Rate count={10} allowHalf />
              </Form.Item>
            )}
          </div>
        </div>
      ),
      hidden: !shouldShowField("rating"),
    },
    {
      key: "mood",
      label: t("mood") || "Mood",
      children: (
        <Form.Item
          name="mood"
          label={t("moodDescription") || "How did this make you feel? (max 5)"}
          rules={[
            {
              validator: (_, value) => {
                if (value && value.length > 5) {
                  return Promise.reject(
                    new Error(t("form.maxMoods") || "Maximum 5 moods allowed")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder={t("mood")}
            maxTagCount="responsive"
            options={BOOKMARK_MOODS.map((mood) => ({
              value: mood,
              label: t(`moods.${mood}`) || mood,
            }))}
          />
        </Form.Item>
      ),
      hidden: !shouldShowField("mood"),
    },
    {
      key: "reviews",
      label: t("sections.reviews") || "Reviews",
      children: (
        <div className="space-y-4">
          {shouldShowField("short_review") && (
            <Form.Item name="short_review" label={t("shortReview")}>
              <Input.TextArea rows={2} placeholder={t("shortReview")} />
            </Form.Item>
          )}

          {shouldShowField("review") && (
            <Form.Item name="review" label={t("review")}>
              <Input.TextArea rows={4} placeholder={t("review")} />
            </Form.Item>
          )}
        </div>
      ),
      hidden: !shouldShowField("review") && !shouldShowField("short_review"),
    },
    {
      key: "additional",
      label: t("sections.additional") || "Additional",
      children: (
        <div className="space-y-4">
          {/* Tags */}
          <Form.Item name="tag_ids" label={t("tags")}>
            <Select
              mode="multiple"
              placeholder={t("tags")}
              options={tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }))}
            />
          </Form.Item>

          {/* Cover Image */}
          <Form.Item label={t("coverImage")}>
            <div className="flex items-start gap-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("coverImage")}
                </Button>
              </div>

              {/* Cover Preview */}
              {(coverPreview || (isEdit && bookmark?.cover_image)) && (
                <div className="relative w-40 h-40 rounded overflow-hidden border border-gray-600">
                  <Image
                    src={
                      coverPreview ||
                      `/bookmarkCoverImages/${bookmark?.cover_image}`
                    }
                    alt="Cover preview"
                    className="object-cover w-full h-full"
                    fallback="/bookmark/unidentifiedCover.jpg"
                    preview={false}
                  />
                </div>
              )}
            </div>
            {isEdit && bookmark?.cover_image && !coverPreview && (
              <span className="text-gray-400 text-sm mt-1 block">
                Current: {bookmark.cover_image}
              </span>
            )}
          </Form.Item>
        </div>
      ),
    },
  ].filter((item) => !item.hidden);

  return (
    <Modal
      open={open}
      title={isEdit ? t("editBookmark") : t("addBookmark")}
      onCancel={onClose}
      footer={null}
      width={700}
      className="dark-modal"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="space-y-4"
      >
        <Collapse
          defaultActiveKey={["basic", "ratings"]}
          items={collapseItems}
          className="bg-transparent"
        />

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose}>{t("cancel") || "Cancel"}</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? t("save") || "Save" : t("create") || "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
