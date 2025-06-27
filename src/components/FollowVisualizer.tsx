"use client";

import { useEffect, useRef } from "react";
import { UserData, FollowData, SpoonUser } from "@/types/spoon";

interface FollowVisualizerProps {
  userData: UserData;
  followData: FollowData;
}

export default function FollowVisualizer({
  userData,
  followData,
}: FollowVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      renderGraph();
    }
  }, [userData, followData]);

  const renderGraph = () => {
    const container = containerRef.current;
    if (!container) return;

    // 既存のコンテンツをクリア
    container.innerHTML = "";

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    const radius = Math.min(containerRect.width, containerRect.height) * 0.35;

    // 中心ユーザーを配置
    const centerUser = createCenterUserElement(userData);
    centerUser.style.left = `${centerX}px`;
    centerUser.style.top = `${centerY}px`;
    centerUser.style.transform = "translate(-50%, -50%)";
    container.appendChild(centerUser);

    // フォロワーを外側の円に配置
    followData.followers.forEach((user, index) => {
      const angle = (index / followData.followers.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const isMutual = followData.mutualFollows.some((m) => m.id === user.id);
      const userElement = createUserElement(
        user,
        isMutual ? "mutual" : "follower"
      );
      userElement.style.left = `${x}px`;
      userElement.style.top = `${y}px`;
      userElement.style.transform = "translate(-50%, -50%)";
      container.appendChild(userElement);

      // 接続線を描画
      const line = createConnectionLine(
        centerX,
        centerY,
        x,
        y,
        isMutual ? "mutual" : "follower"
      );
      container.appendChild(line);
    });

    // フォロー中を内側の円に配置
    const innerRadius = radius * 0.6;
    followData.followings.forEach((user, index) => {
      // 相互フォローの場合は既に配置済みなのでスキップ
      if (followData.mutualFollows.some((m) => m.id === user.id)) return;

      const angle = (index / followData.followings.length) * 2 * Math.PI;
      const x = centerX + innerRadius * Math.cos(angle);
      const y = centerY + innerRadius * Math.sin(angle);

      const userElement = createUserElement(user, "following");
      userElement.style.left = `${x}px`;
      userElement.style.top = `${y}px`;
      userElement.style.transform = "translate(-50%, -50%)";
      container.appendChild(userElement);

      // 接続線を描画
      const line = createConnectionLine(centerX, centerY, x, y, "following");
      container.appendChild(line);
    });
  };

  const createCenterUserElement = (user: UserData) => {
    const element = document.createElement("div");
    element.className = "absolute z-10 flex flex-col items-center gap-2";

    element.innerHTML = `
      <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg">
        <img src="${user.profile_url || getDefaultAvatar()}" 
             alt="${user.nickname}" 
             class="w-full h-full object-cover"
             onerror="this.src='${getDefaultAvatar()}'">
      </div>
      <div class="text-center">
        <div class="font-bold text-gray-800">${escapeHtml(user.nickname)}</div>
        <div class="text-sm text-gray-600">@${user.tag}</div>
      </div>
    `;

    return element;
  };

  const createUserElement = (
    user: SpoonUser,
    type: "follower" | "following" | "mutual"
  ) => {
    const element = document.createElement("div");
    element.className = `absolute z-20 cursor-pointer transition-transform hover:scale-110 flex flex-col items-center gap-1`;

    const borderColor =
      type === "mutual"
        ? "border-blue-500"
        : type === "follower"
        ? "border-red-500"
        : "border-teal-500";

    element.innerHTML = `
      <div class="w-12 h-12 rounded-full overflow-hidden border-3 ${borderColor} shadow-md">
        <img src="${user.profile_url || getDefaultAvatar()}" 
             alt="${user.nickname}" 
             class="w-full h-full object-cover"
             onerror="this.src='${getDefaultAvatar()}'">
      </div>
      <div class="text-center max-w-20">
        <div class="text-xs font-medium text-gray-800 truncate">${escapeHtml(
          user.nickname
        )}</div>
        <div class="text-xs text-gray-600">@${user.tag}</div>
      </div>
    `;

    // ツールチップ
    element.title = `${user.nickname} (@${user.tag})\nフォロワー数: ${user.follower_count}\nフォロー数: ${user.following_count}`;

    return element;
  };

  const createConnectionLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: string
  ) => {
    const line = document.createElement("div");
    line.className = `absolute z-0`;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    const color =
      type === "mutual"
        ? "bg-blue-400"
        : type === "follower"
        ? "bg-red-400"
        : "bg-teal-400";

    line.className += ` h-1 ${color} opacity-70`;
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "left center";

    return line;
  };

  const getDefaultAvatar = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=";
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex justify-center gap-8 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">フォロワー</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-teal-500"></div>
          <span className="text-sm text-gray-600">フォロー中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600">相互フォロー</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-96 md:h-[500px] border-2 border-dashed border-gray-200 rounded-xl overflow-hidden"
      >
        {/* グラフがここに動的に生成されます */}
      </div>
    </div>
  );
}
