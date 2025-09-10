import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import InputSection from "@/components/InputSection";
import ErrorSection from "@/components/ErrorSection";
import StatsSection from "@/components/StatsSection";
// import FollowVisualizer from "@/components/FollowVisualizer"; // 重い可視化は無効化
import FollowsTable from "@/components/FollowsTable";
import { fetchAll } from "@/lib/apiClient";
export default function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [followData, setFollowData] = useState(null);
    const [proxy, setProxy] = useState("");
    const handleLoadData = async (userId) => {
        setLoading(true);
        setError(null);
        setUserData(null);
        setFollowData(null);
        try {
            const { userInfo, followersData, followingsData } = await fetchAll(userId, proxy || undefined);
            const followerIds = new Set(followersData.results?.map((f) => f.id) || []);
            const followingIds = new Set(followingsData.results?.map((f) => f.id) || []);
            const mutualFollows = followersData.results?.filter((f) => followingIds.has(f.id)) || [];
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
            }
            else {
                setUserData({
                    id: userId,
                    nickname: `ユーザー ${userId}`,
                    tag: `user_${userId}`,
                    profile_url: null,
                });
            }
        }
        catch (e) {
            setError(e?.message || "データの取得に失敗しました");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("header", { className: "text-center text-white mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-4 drop-shadow-lg", children: "\uD83C\uDF5C Spoon \u30D5\u30A9\u30ED\u30FC\u53EF\u8996\u5316\u30C4\u30FC\u30EB (Static)" }), _jsx("p", { className: "text-xl opacity-90", children: "GitHub Pages \u3067\u30DB\u30B9\u30C8\u3055\u308C\u305F\u9759\u7684\u7248" })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 mb-6 flex flex-col gap-4", children: [_jsx("label", { className: "text-sm font-semibold text-gray-700", htmlFor: "proxy", children: "\u30AA\u30D7\u30B7\u30E7\u30F3: \u30D7\u30ED\u30AD\u30B7URL (CORS\u56DE\u907F\u7528)" }), _jsx("input", { id: "proxy", placeholder: "\u4F8B: https://your-proxy.example.com", value: proxy, onChange: (e) => setProxy(e.target.value), className: "px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" }), _jsx("p", { className: "text-xs text-gray-500", children: "Spoon API \u304C CORS \u3067\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u308B\u5834\u5408\u306F\u3001\u4EFB\u610F\u306E CORS \u89E3\u9664\u30D7\u30ED\u30AD\u30B7\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })] }), _jsx(InputSection, { onLoadData: handleLoadData, loading: loading }), error && _jsx(ErrorSection, { message: error }), followData && userData && (_jsxs(_Fragment, { children: [_jsx(StatsSection, { followerCount: followData.followers.length, followingCount: followData.followings.length, mutualCount: followData.mutualFollows.length }), _jsx(FollowsTable, { userData: userData, followData: followData })] }))] }) }));
}
