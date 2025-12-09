import React from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";

/**
 * Standard modal confirm styles used across the application
 * Large centered modal with styled buttons
 */
export const MODAL_CONFIRM_STYLES = {
  centered: true,
  width: 550,
  okButtonProps: {
    danger: true,
    size: "large" as const,
    style: { width: "47%", height: "50px" },
  },
  cancelButtonProps: {
    size: "large" as const,
    style: {
      backgroundColor: "black",
      color: "white",
      width: "47%",
      height: "50px",
    },
  },
};

/** Standard title style for modal confirms */
export const modalTitleStyle = (text: string): React.ReactNode =>
  React.createElement(
    "span",
    { style: { fontSize: "24px", fontWeight: 600 } },
    text
  );

/** Standard content wrapper for modal confirms */
export const modalContentStyle = (
  text: string,
  height = "60px"
): React.ReactNode =>
  React.createElement(
    "div",
    { style: { height, marginTop: "30px" } },
    React.createElement(
      "span",
      { style: { fontSize: "16px", color: "#666" } },
      text
    )
  );

/** Modal body style for full-screen modals */
export const MODAL_FULLSCREEN_BODY = {
  height: "93vh",
  overflow: "hidden" as const,
  padding: 0,
};

/** Default warning icon for delete/danger confirmations */
export const getWarningIcon = () =>
  React.createElement(ExclamationCircleOutlined, {
    style: { color: "#faad14", marginRight: "8px" },
  });
