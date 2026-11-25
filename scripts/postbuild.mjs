import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const SITE = 'https://mofatizi.blog';
const distDir = path.resolve('dist');
const brands = JSON.parse(fs.readFileSync(path.resolve('src/data/brands.json'), 'utf8'));
const clients = JSON.parse(fs.readFileSync(path.resolve('src/data/clients.json'), 'utf8'));

const brandUpdatedMap = new Map(brands.map((b) => [`/brands/${b.slug}/`, b.lastUpdatedDate || '2026-11-25']));
const clientUpdatedMap = new Map(clients.map((c) => [`/clients/${c.clientId}/`, c.sourceDate || '2026-11-25']));

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function fileToRoute(filePath) {
  const rel = path.relative(distDir, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function getLastMod(route, htmlDoc) {
  if (brandUpdatedMap.has(route)) return brandUpdatedMap.get(route);
  if (clientUpdatedMap.has(route)) return clientUpdatedMap.get(route);
  const modMeta = htmlDoc.querySelector('meta[property="article:modified_time"]')?.getAttribute('content');
  if (modMeta && /^\d{4}-\d{2}-\d{2}/.test(modMeta)) return modMeta.slice(0, 10);
  const timeEls = htmlDoc.querySelectorAll('time[datetime]');
  if (timeEls.length) {
    const dt = timeEls[timeEls.length - 1].getAttribute('datetime');
    if (dt && /^\d{4}-\d{2}-\d{2}/.test(dt)) return dt.slice(0, 10);
  }
  return '2026-11-25';
}

const htmlFiles = walkHtml(distDir);
const indexableUrls = [];

for (const file of htmlFiles) {
  const route = fileToRoute(file);
  if (route === '/404.html' || route === '/404/' || route === '/search/') continue;

  const raw = fs.readFileSync(file, 'utf8');
  const root = parse(raw);
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  if (robots.includes('noindex')) continue;

  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  const expectedCanonical = `${SITE}${route}`;
  if (canonical && canonical !== expectedCanonical) continue;

  const lastmod = getLastMod(route, root);
  indexableUrls.push({ route, loc: expectedCanonical, lastmod });
}

indexableUrls.sort((a, b) => (a.route === '/' ? -1 : b.route === '/' ? 1 : a.route.localeCompare(b.route)));

function renderUrlSet(items) {
  const rows = items
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

const brandUrls = indexableUrls.filter((u) => u.route.startsWith('/brands/') && u.route !== '/brands/');
const clientUrls = indexableUrls.filter((u) => u.route.startsWith('/clients/'));
const articleUrls = indexableUrls.filter((u) => u.route.startsWith('/articles/') || u.route.startsWith('/knowledge/'));
const guideUrls = indexableUrls.filter(
  (u) => !brandUrls.includes(u) && !clientUrls.includes(u) && !articleUrls.includes(u)
);

fs.writeFileSync(path.join(distDir, 'sitemap-brands.xml'), renderUrlSet(brandUrls), 'utf8');
fs.writeFileSync(path.join(distDir, 'sitemap-clients.xml'), renderUrlSet(clientUrls), 'utf8');
fs.writeFileSync(path.join(distDir, 'sitemap-articles.xml'), renderUrlSet(articleUrls), 'utf8');
fs.writeFileSync(path.join(distDir, 'sitemap-guides.xml'), renderUrlSet(guideUrls), 'utf8');
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), renderUrlSet(indexableUrls), 'utf8');

const subMaps = [
  { name: 'sitemap-guides.xml', lastmod: '2026-11-25' },
  { name: 'sitemap-brands.xml', lastmod: '2026-11-25' },
  { name: 'sitemap-clients.xml', lastmod: '2026-11-25' },
  { name: 'sitemap-articles.xml', lastmod: '2026-11-25' },
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${subMaps
  .map((m) => `  <sitemap>\n    <loc>${SITE}/${m.name}</loc>\n    <lastmod>${m.lastmod}</lastmod>\n  </sitemap>`)
  .join('\n')}\n</sitemapindex>\n`;
fs.writeFileSync(path.join(distDir, 'sitemap-index.xml'), indexXml, 'utf8');

console.log(
  `postbuild OK: sitemap.xml (${indexableUrls.length} URLs) + 4 split sitemaps & sitemap-index.xml generated.`
);
