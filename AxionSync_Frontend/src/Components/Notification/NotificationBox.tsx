import { motion } from "framer-motion";

export interface Notice {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  leaving?: boolean; // เพิ่ม flag
}

export default function NotificationBox({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: (id: string) => void;
}) {
  return (
    <motion.div
      key={notice.id}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 350, opacity: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={`
        px-5 py-5 rounded-xl shadow-lg border text-white text-base
        backdrop-blur-md
        ${
          notice.type === "success"
            ? "bg-green-600/90 border-green-300/40"
            : notice.type === "error"
            ? "bg-red-600/90 border-red-300/40"
            : "bg-blue-600/90 border-blue-300/40"
        }
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{notice.message}</span>
        <button
          onClick={() => onClose(notice.id)}
          className="text-white text-xl font-bold hover:opacity-70"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
