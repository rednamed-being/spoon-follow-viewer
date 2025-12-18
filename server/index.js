const path = require('path');
const fs = require('fs');
const express = require('express');
const { parse } = require('csv-parse/sync');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5173;

const CSV_PATH = path.join(__dirname, '..', 'saizeriya_tier.csv');

function loadCsv() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  return records;
}

app.get('/api/saizeriya', (req, res) => {
  try {
    const data = loadCsv();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/saizeriya/csv', (req, res) => {
  res.sendFile(CSV_PATH);
});

// Attempt to resolve first image URL from the image_search_url of an entry
app.get('/api/resolve-image', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: 'name query required' });

  try {
    const records = loadCsv();
    const row = records.find(r => r.メニュー === name || r.menu === name);
    if (!row) return res.status(404).json({ error: 'menu not found' });

    if (row.image_url && row.image_url.trim()) {
      return res.json({ image_url: row.image_url });
    }

    const searchUrl = row.image_search_url;
    if (!searchUrl) return res.json({ image_url: null, search_url: null });

    // Try to fetch the search page and parse first image
    const resp = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();
    const $ = cheerio.load(html);

    // Look for images in order of likelihood
    let found = null;
    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (!found && src.startsWith('http')) found = src;
    });

    // Fallback: look for data-src or meta og:image
    if (!found) {
      const meta = $('meta[property="og:image"]').attr('content');
      if (meta) found = meta;
    }

    res.json({ image_url: found || null, search_url: searchUrl });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Saizeriya API running on http://localhost:${PORT}`);
});
