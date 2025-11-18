import { AnimatePresence, motion } from "framer-motion";
import { Notice } from "./NotificationBox";

interface NoticeBarProps {
  notices: Notice[];
  remove: (id: string) => void;
}

export default function NoticeBar({ notices, remove }: NoticeBarProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }} // 👈 slide-out + fade
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className={`
              px-6 py-4 rounded-xl shadow-xl text-white border backdrop-blur-md
              ${
                notice.type === "success"
                  ? "bg-green-600/90 border-green-400/40"
                  : notice.type === "error"
                  ? "bg-red-600/90 border-red-400/40"
                  : "bg-blue-600/90 border-blue-400/40"
              }
            `}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{notice.message}</span>
              <button onClick={() => remove(notice.id)}>✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
