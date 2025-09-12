import React, { useMemo, useState } from "react";
import { FollowData, SpoonUser, UserData } from "@/types/spoon";

type TabKey = "mutual" | "followers" | "followings";
const tabLabels: Record<TabKey, string> = {
  mutual: "相互",
  followers: "フォロワー",
  followings: "フォロー中",
};

function FollowsTable({ userData, followData }: { userData: UserData; followData: FollowData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("mutual");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"order" | "nickname" | "follower_count" | "following_count">("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const dataMap: Record<TabKey, SpoonUser[]> = useMemo(
    () => ({
      mutual: followData.mutualFollows,
      followers: followData.followers,
      followings: followData.followings,
    }),
    [followData]
  );

  const filtered = useMemo(() => {
    const list = dataMap[activeTab] || [];
    const lower = query.toLowerCase();
    const filteredList = lower
      ? list.filter(
          (u) =>
            (u.nickname || "").toLowerCase().includes(lower) ||
            (u.tag || "").toLowerCase().includes(lower)
        )
      : list;
    if (sortKey === "order") {
      // 取得順（登録順）はAPI配列順そのまま
      return sortDir === "asc" ? filteredList : [...filteredList].reverse();
    }
    const sorted = [...filteredList].sort((a, b) => {
      let av: string | number | undefined;
      let bv: string | number | undefined;
      if (sortKey === "nickname") {
        av = a.nickname?.toLowerCase();
        bv = b.nickname?.toLowerCase();
      } else if (sortKey === "follower_count") {
        av = a.follower_count;
        bv = b.follower_count;
      } else {
        av = a.following_count;
        bv = b.following_count;
      }
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [dataMap, activeTab, query, sortKey, sortDir]);

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
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tabLabels[tab]}{" "}
              <span className="ml-1 text-xs opacity-80">
                {dataMap[tab].length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-end gap-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <TypeIcon type="mutual" /> 相互
            <TypeIcon type="follower" /> フォロワー
            <TypeIcon type="following" /> フォロー中
          </div>
          <div className="flex gap-2 w-full mb-1">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              ソート:
              <select
                className="border rounded px-1 py-0.5 text-xs"
                value={sortKey}
                onChange={e => setSortKey(e.target.value as any)}
              >
                <option value="order">登録順</option>
                <option value="nickname">名前順</option>
                <option value="follower_count">フォロワー数順</option>
                <option value="following_count">フォロー数順</option>
              </select>
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-700"
                title="昇順/降順切替"
                onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
              >
                {sortDir === "asc" ? "▲" : "▼"}
              </button>
            </label>
          </div>
          <div className="relative max-w-xs w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="検索 (名前 / @tag)"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto border rounded-xl max-h-[60vh]">
  <table className="min-w-full table-fixed text-xs" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <Th className="w-10 min-w-[40px] max-w-[40px]">アイコン</Th>
              <SortableTh
                active={sortKey === "nickname"}
                dir={sortDir}
                onClick={() => handleSort("nickname")}
                className="w-32 min-w-[80px] max-w-[120px]"
              >
                ユーザー
              </SortableTh>
              <SortableTh
                active={sortKey === "follower_count"}
                dir={sortDir}
                onClick={() => handleSort("follower_count")}
                className="w-16 min-w-[56px] max-w-[80px] text-right"
              >
                フォロワー数
              </SortableTh>
              <SortableTh
                active={sortKey === "following_count"}
                dir={sortDir}
                onClick={() => handleSort("following_count")}
                className="w-16 min-w-[56px] max-w-[80px] text-right"
              >
                フォロー数
              </SortableTh>
              <Th className="w-12 min-w-[40px] max-w-[48px]">種別</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  データがありません
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-purple-50/50">
                <td className="p-1">
                  <img
                    src={u.profile_url || getDefaultAvatar()}
                    onError={handleImgError}
                    alt={u.nickname}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="p-1">
                  <div
                    className="font-medium text-gray-800 truncate max-w-[180px]"
                    title={u.nickname}
                  >
                    {u.nickname}
                  </div>
                  <div className="text-xs text-gray-500">@{u.tag}</div>
                </td>
                <td className="p-1 text-right tabular-nums">
                  {u.follower_count !== undefined
                    ? u.follower_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-1 text-right tabular-nums">
                  {u.following_count !== undefined
                    ? u.following_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-1 text-xs text-center">
                  {followData.mutualFollows.some((m) => m.id === u.id) ? (
                    <TypeIcon type="mutual" />
                  ) : activeTab === "followers" ? (
                    <TypeIcon type="follower" />
                  ) : activeTab === "followings" ? (
                    <TypeIcon type="following" />
                  ) : (
                    <TypeIcon type="none" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-4 items-center">
        <div>表示件数: {filtered.length}</div>
        <div>総フォロワー: {followData.followers.length}</div>
        <div>総フォロー: {followData.followings.length}</div>
        <div>相互: {followData.mutualFollows.length}</div>
      </div>
    </div>
  );
}

export default FollowsTable;
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
