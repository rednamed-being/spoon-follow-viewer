const defaultHeaders = {
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json, text/plain, */*",
};
const buildUrl = (base, target) => {
    if (!base)
        return target;
    if (base.endsWith("/"))
        return base + encodeURIComponent(target);
    return base + "/" + encodeURIComponent(target);
};
// 'next' に返ってくる URL をプロキシ経由形式に再構築
const buildNextUrl = (proxyBase, nextUrl) => {
    if (!nextUrl)
        return null;
    return buildUrl(proxyBase, nextUrl);
};
async function fetchJson(url, controller) {
    const res = await fetch(url, {
        headers: defaultHeaders,
        signal: controller.signal,
    });
    if (!res.ok)
        throw new Error(`リクエスト失敗 (${res.status}) - ${url}`);
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
async function fetchPaginated(firstUrl, proxyBase, controller) {
    let aggregated = null;
    let url = firstUrl;
    let page = 0;
    let prevNext = null;
    while (url) {
        // console.debug('Fetching page', page + 1, url);
        const data = await fetchJson(url, controller);
        if (!aggregated) {
            aggregated = { ...data };
        }
        else {
            aggregated.results = [
                ...(aggregated.results || []),
                ...(data.results || []),
            ];
        }
        // 次ページ URL 再構築
        const nextUrl = buildNextUrl(proxyBase, data.next || null);
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
        aggregated._pagesFetched = page;
    }
    return aggregated;
}
export async function fetchAll(userId, proxyBase) {
    const cleanId = userId.replace(/^@/, "");
    const userUrl = buildUrl(proxyBase, `https://jp-api.spooncast.net/profiles/${cleanId}/`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const userInfo = await fetchJson(userUrl, controller);
        // user_id（数字）を抽出
        const userInfoTyped = userInfo;
        const results = userInfoTyped.results;
        const numericId = results && results[0] && results[0].user_id != null
            ? results[0].user_id.toString()
            : cleanId;
        const followersFirst = buildUrl(proxyBase, `https://jp-api.spooncast.net/users/${numericId}/followers/`);
        const followingsFirst = buildUrl(proxyBase, `https://jp-api.spooncast.net/users/${numericId}/followings/`);
        const [followersData, followingsData] = await Promise.all([
            fetchPaginated(followersFirst, proxyBase, controller),
            fetchPaginated(followingsFirst, proxyBase, controller),
        ]);
        return { userInfo, followersData, followingsData };
    }
    catch (e) {
        if (import.meta.env && import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error("API fetch error", e);
        }
        throw e;
    }
    finally {
        clearTimeout(timeout);
    }
}
