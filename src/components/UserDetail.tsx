import { SpoonUser } from "@/types/spoon";

type ChannelInfo = {
  currentLiveId: number | null;
  recentLive: { created: string; title: string; imgUrl?: string } | null;
  nextSchedule?: { scheduleDate: string; title: string } | null;
  allSchedules?: any[] | null;
  // 新しく追加する情報
  socialLinks?: any[] | null;
  topFans?: any[] | null;
  popularCasts?: any[] | null;
  recentPosts?: any[] | null;
  analysis?: any | null;
  fullChannelData?: any | null; // 生データ保持用
};

export default function UserDetail({
  user,
  channelInfo,
}: {
  user: SpoonUser;
  channelInfo?: ChannelInfo | null;
}) {
  // channelInfoの内容をデバッグ表示
  // eslint-disable-next-line no-console
  console.log("[UserDetail] channelInfo", channelInfo);
  const liveUrl = channelInfo?.currentLiveId
    ? `https://www.spooncast.net/jp/live/${channelInfo.currentLiveId}`
    : null;
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
      <img
        src={user.profile_url || "/default-avatar.png"}
        alt={user.nickname}
        className="w-24 h-24 rounded-full object-cover border"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className="text-xl font-bold text-gray-800 truncate max-w-xs"
            title={user.nickname}
          >
            {user.nickname}
          </span>
          <span
            className="text-xs text-gray-500 truncate max-w-[120px]"
            title={user.tag}
          >
            @{user.tag}
          </span>
          {user.is_verified && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              認証済
            </span>
          )}
          {user.is_vip && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              VIP
            </span>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse"
            >
              <span>LIVE中</span>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <circle cx="8" cy="8" r="6" />
              </svg>
            </a>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-2 break-words whitespace-pre-line max-h-24 overflow-y-auto">
          {user.description || (
            <span className="text-gray-400">(自己紹介なし)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
          <span>
            フォロワー:{" "}
            <b className="text-red-500">
              {user.follower_count.toLocaleString()}
            </b>
          </span>
          <span>
            フォロー:{" "}
            <b className="text-teal-500">
              {user.following_count.toLocaleString()}
            </b>
          </span>
          <span>国: {user.country || "-"}</span>
          <span>
            登録日: {user.date_joined ? user.date_joined.slice(0, 10) : "-"}
          </span>
        </div>
        {/* LIVE情報 */}
        {channelInfo?.recentLive && (
          <div className="flex items-center gap-3 mb-1">
            {channelInfo.recentLive.imgUrl && (
              <img
                src={channelInfo.recentLive.imgUrl}
                alt="LIVEサムネ"
                className="w-14 h-14 object-cover rounded-lg border"
              />
            )}
            <div>
              <div className="text-xs text-gray-500">
                最終LIVE:{" "}
                {new Date(channelInfo.recentLive.created).toLocaleString()}
              </div>
              <div
                className="text-sm font-semibold text-gray-700 truncate max-w-[200px]"
                title={channelInfo.recentLive.title}
              >
                {channelInfo.recentLive.title}
              </div>
            </div>
          </div>
        )}
        {/* ソーシャルリンク */}
        {channelInfo?.socialLinks && channelInfo.socialLinks.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-bold text-purple-700 mb-2">🔗 ソーシャルリンク:</div>
            <div className="flex flex-wrap gap-2">
              {channelInfo.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-full transition-colors"
                >
                  {link.type || 'リンク'} {link.title && `- ${link.title}`}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* トップファン */}
        {channelInfo?.topFans && channelInfo.topFans.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-bold text-pink-700 mb-2">👑 トップファン:</div>
            <div className="flex flex-wrap gap-2">
              {channelInfo.topFans.slice(0, 5).map((fan, i) => (
                <div key={i} className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-lg">
                  <img 
                    src={fan.profileUrl || '/default-avatar.png'} 
                    alt={fan.nickname}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-pink-700">{fan.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 人気キャスト */}
        {channelInfo?.popularCasts && channelInfo.popularCasts.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-bold text-orange-700 mb-2">🔥 人気キャスト:</div>
            <div className="space-y-2">
              {channelInfo.popularCasts.slice(0, 3).map((cast, i) => (
                <div key={i} className="flex items-center gap-3 bg-orange-50 p-2 rounded-lg">
                  {cast.imgUrl && (
                    <img 
                      src={cast.imgUrl} 
                      alt={cast.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-orange-800 truncate">{cast.title}</div>
                    {cast.created && (
                      <div className="text-xs text-orange-600">
                        {new Date(cast.created).toLocaleString()}
                      </div>
                    )}
                    {cast.likeCount && (
                      <div className="text-xs text-orange-600">👍 {cast.likeCount}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近の投稿 */}
        {channelInfo?.recentPosts && channelInfo.recentPosts.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-bold text-green-700 mb-2">📝 最近の投稿:</div>
            <div className="space-y-2">
              {channelInfo.recentPosts.slice(0, 3).map((post, i) => (
                <div key={i} className="bg-green-50 p-2 rounded-lg">
                  <div className="text-xs text-green-800 line-clamp-2">{post.content || post.text}</div>
                  {post.created && (
                    <div className="text-xs text-green-600 mt-1">
                      {new Date(post.created).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 取得した全schedulesを表示 */}
        {channelInfo?.allSchedules && channelInfo.allSchedules.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-bold text-blue-700 mb-1">
              配信予定一覧:
            </div>
            <ul className="text-xs text-blue-600 space-y-1">
              {channelInfo.allSchedules.map((s, i) => (
                <li key={i}>
                  {new Date(s.scheduleDate).toLocaleString()} ({s.title})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
