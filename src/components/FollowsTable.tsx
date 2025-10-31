import React, { useMemo, useState } from "react";
import { FollowData, SpoonUser, UserData } from "@/types/spoon";

type TabKey = "mutual" | "followers" | "followings";
const tabLabels: Record<TabKey, string> = {
  mutual: "相互",
  followers: "フォロワー",
  followings: "フォロー中",
};

// ライブ状態表示用のユーティリティ関数
function formatLiveStatus(user: any): { text: string, color: string, icon: React.ReactNode } {
  if (user.current_live && user.current_live.id) {
    return { 
      text: "ライブ中", 
      color: "text-green-600",
      icon: <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
    };
  } else {
    return { 
      text: "オフライン", 
      color: "text-gray-400",
      icon: <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
    };
  }
}

// 日時フォーマット用のユーティリティ関数
function formatLastLiveTime(lastLiveAt: string | null): string {
  if (!lastLiveAt) return "-";
  
  try {
    const date = new Date(lastLiveAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "今日";
    } else if (diffDays === 1) {
      return "昨日";
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}週間前`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}ヶ月前`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}年前`;
    }
  } catch (e) {
    return "-";
  }
}

function FollowsTable({
  userData,
  followData,
}: {
  userData: UserData;
  followData: FollowData;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("mutual");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "order" | "nickname" | "follower_count" | "following_count" | "is_live" | "last_live_at"
  >("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // フォロワータブに切り替えた時に最終ライブ順ソートが選択されていた場合は自動でライブ状態順に変更
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "followers" && sortKey === "last_live_at") {
      setSortKey("is_live");
    }
  };

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
      } else if (sortKey === "following_count") {
        av = a.following_count;
        bv = b.following_count;
      } else if (sortKey === "is_live") {
        // ライブ中のユーザーを上位に表示
        av = (a as any).current_live?.id ? 1 : 0;
        bv = (b as any).current_live?.id ? 1 : 0;
      } else if (sortKey === "last_live_at") {
        // 最終ライブ時間順
        const aLastLive = (a as any).last_live_at;
        const bLastLive = (b as any).last_live_at;
        
        if (!aLastLive && !bLastLive) return 0;
        if (!aLastLive) return 1;
        if (!bLastLive) return -1;
        
        const aTime = new Date(aLastLive).getTime();
        const bTime = new Date(bLastLive).getTime();
        
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      } else {
        av = a.following_count;
        bv = b.following_count;
      }
      if (av === undefined || av === 0) return 1;
      if (bv === undefined || bv === 0) return -1;
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
              onClick={() => handleTabChange(tab)}
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
                onChange={(e) => setSortKey(e.target.value as any)}
              >
                <option value="order">登録順</option>
                <option value="nickname">名前順</option>
                <option value="follower_count">フォロワー数順</option>
                <option value="following_count">フォロー数順</option>
                <option value="is_live">ライブ状態順</option>
                {activeTab !== "followers" && (
                  <option value="last_live_at">最終ライブ順</option>
                )}
              </select>
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-700"
                title="昇順/降順切替"
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
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
        <table
          className="min-w-full table-fixed text-xs"
          style={{ tableLayout: "fixed" }}
        >
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
                className="w-24 min-w-[72px] max-w-[110px] text-right"
              >
                フォロワー数
              </SortableTh>
              <SortableTh
                active={sortKey === "following_count"}
                dir={sortDir}
                onClick={() => handleSort("following_count")}
                className="w-24 min-w-[72px] max-w-[110px] text-right"
              >
                フォロー数
              </SortableTh>
              <SortableTh
                active={sortKey === "is_live"}
                dir={sortDir}
                onClick={() => handleSort("is_live")}
                className="w-20 min-w-[72px] max-w-[90px] text-left pl-3"
              >
                ライブ状態
              </SortableTh>
              {activeTab !== "followers" && (
                <SortableTh
                  active={sortKey === "last_live_at"}
                  dir={sortDir}
                  onClick={() => handleSort("last_live_at")}
                  className="w-20 min-w-[72px] max-w-[90px] text-left pl-3"
                >
                  最終ライブ
                </SortableTh>
              )}
              <Th className="w-12 min-w-[40px] max-w-[48px]">種別</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={activeTab === "followers" ? 6 : 7} className="text-center py-10 text-gray-500">
                  データがありません
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-purple-50/50">
                <td className="p-1">
                  <a
                    href={
                      (u as any).current_live?.id 
                        ? `https://www.spooncast.net/jp/live/@${u.tag}`
                        : `https://www.spooncast.net/jp/channel/${u.id}/tab/home`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                    title={
                      (u as any).current_live?.id 
                        ? "ライブを見る" 
                        : "チャンネルページを開く"
                    }
                  >
                    <img
                      src={u.profile_url || getDefaultAvatar()}
                      onError={handleImgError}
                      alt={u.nickname}
                      className={`w-10 h-10 rounded-full object-cover border cursor-pointer transition-all ${
                        (u as any).current_live?.id 
                          ? "hover:ring-2 hover:ring-red-400 ring-1 ring-red-300" 
                          : "hover:ring-2 hover:ring-blue-400"
                      }`}
                    />
                  </a>
                </td>
                <td className="p-1">
                  <div
                    className="font-medium text-gray-800 truncate max-w-[110px] md:max-w-[160px] lg:max-w-[180px] whitespace-nowrap"
                    title={u.nickname}
                  >
                    {u.nickname}
                  </div>
                  <div
                    className="text-xs text-gray-500 truncate max-w-[90px] md:max-w-[120px] lg:max-w-[140px] whitespace-nowrap"
                    title={u.tag}
                  >
                    @{u.tag}
                  </div>
                </td>
                <td className="p-1 text-right tabular-nums whitespace-nowrap overflow-x-auto">
                  {u.follower_count !== undefined
                    ? u.follower_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-1 text-right tabular-nums whitespace-nowrap overflow-x-auto">
                  {u.following_count !== undefined
                    ? u.following_count.toLocaleString()
                    : ""}
                </td>
                <td className="p-1 pl-3 text-left text-xs">
                  <div 
                    className="truncate max-w-[72px]"
                    title={(u as any).current_live?.id ? `ライブ中 (ID: ${(u as any).current_live.id})` : "オフライン"}
                  >
                    {(u as any).current_live?.id ? (
                      <a
                        href={`https://www.spooncast.net/jp/live/@${u.tag}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${formatLiveStatus(u).color} hover:underline cursor-pointer flex items-center`}
                        title="ライブを見る"
                      >
                        {formatLiveStatus(u).icon}
                        {formatLiveStatus(u).text}
                      </a>
                    ) : (
                      <span className={`${formatLiveStatus(u).color} flex items-center`}>
                        {formatLiveStatus(u).icon}
                        {formatLiveStatus(u).text}
                      </span>
                    )}
                  </div>
                </td>
                {activeTab !== "followers" && (
                  <td className="p-1 pl-3 text-left text-xs">
                    <div 
                      className="truncate max-w-[72px]"
                      title={(u as any).last_live_at ? `最終ライブ: ${(u as any).last_live_at}` : "ライブ履歴なし"}
                    >
                      <span className="text-gray-600">
                        {formatLastLiveTime((u as any).last_live_at)}
                      </span>
                    </div>
                  </td>
                )}
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
function TypeIcon({
  type,
}: {
  type: "mutual" | "follower" | "following" | "none";
}) {
  const colorMap: Record<string, string> = {
    mutual: "#3b82f6", // blue-500
    follower: "#ef4444", // red-500
    following: "#14b8a6", // teal-500
    none: "#d1d5db", // gray-300
  };
  return (
    <svg
      width="16"
      height="16"
      className="inline-block align-middle"
      aria-label={type}
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        fill={colorMap[type]}
        stroke="#fff"
        strokeWidth="2"
      />
    </svg>
  );
}

function getDefaultAvatar() {
  return DEFAULT_AVATAR_BASE64;
}
