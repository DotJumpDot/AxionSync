"use client";

import { App } from "antd";
import { useTranslations } from "next-intl";
import {
  MODAL_CONFIRM_STYLES,
  modalTitleStyle,
  modalContentStyle,
  getWarningIcon,
} from "./modalStyles";

interface DeleteConfirmModalProps {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Hook to show a reusable delete confirmation modal with multi-language support
 * Use this for all destructive actions like delete, reset, etc.
 * Pass the modal instance from App.useApp()
 *
 * Example:
 * const { modal } = App.useApp();
 * const showDelete = useShowDeleteConfirm();
 * showDelete(modal, { onConfirm: () => deleteItem() });
 */
export const useShowDeleteConfirm = () => {
  const tCommon = useTranslations("common");

  return (
    modal: ReturnType<typeof App.useApp>["modal"],
    options: DeleteConfirmModalProps
  ) => {
    const {
      title = tCommon("confirmDelete"),
      content = tCommon("deleteConfirmMessage"),
      okText = tCommon("delete"),
      cancelText = tCommon("cancel"),
      onConfirm,
      onCancel,
      isLoading = false,
    } = options;

    return modal.confirm({
      ...MODAL_CONFIRM_STYLES,
      title: modalTitleStyle(title),
      icon: getWarningIcon(),
      content: modalContentStyle(content),
      okText,
      cancelText,
      okButtonProps: {
        ...MODAL_CONFIRM_STYLES.okButtonProps,
        loading: isLoading,
      },
      onOk: () => onConfirm(),
      onCancel: () => onCancel?.(),
    });
  };
};

export default useShowDeleteConfirm;
