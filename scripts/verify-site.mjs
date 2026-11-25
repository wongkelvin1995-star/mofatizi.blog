import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const SITE = 'https://mofatizi.blog';
const distDir = path.resolve('dist');
const brands = JSON.parse(fs.readFileSync(path.resolve('src/data/brands.json'), 'utf8'));
const indexMd = fs.readFileSync(path.resolve('source-materials/00_18家品牌资料总索引.md'), 'utf8');
const searchIndex = JSON.parse(fs.readFileSync(path.resolve('public/search-index.json'), 'utf8'));
const seoRegistry = JSON.parse(fs.readFileSync(path.resolve('src/data/seo-keywords.json'), 'utf8'));

if (!fs.existsSync(distDir)) {
  console.error('FAIL: dist/ missing. Run npm run build first.');
  process.exit(1);
}

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

const htmlFiles = walkHtml(distDir);
const routesSet = new Set(htmlFiles.map(fileToRoute));
const errors = [];
const warnings = [];
const titleMap = new Map();
const descMap = new Map();

const FORBIDDEN_PLACEHOLDERS = [
  '待核实',
  '待填写',
  '待验证',
  '数据缺失',
  '暂无资料',
  '测试中',
  'Lorem Ipsum',
  '晚高峰实测',
  '节点测速报告',
];
const SIBLING_DOMAINS = ['jichangyouhui.blog', 'jichang-wending.blog', 'jichang-pianyi.blog'];
const expectedAffs = new Set(brands.map((b) => b.affLink));

for (const file of htmlFiles) {
  const route = fileToRoute(file);
  const raw = fs.readFileSync(file, 'utf8');
  const root = parse(raw);
  const bodyText = root.querySelector('body')?.text || raw;
  const is404 = route === '/404.html' || route === '/404/';
  const isSearch = route === '/search/';

  // 1. Sibling domain contamination check
  for (const dom of SIBLING_DOMAINS) {
    if (raw.includes(dom)) {
      errors.push(`[Domain Leak] ${route} contains sibling domain ${dom}`);
    }
  }

  // 2. Forbidden placeholders check
  for (const bad of FORBIDDEN_PLACEHOLDERS) {
    if (bodyText.includes(bad)) {
      errors.push(`[Forbidden Text] ${route} contains "${bad}"`);
    }
  }

  // 3. Single H1 check
  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) {
    errors.push(`[H1 Count] ${route} has ${h1s.length} H1 tags (expected 1)`);
  }

  // 4. Title & Meta Description uniqueness for indexable pages
  const title = root.querySelector('title')?.text?.trim() || '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

  if (!title) errors.push(`[Missing Title] ${route}`);
  if (!desc) errors.push(`[Missing Meta Description] ${route}`);

  if (!is404 && !isSearch && !robots.includes('noindex')) {
    if (canonical !== `${SITE}${route}`) {
      errors.push(`[Canonical Mismatch] ${route} canonical="${canonical}" expected="${SITE}${route}"`);
    }
    if (titleMap.has(title)) {
      errors.push(`[Duplicate Title] "${title}" on ${route} and ${titleMap.get(title)}`);
    } else {
      titleMap.set(title, route);
    }
    if (descMap.has(desc)) {
      errors.push(`[Duplicate Description] on ${route} and ${descMap.get(desc)}`);
    } else {
      descMap.set(desc, route);
    }
  } else if (isSearch && !robots.includes('noindex')) {
    errors.push(`[Search Indexable] /search/ must have noindex`);
  }

  // 5. Internal link & image & href="#" check
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') || '';
    if (href === '#') {
      errors.push(`[Empty Anchor] ${route} has href="#"`);
    } else if (href.startsWith('/')) {
      const cleanPath = href.split('#')[0].split('?')[0];
      if (!cleanPath) continue;
      if (!routesSet.has(cleanPath) && !fs.existsSync(path.join(distDir, cleanPath.slice(1)))) {
        errors.push(`[Broken Link] ${route} -> ${href}`);
      }
    } else if (expectedAffs.has(href)) {
      const rel = a.getAttribute('rel') || '';
      if (!rel.includes('sponsored') || !rel.includes('nofollow')) {
        errors.push(`[AFF Rel] ${route} link ${href} missing sponsored/nofollow`);
      }
    }
  }

  for (const img of root.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('/') && !fs.existsSync(path.join(distDir, src.slice(1)))) {
      errors.push(`[Missing Image] ${route} -> ${src}`);
    }
    const alt = img.getAttribute('alt');
    if (alt === undefined || alt === null) {
      warnings.push(`[Missing Alt] ${route} img ${src}`);
    }
  }

  // 6. JSON-LD validation
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      JSON.parse(script.text);
    } catch (e) {
      errors.push(`[Invalid JSON-LD] ${route}: ${e.message}`);
    }
  }
}

// 7. Sitemap & Robots checks
const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
if (sitemapXml.includes('/search/') || sitemapXml.includes('/404')) {
  errors.push('[Sitemap] sitemap.xml must exclude /search/ and /404');
}
for (const kw of seoRegistry.keywords) {
  if (!routesSet.has(kw.primaryUrl)) {
    errors.push(`[SEO Registry] Missing built route for KW ${kw.keywordId} (${kw.primaryKeyword}): ${kw.primaryUrl}`);
  }
}

// 8. Brand AFF verbatim check
for (const b of brands) {
  if (!indexMd.includes(b.affLink)) {
    errors.push(`[AFF Mismatch] ${b.slug} AFF ${b.affLink} not in index MD`);
  }
  if (!routesSet.has(`/brands/${b.slug}/`)) {
    errors.push(`[Missing Brand Route] /brands/${b.slug}/`);
  }
}

// 9. Search index hygiene & target checks
const searchStr = JSON.stringify(searchIndex);
if (searchStr.includes('subscribe?token=') || searchStr.includes('api/v1/client/subscribe')) {
  errors.push('[Search Security] Private subscription URL detected in search-index.json');
}

console.log(`=== Engineering Verification Summary ===`);
console.log(`HTML pages audited : ${htmlFiles.length}`);
console.log(`Brands verified    : ${brands.length}`);
console.log(`SEO keywords (081-120) verified: ${seoRegistry.keywords.length}`);
console.log(`Search docs indexed: ${searchIndex.length}`);
console.log(`Warnings           : ${warnings.length}`);
console.log(`Errors             : ${errors.length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.slice(0, 15).forEach((w) => console.log(' - ' + w));
}

if (errors.length) {
  console.error('\nErrors:');
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}

console.log('\nALL CHECKS PASSED!');
