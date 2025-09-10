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



interface UserInfoResponse {
  status_code: number;
  detail: string;
  results: Array<{
    id: number;
    nickname: string;
    tag: string;
    profile_url: string;
    // ...他の必要なフィールドがあれば追加
  }>;
}

interface FetchResult {
  userInfo: UserInfoResponse;
  followersData: SpoonApiResponse;
  followingsData: SpoonApiResponse;
}

const defaultHeaders: Record<string, string> = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json, text/plain, */*",
};

const buildUrl = (base: string | undefined, target: string) => {
  if (!base) return target;
  if (base.endsWith("/")) return base + encodeURIComponent(target);
  return base + "/" + encodeURIComponent(target);
};

// 'next' に返ってくる URL をプロキシ経由形式に再構築
const buildNextUrl = (
  proxyBase: string | undefined,
  nextUrl: string | null
) => {
  if (!nextUrl) return null;
  return buildUrl(proxyBase, nextUrl);
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
  proxyBase: string | undefined,
  controller: AbortController,
  maxPages = 10
): Promise<SpoonApiResponse> {
  let aggregated: SpoonApiResponse | null = null;
  let url: string | null = firstUrl;
  let page = 0;
  while (url && page < maxPages) {
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
    // 次ページ URL 再構築
    url = buildNextUrl(proxyBase, data.next || null);
    page += 1;
  }
  if (aggregated && url) {
    (aggregated as any)._truncated = true; // まだ続きがあるが maxPages で打ち切り
  }
  if (aggregated) {
    (aggregated as any)._pagesFetched = page;
  }
  return aggregated!;
}

export async function fetchAll(
  userId: string,
  proxyBase?: string
): Promise<FetchResult> {
  const userUrl = buildUrl(
    proxyBase,
    `https://jp-api.spooncast.net/users/${userId}/`
  );
  const followersFirst = buildUrl(
    proxyBase,
    `https://jp-api.spooncast.net/users/${userId}/followers/`
  );
  const followingsFirst = buildUrl(
    proxyBase,
    `https://jp-api.spooncast.net/users/${userId}/followings/`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // ページ数増加に備えて延長
  try {
    const userInfo = await fetchJson(userUrl, controller);
    const [followersData, followingsData] = await Promise.all([
      fetchPaginated(followersFirst, proxyBase, controller, 20), // 最大20ページ(約600件想定)
      fetchPaginated(followingsFirst, proxyBase, controller, 20),
    ]);
    return { userInfo, followersData, followingsData };
  } catch (e) {
    if (import.meta.env && import.meta.env.DEV) {
      // 開発環境のみエラー詳細を出力
      // eslint-disable-next-line no-console
      console.error("API fetch error", e);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
