import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState } from "react";
const tabLabels = {
  mutual: "相互フォロー",
  followers: "フォロワー",
  followings: "フォロー中",
};
const FollowsTable = ({ userData, followData }) => {
  const [activeTab, setActiveTab] = useState("mutual");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("nickname");
  const [sortDir, setSortDir] = useState("asc");
  const dataMap = useMemo(
    () => ({
      mutual: followData.mutualFollows,
      followers: followData.followers,
      followings: followData.followings,
    }),
    [followData]
  );
  const filtered = useMemo(() => {
    const list = dataMap[activeTab] || [];
    const lower = query.toLowerCase();
    const filteredList = lower
      ? list.filter(
          (u) =>
            (u.nickname || "").toLowerCase().includes(lower) ||
            (u.tag || "").toLowerCase().includes(lower)
        )
      : list;
    const sorted = [...filteredList].sort((a, b) => {
      let av;
      let bv;
      if (sortKey === "nickname") {
        av = a.nickname?.toLowerCase();
        bv = b.nickname?.toLowerCase();
      } else if (sortKey === "follower_count") {
        av = a.follower_count;
        bv = b.follower_count;
      } else {
        av = a.following_count;
        bv = b.following_count;
      }
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [dataMap, activeTab, query, sortKey, sortDir]);
  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  return _jsxs("div", {
    className: "bg-white rounded-2xl shadow-2xl p-6",
    children: [
      _jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center gap-4 mb-4",
        children: [
          _jsx("div", {
            className: "flex gap-2 flex-wrap",
            children: Object.keys(tabLabels).map((tab) =>
              _jsxs(
                "button",
                {
                  onClick: () => setActiveTab(tab),
                  className: `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-purple-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`,
                  children: [
                    tabLabels[tab],
                    " ",
                    _jsx("span", {
                      className: "ml-1 text-xs opacity-80",
                      children: dataMap[tab].length,
                    }),
                  ],
                },
                tab
              )
            ),
          }),
          _jsx("div", { className: "flex-1" }),
          _jsxs("div", {
            className: "relative max-w-xs w-full",
            children: [
              _jsx("input", {
                value: query,
                onChange: (e) => setQuery(e.target.value),
                className:
                  "w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                placeholder: "\u691C\u7D22 (\u540D\u524D / @tag)",
              }),
              _jsx("span", {
                className:
                  "absolute left-2 top-1/2 -translate-y-1/2 text-gray-400",
                children: "\uD83D\uDD0D",
              }),
            ],
          }),
        ],
      }),
      _jsx("div", {
        className: "overflow-auto border rounded-xl",
        children: _jsxs("table", {
          className: "min-w-full text-sm",
          children: [
            _jsx("thead", {
              className: "bg-gray-50",
              children: _jsxs("tr", {
                children: [
                  _jsx(Th, { children: "\u30A2\u30A4\u30B3\u30F3" }),
                  _jsx(SortableTh, {
                    active: sortKey === "nickname",
                    dir: sortDir,
                    onClick: () => handleSort("nickname"),
                    children: "\u30E6\u30FC\u30B6\u30FC",
                  }),
                  _jsx(SortableTh, {
                    active: sortKey === "follower_count",
                    dir: sortDir,
                    onClick: () => handleSort("follower_count"),
                    children: "\u30D5\u30A9\u30ED\u30EF\u30FC\u6570",
                  }),
                  _jsx(SortableTh, {
                    active: sortKey === "following_count",
                    dir: sortDir,
                    onClick: () => handleSort("following_count"),
                    children: "\u30D5\u30A9\u30ED\u30FC\u6570",
                  }),
                  _jsx(Th, { children: "\u7A2E\u5225" }),
                ],
              }),
            }),
            _jsxs("tbody", {
              children: [
                filtered.length === 0 &&
                  _jsx("tr", {
                    children: _jsx("td", {
                      colSpan: 5,
                      className: "text-center py-10 text-gray-500",
                      children:
                        "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093",
                    }),
                  }),
                filtered.map((u) =>
                  _jsxs(
                    "tr",
                    {
                      className: "border-t hover:bg-purple-50/50",
                      children: [
                        _jsx("td", {
                          className: "p-2",
                          children: _jsx("img", {
                            src: u.profile_url || getDefaultAvatar(),
                            onError: (e) => {
                              e.target.src = getDefaultAvatar();
                            },
                            alt: u.nickname,
                            className:
                              "w-10 h-10 rounded-full object-cover border",
                          }),
                        }),
                        _jsxs("td", {
                          className: "p-2",
                          children: [
                            _jsx("div", {
                              className:
                                "font-medium text-gray-800 truncate max-w-[180px]",
                              title: u.nickname,
                              children: u.nickname,
                            }),
                            _jsxs("div", {
                              className: "text-xs text-gray-500",
                              children: ["@", u.tag],
                            }),
                          ],
                        }),
                        _jsx("td", {
                          className: "p-2 text-right tabular-nums",
                          children: u.follower_count?.toLocaleString?.(),
                        }),
                        _jsx("td", {
                          className: "p-2 text-right tabular-nums",
                          children: u.following_count?.toLocaleString?.(),
                        }),
                        _jsx("td", {
                          className: "p-2 text-xs",
                          children: followData.mutualFollows.some(
                            (m) => m.id === u.id
                          )
                            ? _jsx(Badge, {
                                color: "blue",
                                children: "\u76F8\u4E92",
                              })
                            : followData.followers.some((f) => f.id === u.id) &&
                              followData.followings.some((f) => f.id === u.id)
                            ? _jsx(Badge, {
                                color: "blue",
                                children: "\u76F8\u4E92",
                              })
                            : activeTab === "followers"
                            ? _jsx(Badge, {
                                color: "red",
                                children: "\u30D5\u30A9\u30ED\u30EF\u30FC",
                              })
                            : activeTab === "followings"
                            ? _jsx(Badge, {
                                color: "teal",
                                children: "\u30D5\u30A9\u30ED\u30FC\u4E2D",
                              })
                            : _jsx(Badge, { color: "gray", children: "-" }),
                        }),
                      ],
                    },
                    u.id
                  )
                ),
              ],
            }),
          ],
        }),
      }),
      _jsxs("div", {
        className: "text-xs text-gray-500 mt-3 flex flex-wrap gap-4",
        children: [
          _jsxs("div", {
            children: ["\u8868\u793A\u4EF6\u6570: ", filtered.length],
          }),
          _jsxs("div", {
            children: [
              "\u7DCF\u30D5\u30A9\u30ED\u30EF\u30FC: ",
              followData.followers.length,
            ],
          }),
          _jsxs("div", {
            children: [
              "\u7DCF\u30D5\u30A9\u30ED\u30FC: ",
              followData.followings.length,
            ],
          }),
          _jsxs("div", {
            children: ["\u76F8\u4E92: ", followData.mutualFollows.length],
          }),
        ],
      }),
    ],
  });
};
const Th = ({ children }) =>
  _jsx("th", {
    className:
      "px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase select-none",
    children: children,
  });
const SortableTh = ({ children, active, dir, onClick }) =>
  _jsx("th", {
    onClick: onClick,
    className: `px-3 py-2 text-left text-[11px] font-semibold tracking-wider uppercase cursor-pointer select-none group ${
      active ? "text-purple-600" : "text-gray-500 hover:text-gray-700"
    }`,
    children: _jsxs("span", {
      className: "inline-flex items-center gap-1",
      children: [
        children,
        _jsx("span", {
          className: "text-[9px] opacity-70 group-hover:opacity-100",
          children: active ? (dir === "asc" ? "▲" : "▼") : "⇅",
        }),
      ],
    }),
  });
const Badge = ({ children, color = "gray" }) => {
  const colorMap = {
    red: "bg-red-100 text-red-600 border-red-200",
    teal: "bg-teal-100 text-teal-600 border-teal-200",
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return _jsx("span", {
    className: `border text-[10px] font-semibold px-2 py-1 rounded-full ${colorMap[color]}`,
    children: children,
  });
};
function getDefaultAvatar() {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMWUxZTEiLz48cGF0aCBkPSJNMjAgMThjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjYmZiZmJmIi8+PC9zdmc+";
}
export default React.memo(FollowsTable);
