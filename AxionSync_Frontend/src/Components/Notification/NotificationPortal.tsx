import { createPortal } from "react-dom";

export default function NotificationPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "auto",
        zIndex: 99999, // ให้สูงพอ
        pointerEvents: "none", // ให้ไม่กิน event ถ้าต้องการ
      }}
    >
      {children}
    </div>,
    document.body
  );
}
