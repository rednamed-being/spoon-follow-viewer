const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.join(__dirname, '..', 'saizeriya_tier.csv');

function readCsv() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  return { raw, rows: parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true }) };
}

function writeCsv(rows, headerOrder) {
  const headers = headerOrder;
  const lines = [headers.join(',')];
  for (const r of rows) {
    const vals = headers.map(h => {
      const v = r[h] == null ? '' : String(r[h]);
      // escape double quotes
      return '"' + v.replace(/"/g, '""') + '"';
    });
    lines.push(vals.join(','));
  }
  fs.writeFileSync(CSV_PATH, lines.join('\n'), 'utf8');
}

async function resolveImage(searchUrl) {
  try {
    const resp = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
    const html = await resp.text();
    const $ = cheerio.load(html);
    let found = null;
    $('img').each((i, el) => {
      if (found) return;
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && src.startsWith('http')) found = src;
    });
    if (!found) {
      const meta = $('meta[property="og:image"]').attr('content');
      if (meta && meta.startsWith('http')) found = meta;
    }
    return found;
  } catch (err) {
    return null;
  }
}

(async function main(){
  const { raw, rows } = readCsv();
  const headerOrder = Object.keys(rows[0] || {});

  console.log(`Found ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.image_url && r.image_url.trim()) {
      console.log(`${i+1}/${rows.length}: ${r.メニュー} - already has image`);
      continue;
    }
    const search = r.image_search_url || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent('サイゼリヤ ' + r.メニュー)}`;
    console.log(`${i+1}/${rows.length}: resolving ${r.メニュー} ...`);
    const img = await resolveImage(search);
    if (img) {
      r.image_url = img;
      console.log(`  -> found: ${img}`);
    } else {
      console.log(`  -> not found`);
    }
    // polite pause
    await new Promise(res => setTimeout(res, 800));
  }

  writeCsv(rows, headerOrder);
  console.log('Updated CSV written to', CSV_PATH);
})();
