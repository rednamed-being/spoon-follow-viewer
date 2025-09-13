import { SpoonUser } from "@/types/spoon";

export default function UserDetail({ user }: { user: SpoonUser }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
      <img
        src={user.profile_url || "/default-avatar.png"}
        alt={user.nickname}
        className="w-24 h-24 rounded-full object-cover border"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xl font-bold text-gray-800 truncate max-w-xs" title={user.nickname}>{user.nickname}</span>
          <span className="text-xs text-gray-500 truncate max-w-[120px]" title={user.tag}>@{user.tag}</span>
          {user.is_verified && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">認証済</span>
          )}
          {user.is_vip && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">VIP</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-2 break-words whitespace-pre-line max-h-24 overflow-y-auto">{user.description || <span className="text-gray-400">(自己紹介なし)</span>}</div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span>フォロワー: <b className="text-red-500">{user.follower_count.toLocaleString()}</b></span>
          <span>フォロー: <b className="text-teal-500">{user.following_count.toLocaleString()}</b></span>
          <span>国: {user.country || "-"}</span>
          <span>登録日: {user.date_joined ? user.date_joined.slice(0, 10) : "-"}</span>
        </div>
      </div>
    </div>
  );
}
