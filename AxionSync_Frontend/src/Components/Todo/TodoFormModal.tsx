"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Collapse,
  Tag,
} from "antd";
import type {
  Todo,
  TodoTag,
  CreateTodoRequest,
  UpdateTodoRequest,
} from "@/Types/Todo";
import {
  TODO_STATUSES,
  TODO_PRIORITIES,
  TODO_REPEAT_TYPES,
  TODO_MOODS,
} from "@/Types/Todo";
import {
  getPriorityIcon,
  getMoodEmoji,
  getPriorityColor,
  getStatusColor,
  getMoodColor,
} from "@/Functions/Todo/";
import dayjs from "dayjs";

const { TextArea } = Input;

type TodoFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  todo?: Todo | null;
  tags: TodoTag[];
  onClose: () => void;
  onCreate?: (data: CreateTodoRequest) => Promise<void>;
  onUpdate?: (id: number, data: UpdateTodoRequest) => Promise<void>;
  t: (key: string) => string;
};

export default function TodoFormModal({
  open,
  mode,
  todo,
  tags,
  onClose,
  onCreate,
  onUpdate,
  t,
}: TodoFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = mode === "edit" && todo;

  // Watch for repeat toggle
  const isRepeat = Form.useWatch("is_repeat", form);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (isEdit && todo) {
        form.setFieldsValue({
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          due_date: todo.due_date ? dayjs(todo.due_date) : null,
          is_repeat: todo.is_repeat,
          repeat_type: todo.repeat_type,
          mood: todo.mood,
          tag_ids: todo.tags.map((tag) => tag.id),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: "pending",
          priority: "medium",
          is_repeat: false,
        });
      }
    }
  }, [open, isEdit, todo, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data = {
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
      };

      if (isEdit && todo) {
        await onUpdate?.(todo.id, data);
      } else {
        await onCreate?.(data);
      }

      onClose();
    } catch (error) {
      console.error("Form validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <span className="text-white text-lg font-semibold">
          {isEdit ? t("editTodo") : t("addTodo")}
        </span>
      }
      onCancel={onClose}
      footer={null}
      width={600}
      className="dark-modal"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          status: "pending",
          priority: "medium",
          is_repeat: false,
        }}
      >
        {/* Title */}
        <Form.Item
          name="title"
          label={<span className="text-gray-300">{t("todoTitle")}</span>}
          rules={[{ required: true, message: t("errors.titleRequired") }]}
        >
          <Input
            placeholder={t("todoTitle")}
            className="bg-[#40444b] border-[#40444b] text-white"
            size="large"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label={<span className="text-gray-300">{t("description")}</span>}
        >
          <TextArea
            placeholder={t("descriptionPlaceholder")}
            className="bg-[#40444b] border-[#40444b] text-white"
            rows={3}
          />
        </Form.Item>

        {/* Row: Status + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="status"
            label={<span className="text-gray-300">{t("status")}</span>}
          >
            <Select
              className="w-full"
              classNames={{ popup: { root: "dark-dropdown" } }}
              options={TODO_STATUSES.map((status) => ({
                value: status,
                label: (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    {t(`statuses.${status}`)}
                  </span>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label={<span className="text-gray-300">{t("priority")}</span>}
          >
            <Select
              className="w-full"
              classNames={{ popup: { root: "dark-dropdown" } }}
              options={TODO_PRIORITIES.map((priority) => ({
                value: priority,
                label: (
                  <span className="flex items-center gap-2">
                    <span style={{ color: getPriorityColor(priority) }}>
                      {getPriorityIcon(priority)}
                    </span>
                    {t(`priorities.${priority}`)}
                  </span>
                ),
              }))}
            />
          </Form.Item>
        </div>

        {/* Due Date */}
        <Form.Item
          name="due_date"
          label={<span className="text-gray-300">{t("dueDate")}</span>}
        >
          <DatePicker
            className="w-full bg-[#40444b] border-[#40444b]"
            placeholder={t("dueDatePlaceholder")}
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        {/* Tags */}
        <Form.Item
          name="tag_ids"
          label={<span className="text-gray-300">{t("tags")}</span>}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t("tags")}
            className="w-full"
            classNames={{ popup: { root: "dark-dropdown" } }}
            options={tags.map((tag) => ({
              value: tag.id,
              label: (
                <Tag
                  className="border-0"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : "#4a4d52",
                    color: tag.color || "#fff",
                  }}
                >
                  {tag.name}
                </Tag>
              ),
            }))}
          />
        </Form.Item>

        {/* Mood */}
        <Form.Item
          name="mood"
          label={<span className="text-gray-300">{t("mood")}</span>}
        >
          <Select
            allowClear
            placeholder={t("moodDescription")}
            className="w-full"
            classNames={{ popup: { root: "dark-dropdown" } }}
            options={TODO_MOODS.map((mood) => ({
              value: mood,
              label: (
                <span className="flex items-center gap-2">
                  <span>{getMoodEmoji(mood)}</span>
                  <span style={{ color: getMoodColor(mood) }}>
                    {t(`moods.${mood}`)}
                  </span>
                </span>
              ),
            }))}
          />
        </Form.Item>

        {/* Repeat Section */}
        <Collapse
          ghost
          className="dark-collapse -mx-4"
          items={[
            {
              key: "repeat",
              label: (
                <span className="text-gray-400 text-sm">{t("repeat")}</span>
              ),
              children: (
                <div className="space-y-4">
                  <Form.Item
                    name="is_repeat"
                    label={<span className="text-gray-300">{t("repeat")}</span>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  {isRepeat && (
                    <Form.Item
                      name="repeat_type"
                      label={
                        <span className="text-gray-300">{t("repeatType")}</span>
                      }
                    >
                      <Select
                        className="w-full"
                        classNames={{ popup: { root: "dark-dropdown" } }}
                        options={TODO_REPEAT_TYPES.map((type) => ({
                          value: type,
                          label: t(`repeatTypes.${type}`),
                        }))}
                      />
                    </Form.Item>
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#40444b]">
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? t("save") : t("create")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
