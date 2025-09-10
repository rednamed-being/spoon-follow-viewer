import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function InputSection({ onLoadData, loading, }) {
    const [userId, setUserId] = useState("316704114");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (userId.trim()) {
            onLoadData(userId.trim());
        }
    };
    return (_jsx("div", { className: "bg-white rounded-2xl shadow-2xl p-8 mb-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col sm:flex-row gap-4 items-center", children: [_jsxs("div", { className: "flex-1 w-full", children: [_jsx("label", { htmlFor: "userId", className: "block text-sm font-semibold text-gray-700 mb-2", children: "\u30E6\u30FC\u30B6\u30FCID:" }), _jsx("input", { type: "text", id: "userId", value: userId, onChange: (e) => setUserId(e.target.value), placeholder: "\u4F8B: 316704114", className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors", disabled: loading })] }), _jsx("button", { type: "submit", disabled: loading || !userId.trim(), className: "px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "\u8AAD\u307F\u8FBC\u307F\u4E2D..."] })) : ("データを読み込み") })] }) }));
}
