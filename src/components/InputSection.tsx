import { useState } from "react";

interface InputSectionProps {
  onLoadData: (userId: string) => void;
  loading: boolean;
  initialValue?: string;
}

export default function InputSection({
    onLoadData,
    loading,
    initialValue = "",
  }: InputSectionProps) {
    const [userId, setUserId] = useState<string>(initialValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const input: string = (userId ?? "").trim();
    if (!input) return;
    if (input.startsWith("@")) {
      try {
        const cleanId = input.replace(/^@/, "");
  const apiRes = await fetch(`https://jp-api.spooncast.net/profiles/${encodeURIComponent(cleanId)}/`);
        const apiJson = await apiRes.json();
        if (apiJson && apiJson.status_code === 200 && apiJson.results && apiJson.results.length > 0 && apiJson.results[0].user_id) {
          onLoadData(String(apiJson.results[0].user_id));
          return;
        } else {
          (window as any).alert("ユーザーIDの取得に失敗しました。@IDが正しいかご確認ください。");
          return;
        }
      } catch (err) {
  (window as any).alert("Spooncast APIへのアクセスに失敗しました。");
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
              （プロフィールURLの末尾の数字、または@で始まるIDでも動作します）
            </span>
            :
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId((e.target as HTMLInputElement).value)}
            placeholder="例: 1234567890 / @xxx"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
            disabled={loading || !(userId ?? "").trim()}
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
