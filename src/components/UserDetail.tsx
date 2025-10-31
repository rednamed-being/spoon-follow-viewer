import React, { useState } from "react";
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
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showFanNotice, setShowFanNotice] = useState(false);
  
  // channelInfoの内容をデバッグ表示
  // eslint-disable-next-line no-console
  console.log("[UserDetail] channelInfo", channelInfo);
  const liveUrl = channelInfo?.currentLiveId
    ? `https://www.spooncast.net/jp/live/${channelInfo.currentLiveId}`
    : null;
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
      <a
        href={`https://www.spooncast.net/jp/channel/${user.id}/tab/home`}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        title="チャンネルページを開く"
      >
        <img
          src={user.profile_url || "/default-avatar.png"}
          alt={user.nickname}
          className="w-24 h-24 rounded-full object-cover border cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        />
      </a>
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
        
        {/* channelInfoから追加の説明文 - Collapse対応 */}
        {channelInfo?.fullChannelData?.description && channelInfo.fullChannelData.description !== user.description && (
          <div className="mb-2">
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              <span>{showAdditionalInfo ? '📄' : '📢'}</span>
              <span>追加情報</span>
              <span className="text-xs">
                {showAdditionalInfo ? '▼' : '▶'}
              </span>
            </button>
            {showAdditionalInfo && (
              <div className="mt-2 text-sm text-blue-600 break-words whitespace-pre-line max-h-32 overflow-y-auto bg-blue-50 p-3 rounded border-l-4 border-blue-300">
                {channelInfo.fullChannelData.description}
              </div>
            )}
          </div>
        )}
        
        {/* ファン通知 - Collapse対応 */}
        {channelInfo?.fullChannelData?.fanNotice && (
          <div className="mb-3">
            <button
              onClick={() => setShowFanNotice(!showFanNotice)}
              className="flex items-center gap-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 transition-colors"
            >
              <span>{showFanNotice ? '📢' : '📣'}</span>
              <span>ファン通知</span>
              <span className="text-xs">
                {showFanNotice ? '▼' : '▶'}
              </span>
            </button>
            {showFanNotice && (
              <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-yellow-700">{channelInfo.fullChannelData.fanNotice}</p>
              </div>
            )}
          </div>
        )}

        {/* その他の追加説明 */}
        {channelInfo?.fullChannelData?.additionalDescription && (
          <div className="text-sm text-gray-600 italic mb-3 p-2 bg-gray-50 rounded">
            {channelInfo.fullChannelData.additionalDescription}
          </div>
        )}

        {/* ソーシャルリンク */}
        {channelInfo?.fullChannelData?.socialLinks && channelInfo.fullChannelData.socialLinks.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">🔗 ソーシャルリンク</h4>
            <div className="flex flex-wrap gap-2">
              {channelInfo.fullChannelData.socialLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1 text-xs rounded-full text-white ${
                    link.platform === 'twitter' ? 'bg-blue-400' :
                    link.platform === 'instagram' ? 'bg-pink-400' :
                    link.platform === 'tiktok' ? 'bg-black' :
                    'bg-gray-400'
                  }`}
                >
                  {link.platform === 'twitter' && '🐦'}
                  {link.platform === 'instagram' && '📷'}
                  {link.platform === 'tiktok' && '🎵'}
                  {link.platform || 'Link'}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* トップファン */}
        {channelInfo?.fullChannelData?.topFans && channelInfo.fullChannelData.topFans.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">👑 トップファン</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {channelInfo.fullChannelData.topFans.slice(0, 6).map((fan: any, index: number) => (
                <div key={fan.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <img
                    src={fan.profileUrl || "/favicon.svg"}
                    alt={fan.nickname}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{fan.nickname}</p>
                    <p className="text-xs text-gray-500">🥄 {fan.spoonCount?.toLocaleString() || 0}</p>
                  </div>
                  {index < 3 && (
                    <span className="text-xs">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 配信スケジュール */}
        {channelInfo?.fullChannelData?.schedules && channelInfo.fullChannelData.schedules.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📅 配信スケジュール</h4>
            <div className="space-y-2">
              {channelInfo.fullChannelData.schedules.slice(0, 3).map((schedule: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                  <div className="text-blue-600">📺</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(schedule.date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近の投稿 */}
        {channelInfo?.fullChannelData?.recentPosts && channelInfo.fullChannelData.recentPosts.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">� 最近の投稿</h4>
            <div className="space-y-2">
              {channelInfo.fullChannelData.recentPosts.slice(0, 2).map((post: any, index: number) => (
                <div key={post.id} className="p-3 bg-gray-50 rounded">
                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt="投稿画像"
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <p className="text-sm text-gray-800 mb-1">{post.content}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>❤️ {post.likeCount?.toLocaleString() || 0}</span>
                    <span>💬 {post.commentCount?.toLocaleString() || 0}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
          <span>
            フォロワー:{" "}
            <b className="text-red-500">
              {channelInfo?.fullChannelData?.followerCount?.toLocaleString() || user.follower_count.toLocaleString()}
            </b>
          </span>
          <span>
            フォロー:{" "}
            <b className="text-teal-500">
              {channelInfo?.fullChannelData?.followingCount?.toLocaleString() || user.following_count.toLocaleString()}
            </b>
          </span>
          <span>
            ライブ状態:{" "}
            {channelInfo?.currentLiveId ? (
              <a
                href={`https://www.spooncast.net/jp/live/@${user.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline cursor-pointer font-bold inline-flex items-center"
                title="ライブを見る"
              >
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                ライブ中
              </a>
            ) : (
              <b 
                className="text-gray-400 inline-flex items-center"
                title="オフライン"
              >
                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                オフライン
              </b>
            )}
          </span>
          {channelInfo?.fullChannelData?.subscriberCount && channelInfo.fullChannelData.subscriberCount > 0 && (
            <span>
              サブスク:{" "}
              <b className="text-purple-500">
                {channelInfo.fullChannelData.subscriberCount.toLocaleString()}
              </b>
            </span>
          )}
          <span>
            登録日: {(() => {
              console.log('[DEBUG] user.date_joined:', user.date_joined);
              if (!user.date_joined) return "-";
              try {
                const formattedDate = new Date(user.date_joined).toLocaleDateString('ja-JP', {
                  timeZone: 'Asia/Tokyo',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                console.log('[DEBUG] formatted date:', formattedDate);
                return formattedDate;
              } catch (error) {
                console.error('[DEBUG] date formatting error:', error);
                return user.date_joined.slice(0, 10);
              }
            })()}
          </span>
        </div>

        {/* メンバーシップ・ティア情報 */}
        {(channelInfo?.fullChannelData?.membership || channelInfo?.fullChannelData?.tier) && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {channelInfo.fullChannelData.membership?.grade && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  channelInfo.fullChannelData.membership.grade === 'PREMIUM' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  💎 {channelInfo.fullChannelData.membership.grade}
                </span>
              )}
              {channelInfo.fullChannelData.tier && (
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                  🏆 {channelInfo.fullChannelData.tier.title}
                </span>
              )}
              {channelInfo.fullChannelData.hasVoiceInfo && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  🎤 ボイス登録済み
                </span>
              )}
              {channelInfo.fullChannelData.referralCode && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  🔗 {channelInfo.fullChannelData.referralCode}
                </span>
              )}
            </div>
          </div>
        )}
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
