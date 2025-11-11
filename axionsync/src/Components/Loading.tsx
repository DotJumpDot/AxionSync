// components/Loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 font-semibold">Loading...</p>
    </div>
  );
}
