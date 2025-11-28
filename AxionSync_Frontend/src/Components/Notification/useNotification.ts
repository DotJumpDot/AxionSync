import { App } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Hook to show AntD notifications in the top-right corner.
 * Must be used within a component wrapped by Ant Design's App provider.
 */
export const useNotification = () => {
  const { notification } = App.useApp();

  const showNotification = (
    msg: string | "Can't get managed to show notification.",
    type: NotificationType = "error",
    duration: number = 1.5
  ) => {
    notification[type]({
      message: type.charAt(0).toUpperCase() + type.slice(1),
      description: msg,
      placement: "topRight",
      duration,
    });
  };

  return { showNotification };
};
