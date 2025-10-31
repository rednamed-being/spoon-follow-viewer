// Vite環境用: import.meta.env型定義
interface ImportMeta {
  readonly env: {
    DEV: boolean;
    [key: string]: any;
  };
}

import type { SpoonApiResponse } from "@/types/spoon";
// Spoon API をクライアントサイドのみで叩くための単純なクライアント
// GitHub Pages ではサーバーサイドコードが使えないため、必要に応じて CORS 対応のプロキシを利用する

import type { SpoonUser } from "@/types/spoon";
interface UserInfoResponse {
  status_code: number;
  detail: string;
  results: Array<{ user_id: number }>; // 実際のレスポンス形式に合わせて修正
}

interface ChannelInfoResponse {
  result?: {
    channel?: any; // 実際のデータ構造が不明なので一旦anyに
  };
  [key: string]: any; // その他のプロパティも許可
}

interface FetchResult {
  userInfo: UserInfoResponse | null;
  channelInfo: ChannelInfoResponse | null;
  userDirectInfo: any | null; // jp-api.spooncast.net/users/{id}/ のレスポンス
  followersData: SpoonApiResponse;
  followingsData: SpoonApiResponse;
}

const defaultHeaders: Record<string, string> = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json, text/plain, */*",
};

async function fetchJson(url: string, controller: AbortController) {
  const res = await fetch(url, {
    headers: defaultHeaders,
    signal: controller.signal,
  });
  if (!res.ok) throw new Error(`リクエスト失敗 (${res.status}) - ${url}`);
  return res.json();
}

/**
 * Fetches paginated Spoon API results, aggregating all pages up to maxPages.
 *
 * @param firstUrl - The initial API endpoint to fetch.
 * @param proxyBase - Optional CORS proxy base URL. If provided, all requests are routed through this proxy.
 * @param controller - AbortController for request cancellation and timeout.
 * @param maxPages - Maximum number of pages to fetch. If the API has more pages, results are truncated and a `_truncated` flag is set.
 * @returns Aggregated SpoonApiResponse containing all results up to maxPages. Adds `_truncated` and `_pagesFetched` properties for diagnostics.
 */
async function fetchPaginated(
  firstUrl: string,
  controller: AbortController
): Promise<SpoonApiResponse> {
  let aggregated: SpoonApiResponse | null = null;
  let url: string | null = firstUrl;
  let page = 0;
  let prevNext: string | null = null;
  while (url) {
    // console.debug('Fetching page', page + 1, url);
    const data: SpoonApiResponse = await fetchJson(url, controller);
    if (!aggregated) {
      aggregated = { ...data };
    } else {
      aggregated.results = [
        ...(aggregated.results || []),
        ...(data.results || []),
      ];
    }
    // 次ページ URL をそのまま使用
    const nextUrl = data.next || null;
    if (nextUrl && nextUrl === prevNext) {
      // nextが同じ値になったら取得停止
      break;
    }
    prevNext = nextUrl;
    url = nextUrl;
    page += 1;
  }
  // maxPagesによる_truncatedは不要
  if (aggregated) {
    (aggregated as any)._pagesFetched = page;
  }
  return aggregated!;
}

export async function fetchAll(
  userId: string
): Promise<FetchResult> {
  const cleanId = userId.replace(/^@/, "");
  const isNumericId = /^[0-9]+$/.test(cleanId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    let numericId = cleanId;
    let userInfo: UserInfoResponse | null = null;
    // @ID/英数字IDならprofiles APIで数字ID取得
    if (!isNumericId) {
      const userUrl = `https://jp-api.spooncast.net/profiles/${cleanId}/`;
      try {
        userInfo = (await fetchJson(userUrl, controller)) as UserInfoResponse;
        console.debug("[API DEBUG] profiles API response:", userInfo);
        const results: any = userInfo.results;
        if (results && results[0] && results[0].user_id != null) {
          numericId = results[0].user_id.toString();
        }
      } catch (e) {
        userInfo = null;
        console.debug("[API DEBUG] profiles API error:", e);
      }
    }
    // ユーザー詳細はspoon-channel-apiで取得
    let channelInfo: ChannelInfoResponse | null = null;
    try {
      const channelUrl = `https://asia-northeast1-spoon-472604.cloudfunctions.net/spoon-channel-api?user_id=${numericId}`;
      channelInfo = (await fetchJson(
        channelUrl,
        controller
      )) as ChannelInfoResponse;
      console.debug("[API DEBUG] spoon-channel-api response:", channelInfo);
      console.debug("[API DEBUG] spoon-channel-api response (full):", JSON.stringify(channelInfo, null, 2));
    } catch (e) {
      channelInfo = null;
      console.debug("[API DEBUG] spoon-channel-api error:", e);
    }
    
    // ユーザー直接API（jp-api.spooncast.net/users/{id}/）で詳細情報取得
    let userDirectInfo: any | null = null;
    try {
      const userDirectUrl = `https://jp-api.spooncast.net/users/${numericId}/`;
      userDirectInfo = await fetchJson(userDirectUrl, controller);
      console.debug("[API DEBUG] jp-api users API response:", userDirectInfo);
    } catch (e) {
      userDirectInfo = null;
      console.debug("[API DEBUG] jp-api users API error:", e);
    }
    
    // followers/followingsは必ず数字IDでアクセス
    const followersFirst = `https://jp-api.spooncast.net/users/${numericId}/followers/`;
    const followingsFirst = `https://jp-api.spooncast.net/users/${numericId}/followings/`;
    console.debug("[API DEBUG] followers API URL:", followersFirst);
    console.debug("[API DEBUG] followings API URL:", followingsFirst);
    const [followersData, followingsData] = await Promise.all([
      fetchPaginated(followersFirst, controller),
      fetchPaginated(followingsFirst, controller),
    ]);
    console.debug("[API DEBUG] followers API response:", followersData);
    console.debug("[API DEBUG] followings API response:", followingsData);
    return { userInfo, channelInfo, userDirectInfo, followersData, followingsData };
  } catch (e) {
    if (import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("API fetch error", e);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
