Server for serving the Saizeriya CSV data and resolving images.

Install and run:

```bash
cd server
npm install
npm start
```

Endpoints:
- `GET /api/saizeriya` - returns CSV parsed to JSON
- `GET /api/saizeriya/csv` - returns raw CSV file
- `GET /api/resolve-image?name=<menu name>` - attempts to resolve a direct image URL using the `image_search_url` field; returns `{ image_url, search_url }`

Notes:
- Image resolution uses a simple HTML parse of the image-search page and is not guaranteed to find a usable CDN image URL due to search engines' dynamic loading and anti-scrape measures.
- If you want reliable image URLs, consider using an official image API (Custom Search API, Bing Image Search API) with an API key.
