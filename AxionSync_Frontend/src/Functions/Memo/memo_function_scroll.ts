import type { Memo } from "@/Types/Memo";

export const scrollToMemo = (
  id: number,
  refs: { [key: number]: HTMLDivElement | null }
) => {
  refs[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
};

export const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
  ref.current?.scrollIntoView({ behavior: "smooth" });
};
