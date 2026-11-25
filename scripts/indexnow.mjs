import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const SITE = 'https://mofatizi.blog';
const HOST = 'mofatizi.blog';
const DEFAULT_KEY = 'f4e9b2a1c8d7463e9b0a1d2c3e4f5a6b';
const KEY = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

const distDir = path.resolve('dist');
const manifestPath = path.resolve('.indexnow-manifest.json');
const reportsDir = path.resolve('reports');
const payloadOut = path.join(reportsDir, 'indexnow-payload.json');
const shouldSubmit = process.argv.includes('--submit');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory not found. Run npm run build first.');
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

const currentHashes = {};
for (const file of walkHtml(distDir)) {
  const route = fileToRoute(file);
  if (route === '/404.html' || route === '/404/' || route === '/search/') continue;
  const html = fs.readFileSync(file, 'utf8');
  const root = parse(html);
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  if (robots.includes('noindex')) continue;
  const mainText = root.querySelector('main')?.text || html;
  const url = `${SITE}${route}`;
  currentHashes[url] = crypto.createHash('sha256').update(mainText).digest('hex');
}

const previousHashes = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};

const changedUrls = [];
for (const [url, hash] of Object.entries(currentHashes)) {
  if (previousHashes[url] !== hash) {
    changedUrls.push(url);
  }
}
for (const oldUrl of Object.keys(previousHashes)) {
  if (!currentHashes[oldUrl]) {
    changedUrls.push(oldUrl);
  }
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: changedUrls,
};

fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(payloadOut, JSON.stringify({ generatedAt: new Date().toISOString(), ...payload }, null, 2), 'utf8');

console.log(`IndexNow manifest check: ${changedUrls.length} changed/added/removed URL(s) out of ${Object.keys(currentHashes).length} indexable URLs.`);

if (!shouldSubmit) {
  console.log(`Dry-run payload written to ${payloadOut}. Run with --submit after live deployment.`);
  process.exit(0);
}

if (!changedUrls.length) {
  console.log('No URL changes detected since last recorded manifest. Skipping submission.');
  process.exit(0);
}

// Verify key file is live before submitting
const keyCheck = await fetch(KEY_LOCATION);
if (!keyCheck.ok) {
  console.error(`Aborted: ${KEY_LOCATION} returned HTTP ${keyCheck.status}. Ensure site is deployed publicly first.`);
  process.exit(1);
}
const keyBody = (await keyCheck.text()).trim();
if (keyBody !== KEY) {
  console.error(`Aborted: ${KEY_LOCATION} content mismatch.`);
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error(`IndexNow API returned HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

fs.writeFileSync(manifestPath, JSON.stringify(currentHashes, null, 2), 'utf8');
console.log(`IndexNow submitted ${changedUrls.length} URL(s) successfully (HTTP ${res.status}). Manifest updated.`);
