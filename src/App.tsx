// Googleスプレッドシート用リクエストログ送信関数
async function logRequestToSheet(userId: string) {
  const payload = {
    userId,
    timestamp: new Date().toISOString(),
  };
  // ログ送信内容をconsoleに表示
  // eslint-disable-next-line no-console
  console.log("ログ送信:", payload);
  try {
    await fetch("https://script.google.com/macros/s/AKfycby4uNMDvUpFL36A4vm6IwgQUTOaAalFSkc-Nq-G-TT892Mv_yEcxbb_VofpgACR4AwZ/exec", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // ログ送信失敗時は無視
  }
}
import React, { useState } from "react";
import InputSection from "@/components/InputSection";
import ErrorSection from "@/components/ErrorSection";
import StatsSection from "@/components/StatsSection";
import UserDetail from "@/components/UserDetail";
// チャンネル情報型
type ChannelInfo = {
  currentLiveId: number | null;
  recentLive: { created: string; title: string; imgUrl?: string } | null;
  nextSchedule: { scheduleDate: string; title: string } | null;
  allSchedules?: any[] | null;
};
// import FollowVisualizer from "@/components/FollowVisualizer"; // 重い可視化は無効化
import FollowsTable from "@/components/FollowsTable";
import { FollowData, UserData, SpoonUser } from "@/types/spoon";
import { fetchAll } from "@/lib/apiClient";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDetail, setUserDetail] = useState<SpoonUser | null>(null);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [followData, setFollowData] = useState<FollowData | null>(null);
  const [proxy, setProxy] = useState<string>("");
  const [initialUserId, setInitialUserId] = useState<string>("");

  React.useEffect(() => {
    // パスからID抽出（例: /@07_trk_70, /316642663）
    const path = window.location.pathname.replace(/^\//, "");
    if (path && (path.match(/^@\w+/) || path.match(/^\d+$/))) {
      setInitialUserId(path);
      handleLoadData(path);
    }
  }, []);

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

      const targetUser = userInfo?.results?.[0];
      if (targetUser && targetUser.id != null) {
        setUserData({
          id: targetUser.id.toString(),
          nickname: targetUser.nickname,
          tag: targetUser.tag,
          profile_url: targetUser.profile_url,
        });
        setUserDetail(targetUser);
        // チャンネル情報取得
        try {
          const channelUrl = `https://jp-gw.spooncast.net/channels/${targetUser.id}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(channelUrl)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const data = await res.json();
            const ch = data.result?.channel;
            // 最終LIVE
            const recentLive = ch?.recentLiveCasts?.[0]
              ? {
                  created: ch.recentLiveCasts[0].created,
                  title: ch.recentLiveCasts[0].title,
                  imgUrl: ch.recentLiveCasts[0].imgUrl,
                }
              : null;
            // 直近未来の配信予定のみ抽出
            let nextSchedule = null;
            let allSchedules = null;
            // channelの生データをデバッグ表示
            // eslint-disable-next-line no-console
            console.log('[Spoon channel] channel:', ch);
            if (Array.isArray(ch?.schedules)) {
              const now = new Date();
                allSchedules = ch.schedules; // 取得した全schedulesを渡す
                nextSchedule = null; // nextScheduleはnullに設定
            }
            setChannelInfo({
              currentLiveId: ch.currentLiveId ?? null,
              recentLive,
                nextSchedule: null,
                allSchedules,
            });
          } else {
            setChannelInfo(null);
          }
        } catch {
          setChannelInfo(null);
        }
        // 検索成功時のみログ送信
        await logRequestToSheet(targetUser.id.toString());
      } else {
        setUserData({
          id: userId,
          nickname: `ユーザー ${userId}`,
          tag: `user_${userId}`,
          profile_url: null,
        });
        setUserDetail(null);
        setChannelInfo(null);
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
        {/* バージョン表記 */}
        <div className="fixed bottom-2 right-4 bg-white/80 text-xs text-gray-700 px-3 py-1 rounded shadow z-50">
          v1.0.0
        </div>


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

  <InputSection onLoadData={handleLoadData} loading={loading} initialValue={initialUserId} />
        {error && <ErrorSection message={error} />}
        {followData && userData && (
          <>
            {userDetail && (
              <div className="px-2">
                <UserDetail user={userDetail} channelInfo={channelInfo} />
              </div>
            )}
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
