// Googleスプレッドシート用リクエストログ送信関数
async function logRequestToSheet(userId: string) {
  try {
    await fetch("https://script.google.com/macros/s/AKfycbzm_2zKiYWplQYP1rYOEf4Lkq97OXKcXORfti7Aa-5XvuIDQyr-ApUDBYjWEvQ59HNkwg/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // ログ送信失敗時は無視
  }
}
import React, { useState } from "react";
import InputSection from "@/components/InputSection";
import ErrorSection from "@/components/ErrorSection";
import StatsSection from "@/components/StatsSection";
// import FollowVisualizer from "@/components/FollowVisualizer"; // 重い可視化は無効化
import FollowsTable from "@/components/FollowsTable";
import { FollowData, UserData } from "@/types/spoon";
import { fetchAll } from "@/lib/apiClient";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followData, setFollowData] = useState<FollowData | null>(null);
  const [proxy, setProxy] = useState<string>("");

  const handleLoadData = async (userId: string) => {
    setLoading(true);
    setError(null);
    setUserData(null);
    setFollowData(null);
    try {
      const { userInfo, followersData, followingsData } = await fetchAll(
        userId,
        proxy || undefined
      );

      const followerIds = new Set(
        followersData.results?.map((f: any) => f.id) || []
      );
      const followingIds = new Set(
        followingsData.results?.map((f: any) => f.id) || []
      );
      const mutualFollows =
        followersData.results?.filter((f: any) => followingIds.has(f.id)) || [];

      setFollowData({
        followers: followersData.results || [],
        followings: followingsData.results || [],
        mutualFollows,
      });

      const targetUser = userInfo.results?.[0];
      if (targetUser) {
        setUserData({
          id: targetUser.id.toString(),
          nickname: targetUser.nickname,
          tag: targetUser.tag,
          profile_url: targetUser.profile_url,
        });
        // 検索成功時のみログ送信
        await logRequestToSheet(targetUser.id.toString());
      } else {
        setUserData({
          id: userId,
          nickname: `ユーザー ${userId}`,
          tag: `user_${userId}`,
          profile_url: null,
        });
      }
    } catch (e: any) {
      setError(e?.message || "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            Spoonフォロー可視化ツール
          </h1>
        </header>


        {/* プロキシURL入力欄（Collapse/Accordionで一番下に移動） */}
        <div className="fixed bottom-0 left-0 w-full flex justify-center pointer-events-none z-40">
          <div className="w-full max-w-md mx-auto mb-4 pointer-events-auto">
            <details className="bg-white rounded-xl shadow-lg px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 select-none">
                オプション: プロキシURL (CORS回避用)
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  id="proxy"
                  placeholder="例: https://your-proxy.example.com"
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">
                  Spoon API が CORS でブロックされる場合は、任意の CORS解除プロキシを設定してください。
                </p>
              </div>
            </details>
          </div>
        </div>

        <InputSection onLoadData={handleLoadData} loading={loading} />
        {error && <ErrorSection message={error} />}
        {followData && userData && (
          <>
            <div className="px-2">
              <StatsSection
                followerCount={followData.followers.length}
                followingCount={followData.followings.length}
                mutualCount={followData.mutualFollows.length}
              />
            </div>
            <FollowsTable userData={userData} followData={followData} />
          </>
        )}
      </div>
    </div>
  );
}
