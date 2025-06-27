import { NextRequest, NextResponse } from "next/server";

// モックデータ（テスト用）
const mockFollowingsData = {
  status_code: 200,
  detail: "Success",
  next: "",
  previous: "",
  results: [
    {
      id: 316165978,
      nickname: "ふみや𓏲𓎨⏦ﾟ",
      tag: "mr.forte",
      top_impressions: [],
      description: "",
      profile_url:
        "http://jp-cdn.spooncast.net/profiles/n/XLKwenMcB63jQ5/8538146d-95a1-488f-8132-4ec931da16ef.jpg",
      gender: 0,
      follow_status: 0,
      follower_count: 6,
      following_count: 8,
      is_active: true,
      is_staff: false,
      is_vip: false,
      date_joined: "2024-01-30T13:11:25.659291Z",
      current_live: null,
      country: "jp",
      is_verified: false,
    },
    {
      id: 315942224,
      nickname: "猫と僕‎𖤐·̩͙",
      tag: "nekotoboku",
      top_impressions: [],
      description: "",
      profile_url:
        "http://jp-cdn.spooncast.net/profiles/p/reRmzp4TvJQBPm/cc0b35bc-ec4c-43be-8526-b91307576c8e.jpg",
      gender: 0,
      follow_status: 0,
      follower_count: 2,
      following_count: 7,
      is_active: true,
      is_staff: false,
      is_vip: false,
      date_joined: "2023-09-30T16:04:09.213454Z",
      current_live: null,
      country: "jp",
      is_verified: false,
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // URLパラメータでモックモードを制御
    const url = new URL(request.url);
    const useMock = url.searchParams.get("mock") === "true";

    if (useMock) {
      console.log(`[MOCK] フォロー情報を取得中: ユーザーID ${userId}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(mockFollowingsData);
    }

    console.log(`[REAL API] フォロー情報を取得開始: ユーザーID ${userId}`);

    // 実際のAPI呼び出し - 複数の戦略を試す
    const strategies = [
      // 戦略1: 基本的なリクエスト
      {
        name: "Basic Request",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
        },
      },
      // 戦略2: Spoonアプリを模倣
      {
        name: "Spoon App Simulation",
        headers: {
          "User-Agent": "SpoonCast/4.0.0 (iPhone; iOS 15.0; Scale/3.00)",
          Accept: "application/json",
          "Accept-Language": "ja-JP",
        },
      },
      // 戦略3: ブラウザを詳細に模倣
      {
        name: "Browser Simulation",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          Referer: "https://www.spooncast.net/",
          Origin: "https://www.spooncast.net",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
        },
      },
    ];

    for (const strategy of strategies) {
      try {
        console.log(`[REAL API] 試行中: ${strategy.name}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

        const response = await fetch(
          `https://jp-api.spooncast.net/users/${userId}/followings/`,
          {
            method: "GET",
            headers: strategy.headers,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        console.log(
          `[REAL API] レスポンス状態: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          console.log(`[REAL API] エラーレスポンス: ${response.status}`);
          continue; // 次の戦略を試す
        }

        const data = await response.json();
        console.log(`[REAL API] 成功: ${strategy.name} - データ取得完了`);
        return NextResponse.json(data);
      } catch (error: any) {
        console.log(`[REAL API] ${strategy.name} 失敗:`, error.message);
        if (error.name === "AbortError") {
          console.log(`[REAL API] ${strategy.name} タイムアウト`);
        }
        // 次の戦略を試す
        continue;
      }
    }

    // すべての戦略が失敗した場合
    console.log("[REAL API] すべての戦略が失敗 - モックデータを返します");
    return NextResponse.json({
      ...mockFollowingsData,
      _note: "API接続に失敗したため、モックデータを返しています",
    });
  } catch (error) {
    console.error("[ERROR] フォロー取得エラー:", error);
    return NextResponse.json(
      {
        error: "フォロー情報の取得に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
