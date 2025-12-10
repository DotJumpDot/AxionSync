"use client";

import { motion } from "framer-motion";
import { BOOKMARK_TYPES, BookmarkType } from "@/Types/Bookmark";

// Type icons mapping
const TYPE_ICONS: Record<BookmarkType, string> = {
  Game: "🎮",
  Movie: "🎬",
  Novel: "📖",
  Manga: "📚",
  Manhwa: "📕",
  Anime: "🎌",
  Series: "📺",
};

// Type colors mapping
const TYPE_COLORS: Record<BookmarkType, string> = {
  Game: "from-purple-600 to-purple-800",
  Movie: "from-pink-600 to-pink-800",
  Novel: "from-cyan-600 to-cyan-800",
  Manga: "from-orange-600 to-orange-800",
  Manhwa: "from-green-600 to-green-800",
  Anime: "from-blue-600 to-blue-800",
  Series: "from-yellow-600 to-yellow-800",
};

type TypeSelectorProps = {
  open: boolean;
  onSelect: (type: BookmarkType) => void;
  onClose: () => void;
  t: (key: string) => string;
};

export default function TypeSelector({
  open,
  onSelect,
  onClose,
  t,
}: TypeSelectorProps) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-4xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {t("selectType")}
          </h2>
          <p className="text-gray-400">{t("selectTypeDescription")}</p>
        </div>

        {/* Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BOOKMARK_TYPES.map((type, index) => (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(type)}
              className={`
                relative overflow-hidden rounded-xl p-6
                bg-linear-to-br ${TYPE_COLORS[type]}
                hover:shadow-lg hover:shadow-${type.toLowerCase()}-500/20
                transition-shadow duration-300
                group
              `}
            >
              {/* Icon */}
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                {TYPE_ICONS[type]}
              </div>

              {/* Label */}
              <div className="text-white font-semibold text-lg">
                {t(`types.${type}`)}
              </div>

              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
            </motion.button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
