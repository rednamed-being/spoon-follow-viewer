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
    <div className="flex flex-col sm:flex-row gap-6 mb-8">
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          フォロワー数
        </h3>
        <span className="text-4xl font-bold text-red-500">
          {followerCount.toLocaleString()}
        </span>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          フォロー数
        </h3>
        <span className="text-4xl font-bold text-teal-500">
          {followingCount.toLocaleString()}
        </span>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 text-center hover:transform hover:-translate-y-2 transition-transform duration-300">
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
