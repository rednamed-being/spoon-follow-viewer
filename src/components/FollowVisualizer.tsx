"use client";

import { useEffect, useRef, useState } from "react";
import { UserData, FollowData, SpoonUser } from "@/types/spoon";

interface FollowVisualizerProps {
  userData: UserData;
  followData: FollowData;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: "center" | "follower" | "following" | "mutual";
  user: UserData | SpoonUser;
}

export default function FollowVisualizer({
  userData,
  followData,
}: FollowVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    nodeId: string | null;
    offset: { x: number; y: number };
  }>({ isDragging: false, nodeId: null, offset: { x: 0, y: 0 } });

  useEffect(() => {
    if (containerRef.current) {
      initializeNodes();
    }
  }, [userData, followData]);

  useEffect(() => {
    renderGraph();
  }, [nodes]);

  // グローバルマウスイベント
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.nodeId) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = e.clientX - rect.left - dragState.offset.x;
      const newY = e.clientY - rect.top - dragState.offset.y;

      // 境界チェック
      const margin = 50;
      const clampedX = Math.max(margin, Math.min(rect.width - margin, newX));
      const clampedY = Math.max(margin, Math.min(rect.height - margin, newY));

      // ノード位置を更新
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === dragState.nodeId
            ? { ...node, x: clampedX, y: clampedY }
            : node
        )
      );
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          nodeId: null,
          offset: { x: 0, y: 0 },
        });
        console.log("ドラッグ終了"); // デバッグ用
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState]);

  const initializeNodes = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // より美しい円形配置のための計算
    const maxRadius =
      Math.min(containerRect.width, containerRect.height) / 2 - 80; // マージンを考慮
    const outerRadius = maxRadius * 0.85; // 外側の円（フォロワー・相互フォロー）
    const innerRadius = maxRadius * 0.45; // 内側の円（フォロー中）

    const newNodes: NodePosition[] = [];

    // 中心ユーザー
    newNodes.push({
      id: `center-${userData.id}`,
      x: centerX,
      y: centerY,
      type: "center",
      user: userData,
    });

    // 相互フォローとフォロワーを外側の円に配置
    const outerCircleUsers = [...followData.followers];

    // 相互フォローを均等に分散させるため、角度をオフセット
    const mutualCount = followData.mutualFollows.length;
    const totalOuterCount = outerCircleUsers.length;

    outerCircleUsers.forEach((user, index) => {
      // より均等な分散のために角度を調整
      const baseAngle = (index / totalOuterCount) * 2 * Math.PI;
      // 少し回転させて美しく見せる
      const angle = baseAngle - Math.PI / 2; // 上から開始

      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);

      const isMutual = followData.mutualFollows.some((m) => m.id === user.id);
      newNodes.push({
        id: `follower-${user.id}`,
        x,
        y,
        type: isMutual ? "mutual" : "follower",
        user,
      });
    });

    // フォロー中を内側の円に配置（相互フォローは除く）
    const nonMutualFollowings = followData.followings.filter(
      (following) =>
        !followData.mutualFollows.some((m) => m.id === following.id)
    );

    nonMutualFollowings.forEach((user, index) => {
      // 内側の円も上から開始し、外側とずらして配置
      const baseAngle = (index / nonMutualFollowings.length) * 2 * Math.PI;
      const angle =
        baseAngle - Math.PI / 2 + Math.PI / nonMutualFollowings.length; // 少しオフセット

      const x = centerX + innerRadius * Math.cos(angle);
      const y = centerY + innerRadius * Math.sin(angle);

      newNodes.push({
        id: `following-${user.id}`,
        x,
        y,
        type: "following",
        user,
      });
    });

    setNodes(newNodes);
  };

  const renderGraph = () => {
    const container = containerRef.current;
    if (!container) return;

    // 既存のコンテンツをクリア
    container.innerHTML = "";

    // 接続線を先に描画（背景レイヤー）
    const centerNode = nodes.find((n) => n.type === "center");
    if (centerNode) {
      nodes.forEach((node) => {
        if (node.type !== "center") {
          const line = createConnectionLine(
            centerNode.x,
            centerNode.y,
            node.x,
            node.y,
            node.type
          );
          container.appendChild(line);
        }
      });
    }

    // ノードを描画
    nodes.forEach((node) => {
      const element =
        node.type === "center"
          ? createCenterUserElement(node.user as UserData, node.id)
          : createUserElement(node.user as SpoonUser, node.type, node.id);

      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      element.style.transform = "translate(-50%, -50%)";

      // ドラッグイベントを追加
      addDragEvents(element, node.id);

      container.appendChild(element);
    });
  };

  const addDragEvents = (element: HTMLElement, nodeId: string) => {
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setDragState({
        isDragging: true,
        nodeId,
        offset: {
          x: startX - node.x,
          y: startY - node.y,
        },
      });

      element.style.cursor = "grabbing";
      element.style.zIndex = "100";

      console.log(`ドラッグ開始: ${nodeId}`); // デバッグ用
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.style.cursor = "grab";
  };

  const createCenterUserElement = (user: UserData, nodeId: string) => {
    const element = document.createElement("div");
    element.className =
      "absolute z-10 flex flex-col items-center gap-2 cursor-grab hover:scale-105 transition-transform";
    element.id = nodeId;

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
    type: "follower" | "following" | "mutual",
    nodeId: string
  ) => {
    const element = document.createElement("div");
    element.className = `absolute z-20 cursor-grab hover:scale-110 transition-transform flex flex-col items-center gap-1`;
    element.id = nodeId;

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
    element.title = `${user.nickname} (@${user.tag})\nフォロワー数: ${user.follower_count}\nフォロー数: ${user.following_count}\n\n💡 ドラッグして移動できます！`;

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

    // アイコンの中心からの距離を計算（中心ユーザーは20px、他は12pxの半径）
    const centerRadius = 40; // 中心ユーザーアイコンの半径（20px * 2）
    const nodeRadius = 24; // 他のアイコンの半径（12px * 2）

    // 角度を計算
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 線の開始点と終了点をアイコンの縁に調整
    const startX = x1 + Math.cos(angle) * (centerRadius / 2);
    const startY = y1 + Math.sin(angle) * (centerRadius / 2);
    const endX = x2 - Math.cos(angle) * (nodeRadius / 2);
    const endY = y2 - Math.sin(angle) * (nodeRadius / 2);

    const length = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const angleDeg = (angle * 180) / Math.PI;

    const color =
      type === "mutual"
        ? "bg-blue-400"
        : type === "follower"
        ? "bg-red-400"
        : "bg-teal-400";

    line.className += ` h-1 ${color} opacity-70 transition-all duration-200`;
    line.style.width = `${length}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${angleDeg}deg)`;
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            💡 アイコンをドラッグして移動できます
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[500px] md:h-[700px] border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white"
        style={{
          userSelect: "none",
          aspectRatio: "1/1",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* グラフがここに動的に生成されます */}
      </div>
    </div>
  );
}
