"use client";

import { useState } from "react";
import FollowVisualizer from "@/components/FollowVisualizer";
import StatsSection from "@/components/StatsSection";
import InputSection from "@/components/InputSection";
import ErrorSection from "@/components/ErrorSection";
import { UserData, FollowData } from "@/types/spoon";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followData, setFollowData] = useState<FollowData | null>(null);

  const handleLoadData = async (userId: string) => {
    setLoading(true);
    setError(null);
    setUserData(null);
    setFollowData(null);

    try {
      // ユーザー情報、フォロワー、フォロー情報を並行して取得（プロキシ経由）
      const [userResponse, followersResponse, followingsResponse] =
        await Promise.all([
          fetch(`/api/spoon/${userId}`),
          fetch(`/api/spoon/${userId}/followers`),
          fetch(`/api/spoon/${userId}/followings`),
        ]);

      if (!userResponse.ok) {
        throw new Error(
          `ユーザー情報の取得に失敗しました (${userResponse.status})`
        );
      }

      if (!followersResponse.ok) {
        throw new Error(
          `フォロワー情報の取得に失敗しました (${followersResponse.status})`
        );
      }

      if (!followingsResponse.ok) {
        throw new Error(
          `フォロー情報の取得に失敗しました (${followingsResponse.status})`
        );
      }

      const userInfo = await userResponse.json();
      const followersData = await followersResponse.json();
      const followingsData = await followingsResponse.json();

      console.log("取得したユーザーデータ:", userInfo);
      console.log("取得したフォロワーデータ:", followersData);
      console.log("取得したフォロー中データ:", followingsData);

      // 相互フォローを計算
      const followerIds = new Set(
        followersData.results?.map((f: any) => f.id) || []
      );
      const followingIds = new Set(
        followingsData.results?.map((f: any) => f.id) || []
      );
      const mutualFollows =
        followersData.results?.filter((follower: any) =>
          followingIds.has(follower.id)
        ) || [];

      setFollowData({
        followers: followersData.results || [],
        followings: followingsData.results || [],
        mutualFollows,
      });

      // 実際のユーザー情報を設定（resultsの最初の要素を使用）
      const targetUser = userInfo.results?.[0];
      if (targetUser) {
        setUserData({
          id: targetUser.id.toString(),
          nickname: targetUser.nickname,
          tag: targetUser.tag,
          profile_url: targetUser.profile_url,
        });
      } else {
        // フォールバック: ユーザー情報が取得できない場合
        setUserData({
          id: userId,
          nickname: `ユーザー ${userId}`,
          tag: `user_${userId}`,
          profile_url: null,
        });
      }
    } catch (err) {
      console.error("データ読み込みエラー:", err);
      setError(
        err instanceof Error ? err.message : "データの読み込みに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            🍜 Spoon フォロー可視化ツール
          </h1>
          <p className="text-xl opacity-90">
            ユーザーIDを入力してフォロー関係を可視化しましょう
          </p>
        </header>

        <InputSection onLoadData={handleLoadData} loading={loading} />

        {error && <ErrorSection message={error} />}

        {followData && userData && (
          <>
            <StatsSection
              followerCount={followData.followers.length}
              followingCount={followData.followings.length}
              mutualCount={followData.mutualFollows.length}
            />
            <FollowVisualizer userData={userData} followData={followData} />
          </>
        )}
      </div>
    </div>
  );
}
