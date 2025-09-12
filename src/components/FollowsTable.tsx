import React, { useMemo, useState } from "react";
import { FollowData, SpoonUser, UserData } from "@/types/spoon";

// ...existing code...

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleImgError = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = getDefaultAvatar();
    },
    []
  );

  return (
    // ...existing code...
  );
// テーブルヘッダー
const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <th
    className={`px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase select-none ${className}`}
  >
    {children}
  </th>
);

// 並び替え可能なヘッダー
const SortableTh: React.FC<{
  children: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}> = ({ children, active, dir, onClick, className = "" }) => (
  <th
    onClick={onClick}
    className={`px-3 py-2 text-left text-[11px] font-semibold tracking-wider uppercase cursor-pointer select-none group ${
      active ? "text-purple-600" : "text-gray-500 hover:text-gray-700"
    } ${className}`}
  >
    <span className="inline-flex items-center gap-1">
      {children}
      <span className="text-[9px] opacity-70 group-hover:opacity-100">
        {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </span>
  </th>
);

// バッジ
const Badge: React.FC<{
  children: React.ReactNode;
  color?: "red" | "teal" | "blue" | "gray";
}> = ({ children, color = "gray" }) => {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600 border-red-200",
    teal: "bg-teal-100 text-teal-600 border-teal-200",
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`border text-[10px] font-semibold px-2 py-1 rounded-full ${colorMap[color]}`}
    >
      {children}
    </span>
  );
};

// デフォルトアバター
const DEFAULT_AVATAR_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMWUxZTEiLz48cGF0aCBkPSJNMjAgMThjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjYmZiZmJmIi8+PC9zdmc+";


// 種別アイコン
function TypeIcon({ type }: { type: "mutual" | "follower" | "following" | "none" }) {
  const colorMap: Record<string, string> = {
    mutual: "#3b82f6", // blue-500
    follower: "#ef4444", // red-500
    following: "#14b8a6", // teal-500
    none: "#d1d5db", // gray-300
  };
  return (
    <svg width="16" height="16" className="inline-block align-middle" aria-label={type}>
      <circle cx="8" cy="8" r="7" fill={colorMap[type]} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}



function getDefaultAvatar() {
  return DEFAULT_AVATAR_BASE64;
}
