const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV = path.join(__dirname, '..', 'saizeriya_tier.csv');
const OUT_DIR = path.join(__dirname, '..', 'public');
const OUT = path.join(OUT_DIR, 'saizeriya.json');

if (!fs.existsSync(CSV)) {
  console.error('CSV not found:', CSV);
  process.exit(1);
}

const raw = fs.readFileSync(CSV, 'utf8');
const rows = parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });

// Normalize headers to english keys as fallback
const normalize = (r) => {
  return {
    category: r['カテゴリー'] || r.category || '',
    name: r['メニュー'] || r.menu || '',
    code: r['コード'] || r.code || '',
    price_yen: r['価格(円)'] ? parseInt(r['価格(円)'], 10) : (r.price ? Number(r.price) : null),
    taste: r['おいしさ(1-5)'] ? Number(r['おいしさ(1-5)']) : (r.taste ? Number(r.taste) : null),
    cheapness: r['安さ(1-5)'] ? Number(r['安さ(1-5)']) : (r.cheapness ? Number(r.cheapness) : null),
    popularity: r['人気度(1-5)'] ? Number(r['人気度(1-5)']) : (r.popularity ? Number(r.popularity) : null),
    tier: r['Tier'] || r.tier || '',
    image_url: r['image_url'] || r.image_url || '',
    image_search_url: r['image_search_url'] || r.image_search_url || '',
    note: r['備考'] || r.note || ''
  };
};

const data = rows.map(normalize);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', OUT, 'rows=', data.length);
