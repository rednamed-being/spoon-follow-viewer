import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
export default function InputSection({ onLoadData, loading, initialValue = "", }) {
    const [userId, setUserId] = useState(initialValue);
    // initialValueが変化したらuserIdにも反映
    React.useEffect(() => {
        setUserId(initialValue);
    }, [initialValue]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const input = (userId ?? "").trim();
        if (!input)
            return;
        if (input.startsWith("@")) {
            try {
                const cleanId = input.replace(/^@/, "");
                const apiRes = await fetch(`https://jp-api.spooncast.net/profiles/${encodeURIComponent(cleanId)}/`);
                const apiJson = await apiRes.json();
                if (apiJson && apiJson.status_code === 200 && apiJson.results && apiJson.results.length > 0 && apiJson.results[0].user_id) {
                    onLoadData(apiJson.results[0].user_id.toString());
                    return;
                }
                else {
                    window.alert("ユーザーIDの取得に失敗しました。@IDが正しいかご確認ください。");
                    return;
                }
            }
            catch (err) {
                window.alert("Spooncast APIへのアクセスに失敗しました。");
                return;
            }
        }
        // 通常の数字IDはそのまま渡す
        onLoadData(input);
    };
    return (_jsx("div", { className: "bg-white rounded-2xl shadow-2xl p-8 mb-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col sm:flex-row gap-4 items-center", children: [_jsxs("div", { className: "flex-1 w-full", children: [_jsxs("label", { htmlFor: "userId", className: "block text-sm font-semibold text-gray-700 mb-2", children: ["\u30E6\u30FC\u30B6\u30FCID", " ", _jsx("span", { className: "text-xs text-gray-500", children: "\uFF08\u30D7\u30ED\u30D5\u30A3\u30FC\u30EBURL\u306E\u672B\u5C3E\u306E\u6570\u5B57\u3001\u307E\u305F\u306F@\u3067\u59CB\u307E\u308BID\u3067\u3082\u52D5\u4F5C\u3057\u307E\u3059\uFF09" }), ":"] }), _jsx("input", { type: "text", id: "userId", value: userId, onChange: (e) => setUserId(e.currentTarget.value), placeholder: "\u4F8B: 1234567890 / @xxx", className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors", disabled: loading })] }), _jsx("button", { type: "submit", disabled: loading || !(userId ?? "").trim(), className: "px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "\u8AAD\u307F\u8FBC\u307F\u4E2D..."] })) : ("データを読み込み") })] }) }));
}
