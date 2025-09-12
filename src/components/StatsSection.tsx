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
    <div className="bg-white rounded-2xl shadow-xl p-4 mb-8 flex justify-center">
      <div className="flex flex-row gap-4 w-full max-w-xs justify-center">
        <div className="flex flex-col items-center flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 whitespace-nowrap">
            フォロワー数
          </h3>
          <span className="text-2xl font-bold text-red-500">
            {followerCount.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 whitespace-nowrap">
            フォロー数
          </h3>
          <span className="text-2xl font-bold text-teal-500">
            {followingCount.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 whitespace-nowrap">
            相互フォロー
          </h3>
          <span className="text-2xl font-bold text-blue-500">
            {mutualCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
