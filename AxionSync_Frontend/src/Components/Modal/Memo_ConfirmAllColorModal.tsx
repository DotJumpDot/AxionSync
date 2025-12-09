"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";
import React from "react";
import {
  MODAL_CONFIRM_STYLES,
  modalTitleStyle,
  modalContentStyle,
} from "./modalStyles";

interface ConfirmAllColorModalProps {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  color?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Hook to show a reusable color apply confirmation modal with multi-language support
 * Used for applying color to all memos in the current tab
 * Pass the modal instance from App.useApp()
 *
 * Example:
 * const { modal } = App.useApp();
 * const showColorConfirm = useShowConfirmAllColorModal();
 * showColorConfirm(modal, { color: "#dcddde", onConfirm: () => applyColor() });
 */
export const useShowConfirmAllColorModal = () => {
  const tMemo = useTranslations("memo");
  const tCommon = useTranslations("common");

  return (
    modal: ReturnType<typeof App.useApp>["modal"],
    options: ConfirmAllColorModalProps
  ) => {
    const {
      title = tMemo("actions.applyColorTitle"),
      content = tMemo("actions.applyColorContent", {
        color: options.color || "#dcddde",
      }),
      okText = tMemo("actions.apply"),
      cancelText = tCommon("cancel"),
      onConfirm,
      onCancel,
      isLoading = false,
      color = "#dcddde",
    } = options;

    return modal.confirm({
      ...MODAL_CONFIRM_STYLES,
      title: modalTitleStyle(title),
      icon: getColorIcon(color),
      content: modalContentStyle(content),
      okText,
      okType: "primary",
      cancelText,
      okButtonProps: {
        ...MODAL_CONFIRM_STYLES.okButtonProps,
        loading: isLoading,
        danger: false,
      },
      onOk: () => onConfirm(),
      onCancel: () => onCancel?.(),
    });
  };
};

/** Color preview icon for color confirmation modals */
const getColorIcon = (color: string) =>
  React.createElement("div", {
    style: {
      display: "inline-block",
      width: "24px",
      height: "24px",
      borderRadius: "4px",
      backgroundColor: color,
      border: "2px solid #ccc",
      marginRight: "8px",
      verticalAlign: "middle",
    },
  });

export default useShowConfirmAllColorModal;
