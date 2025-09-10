// Spoon API をクライアントサイドのみで叩くための単純なクライアント
// GitHub Pages ではサーバーサイドコードが使えないため、必要に応じて CORS 対応のプロキシを利用する
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
    const res = await fetch(url, { headers: defaultHeaders, signal: controller.signal });
    if (!res.ok)
        throw new Error(`リクエスト失敗 (${res.status}) - ${url}`);
    return res.json();
}
async function fetchPaginated(firstUrl, proxyBase, controller, maxPages = 10) {
    let aggregated = null;
    let url = firstUrl;
    let page = 0;
    while (url && page < maxPages) {
        // console.debug('Fetching page', page + 1, url);
        const data = await fetchJson(url, controller);
        if (!aggregated) {
            aggregated = { ...data };
        }
        else {
            aggregated.results = [...(aggregated.results || []), ...(data.results || [])];
        }
        // 次ページ URL 再構築
        url = buildNextUrl(proxyBase, data.next || null);
        page += 1;
    }
    if (url) {
        aggregated._truncated = true; // まだ続きがあるが maxPages で打ち切り
    }
    aggregated._pagesFetched = page;
    return aggregated;
}
export async function fetchAll(userId, proxyBase) {
    const userUrl = buildUrl(proxyBase, `https://jp-api.spooncast.net/users/${userId}/`);
    const followersFirst = buildUrl(proxyBase, `https://jp-api.spooncast.net/users/${userId}/followers/`);
    const followingsFirst = buildUrl(proxyBase, `https://jp-api.spooncast.net/users/${userId}/followings/`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // ページ数増加に備えて延長
    try {
        const userInfo = await fetchJson(userUrl, controller);
        const [followersData, followingsData] = await Promise.all([
            fetchPaginated(followersFirst, proxyBase, controller, 20), // 最大20ページ(約600件想定)
            fetchPaginated(followingsFirst, proxyBase, controller, 20)
        ]);
        return { userInfo, followersData, followingsData };
    }
    catch (e) {
        console.error('API fetch error', e);
        throw e;
    }
    finally {
        clearTimeout(timeout);
    }
}
