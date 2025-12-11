"use client";

import { useState } from "react";
import { Input, Checkbox } from "antd";
import type { TodoItem } from "@/Types/Todo";

type ChecklistItemProps = {
  item: TodoItem;
  onToggle: (itemId: number) => void;
  onUpdate: (itemId: number, content: string) => void;
  onDelete: (itemId: number) => void;
  disabled?: boolean;
};

export default function ChecklistItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: ChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);

  const handleSave = () => {
    if (editContent.trim() && editContent !== item.content) {
      onUpdate(item.id, editContent.trim());
    } else {
      setEditContent(item.content);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditContent(item.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        group flex items-center gap-3 py-2 px-3 rounded-lg
        hover:bg-[#36393f] transition-colors
        ${item.is_done ? "opacity-60" : ""}
      `}
    >
      {/* Checkbox */}
      <Checkbox
        checked={item.is_done}
        onChange={() => onToggle(item.id)}
        disabled={disabled}
        className="custom-checkbox"
      />

      {/* Content */}
      {isEditing ? (
        <Input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-[#40444b] border-none text-white"
        />
      ) : (
        <span
          onClick={() => !disabled && setIsEditing(true)}
          className={`
            flex-1 text-gray-200 cursor-pointer
            ${item.is_done ? "line-through text-gray-500" : ""}
          `}
        >
          {item.content}
        </span>
      )}

      {/* Delete Button */}
      {!disabled && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-600/20 text-red-400 transition-opacity"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

type ChecklistInputProps = {
  onAdd: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function ChecklistInput({
  onAdd,
  placeholder = "Add item...",
  disabled = false,
}: ChecklistInputProps) {
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (content.trim()) {
      onAdd(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3">
      <div className="w-[22px] flex justify-center">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleAdd}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent border-none text-gray-400 placeholder:text-gray-600 focus:text-white"
      />
    </div>
  );
}
