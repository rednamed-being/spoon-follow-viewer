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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = userId.trim();
    if (!input) return;
    // @で始まる場合はSpoon公式ページにアクセスしてリダイレクトURLからuserID抽出
    if (input.startsWith("@")) {
      try {
        const res = await fetch(`https://www.spooncast.net/jp/${input}`, { method: "GET", redirect: "follow" });
        // 最終リダイレクトURLからuserID抽出
        const finalUrl = res.url;
        const match = finalUrl.match(/\/channel\/(\d+)\/tab\/home/);
        if (match && match[1]) {
          onLoadData(match[1]);
          return;
        } else {
          alert("ユーザーIDの取得に失敗しました。@IDが正しいかご確認ください。");
          return;
        }
      } catch (err) {
        alert("Spoon公式ページへのアクセスに失敗しました。");
        return;
      }
    }
    // 通常の数字IDはそのまま渡す
    onLoadData(input);
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
            ユーザーID{" "}
            <span className="text-xs text-gray-500">
              （プロフィールURLの末尾の数字）
            </span>
            :
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
