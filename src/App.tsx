import React, { useState } from "react";
import InputSection from "@/components/InputSection";
import ErrorSection from "@/components/ErrorSection";
import StatsSection from "@/components/StatsSection";
import UserDetail from "@/components/UserDetail";
import packageJson from "../package.json";
// チャンネル情報型
type ChannelInfo = {
  currentLiveId: number | null;
  recentLive: { created: string; title: string; imgUrl?: string } | null;
  nextSchedule: { scheduleDate: string; title: string } | null;
  allSchedules?: any[] | null;
  // 新しく追加する情報
  socialLinks?: any[] | null;
  topFans?: any[] | null;
  popularCasts?: any[] | null;
  recentPosts?: any[] | null;
  analysis?: any | null;
  fullChannelData?: any | null;
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
      const {
        userInfo,
        channelInfo,
        userDirectInfo,
        followersData,
        followingsData,
      } = await fetchAll(userId, proxy || undefined);

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

      // userInfoとchannelInfoからユーザー情報を構築
      const profilesUser = userInfo?.results?.[0];
      const channelUser = channelInfo?.result?.channel;
      const directUser = userDirectInfo; // jp-api.spooncast.net/users/{id}/ のレスポンス

      console.log("[DEBUG] profilesUser:", profilesUser);
      console.log("[DEBUG] channelUser:", channelUser);
      console.log("[DEBUG] directUser:", directUser);

      console.log("[DEBUG] userInfo:", userInfo);
      console.log("[DEBUG] channelInfo:", channelInfo);
      console.log("[DEBUG] profilesUser:", profilesUser);
      console.log("[DEBUG] channelUser:", channelUser);

      // channelInfoから詳細なユーザー情報を構築
      let finalUser = null;
      if (channelUser) {
        // フォロワー/フォロー中リストから対象ユーザーの詳細情報を探す
        const targetUserId = channelUser.id;
        let detailedUserInfo = null;

        // followersとfollowingsの結果から、対象ユーザーの詳細情報を探す
        const allUsers = [
          ...(followersData.results || []),
          ...(followingsData.results || []),
        ];
        detailedUserInfo = allUsers.find((user) => user.id === targetUserId);

        console.log(
          "[DEBUG] detailedUserInfo from followers/followings:",
          detailedUserInfo
        );
        console.log("[DEBUG] channelUser:", channelUser);
        console.log("[DEBUG] directUser:", directUser);
        console.log(
          "[DEBUG] channelInfo.fullChannelData:",
          channelInfo?.fullChannelData
        );

        finalUser = {
          id: channelUser.id || parseInt(userId.replace(/^@/, "")),
          nickname: channelUser.nickname || `ユーザー ${userId}`,
          tag: channelUser.tag || detailedUserInfo?.tag || `user_${userId}`,
          profile_url:
            channelUser.profileUrl || detailedUserInfo?.profile_url || "",
          // SpoonUser型の必須プロパティを設定
          top_impressions: detailedUserInfo?.top_impressions || [],
          description:
            channelUser.selfIntroduction || detailedUserInfo?.description || "",
          gender: detailedUserInfo?.gender || 0,
          follow_status: detailedUserInfo?.follow_status || 0,
          follower_count:
            directUser?.follower_count ||
            channelInfo?.fullChannelData?.followerCount ||
            detailedUserInfo?.follower_count ||
            0,
          following_count:
            directUser?.following_count ||
            channelInfo?.fullChannelData?.followingCount ||
            detailedUserInfo?.following_count ||
            0,
          is_active: detailedUserInfo?.is_active || true,
          is_staff: detailedUserInfo?.is_staff || false,
          is_vip: channelUser.isVip || detailedUserInfo?.is_vip || false,
          date_joined:
            directUser?.date_joined ||
            channelUser?.dateJoined ||
            channelInfo?.fullChannelData?.date_joined ||
            detailedUserInfo?.date_joined ||
            "",
          current_live: detailedUserInfo?.current_live || null,
          country: detailedUserInfo?.country || "",
          is_verified:
            channelUser.isVerified || detailedUserInfo?.is_verified || false,
        };
      } else if (profilesUser) {
        // channelInfoが取得できない場合はprofilesUserから最低限の情報を使用
        finalUser = {
          id: profilesUser.user_id,
          nickname: `ユーザー ${profilesUser.user_id}`,
          tag: `user_${profilesUser.user_id}`,
          profile_url: "",
          top_impressions: [],
          description: "",
          gender: 0,
          follow_status: 0,
          follower_count: 0,
          following_count: 0,
          is_active: true,
          is_staff: false,
          is_vip: false,
          date_joined: "",
          current_live: null,
          country: "",
          is_verified: false,
        };
      }

      if (finalUser && finalUser.id != null) {
        setUserData({
          id: finalUser.id.toString(),
          nickname: finalUser.nickname,
          tag: finalUser.tag,
          profile_url: finalUser.profile_url,
        });
        setUserDetail(finalUser);

        // 新しいCloud Functions APIから取得したチャンネル情報を使用
        if (channelInfo) {
          const ch = channelInfo.result?.channel;
          console.log("[Spoon channel] full channel data:", ch);

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
          if (Array.isArray(ch?.schedules)) {
            allSchedules = ch.schedules; // 取得した全schedulesを渡す
            nextSchedule = null; // nextScheduleはnullに設定
          }

          setChannelInfo({
            currentLiveId: ch?.currentLiveId ?? null,
            recentLive,
            nextSchedule: null,
            allSchedules,
            // 新しい情報を追加
            socialLinks: ch?.socialLinks || null,
            topFans: ch?.topFans || null,
            popularCasts: ch?.popularCasts || null,
            recentPosts: ch?.recentPosts || null,
            analysis: (channelInfo.result as any)?.analysis || null,
            fullChannelData: ch || null,
          });
        } else {
          setChannelInfo(null);
        }
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
          v{packageJson.version}
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
                  Spoon API が CORS でブロックされる場合は、任意の
                  CORS解除プロキシを設定してください。
                </p>
              </div>
            </details>
          </div>
        </div>

        <InputSection
          onLoadData={handleLoadData}
          loading={loading}
          initialValue={initialUserId}
        />
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
                followerCount={
                  channelInfo?.fullChannelData?.followerCount ||
                  userDetail?.follower_count ||
                  followData.followers.length
                }
                followingCount={
                  channelInfo?.fullChannelData?.followingCount ||
                  userDetail?.following_count ||
                  followData.followings.length
                }
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
