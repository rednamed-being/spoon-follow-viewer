import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    console.log(`[REAL API] ユーザー情報を取得開始: ユーザーID ${userId}`);

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
          `https://jp-api.spooncast.net/users/${userId}/`,
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
        console.log(`[REAL API] 成功: ${strategy.name} - ユーザー情報取得完了`);
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
    console.log("[REAL API] すべての戦略が失敗 - エラーを返します");
    return NextResponse.json(
      { error: "ユーザー情報の取得に失敗しました" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[ERROR] ユーザー情報取得エラー:", error);
    return NextResponse.json(
      {
        error: "ユーザー情報の取得に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
