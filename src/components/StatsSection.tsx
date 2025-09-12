interface StatsSectionProps {
  followerCount: number;
  followingCount: number;
  mutualCount: number;
}

export default function StatsSection({
  followerCount,
  followingCount,
  mutualCount,
}: StatsSectionProps) {
  return (
    <div className="flex flex-row justify-center gap-4 mb-8 overflow-x-auto">
      <div className="min-w-[140px] max-w-[180px] bg-white rounded-2xl shadow-xl p-4 text-center flex-shrink-0 hover:transform hover:-translate-y-2 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          フォロワー数
        </h3>
        <span className="text-4xl font-bold text-red-500">
          {followerCount.toLocaleString()}
        </span>
      </div>

  <div className="min-w-[140px] max-w-[180px] bg-white rounded-2xl shadow-xl p-4 text-center flex-shrink-0 hover:transform hover:-translate-y-2 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          フォロー数
        </h3>
        <span className="text-4xl font-bold text-teal-500">
          {followingCount.toLocaleString()}
        </span>
      </div>

  <div className="min-w-[140px] max-w-[180px] bg-white rounded-2xl shadow-xl p-4 text-center flex-shrink-0 hover:transform hover:-translate-y-2 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          相互フォロー
        </h3>
        <span className="text-4xl font-bold text-blue-500">
          {mutualCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
