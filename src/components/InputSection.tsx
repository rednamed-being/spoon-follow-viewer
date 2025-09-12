import { useState } from "react";

interface InputSectionProps {
  onLoadData: (userId: string) => void;
  loading: boolean;
}

export default function InputSection({
  onLoadData,
  loading,
}: InputSectionProps) {
  const [userId, setUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onLoadData(userId.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="flex-1 w-full">
          <label
            htmlFor="userId"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            ユーザーID <span className="text-xs text-gray-500">（プロフィールURLの末尾の数字）</span>:
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="例: 1234567890"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !userId.trim()}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              読み込み中...
            </div>
          ) : (
            "データを読み込み"
          )}
        </button>
      </form>
    </div>
  );
}
