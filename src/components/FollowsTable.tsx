import React, { useMemo, useState } from "react";
import { FollowData, SpoonUser, UserData } from "@/types/spoon";

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
      : list;
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
        <div className="flex flex-col items-end gap-1 min-w-[160px]">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <TypeIcon type="mutual" /> 相互
            <TypeIcon type="follower" /> フォロワー
            <TypeIcon type="following" /> フォロー中
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
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th className="w-12">アイコン</Th>
              <SortableTh
                active={sortKey === "nickname"}
                dir={sortDir}
                onClick={() => handleSort("nickname")}
                className="w-32"
              >
                ユーザー
              </SortableTh>
              <SortableTh
                active={sortKey === "follower_count"}
                dir={sortDir}
                onClick={() => handleSort("follower_count")}
                className="w-20"
              >
                フォロワー数
              </SortableTh>
              <SortableTh
                active={sortKey === "following_count"}
                dir={sortDir}
                onClick={() => handleSort("following_count")}
                className="w-20"
              >
                フォロー数
              </SortableTh>
              <Th className="w-16">種別</Th>
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
                <td className="p-2">
                  <img
                    src={u.profile_url || getDefaultAvatar()}
                    onError={handleImgError}
                    alt={u.nickname}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="p-2">
                  <div
                    className="font-medium text-gray-800 truncate max-w-[180px]"
                    title={u.nickname}
                  >
                    {u.nickname}
                  </div>
                  <div className="text-xs text-gray-500">@{u.tag}</div>
                </td>
                <td className="p-2 text-right tabular-nums">
                  {u.follower_count !== undefined
                    ? u.follower_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-2 text-right tabular-nums">
                  {u.following_count !== undefined
                    ? u.following_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-2 text-xs text-center">
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

// Badge, getDefaultAvatar, TypeIcon 定義はこの下に続く
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

const DEFAULT_AVATAR_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMWUxZTEiLz48cGF0aCBkPSJNMjAgMThjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjYmZiZmJmIi8+PC9zdmc+";


function getDefaultAvatar() {
  return DEFAULT_AVATAR_BASE64;
}
