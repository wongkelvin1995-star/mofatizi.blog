import fs from 'node:fs';
import path from 'node:path';

const brands = JSON.parse(fs.readFileSync(path.resolve('src/data/brands.json'), 'utf8'));
const plans = JSON.parse(fs.readFileSync(path.resolve('src/data/plans.json'), 'utf8'));
const clients = JSON.parse(fs.readFileSync(path.resolve('src/data/clients.json'), 'utf8'));
const compat = JSON.parse(fs.readFileSync(path.resolve('src/data/brand-client-compatibility.json'), 'utf8'));
const synonymsSrc = path.resolve('src/data/search-synonyms.json');
fs.copyFileSync(synonymsSrc, path.resolve('public/search-synonyms.json'));

const compatMap = new Map(compat.map((c) => [c.brandId, c]));

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { data: {}, body: md };
  const rawYaml = m[1];
  const data = {};
  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const val = kv[2].trim();
      if (!val) {
        data[currentKey] = [];
      } else {
        try {
          data[currentKey] = JSON.parse(val);
        } catch {
          data[currentKey] = val.replace(/^["']|["']$/g, '');
        }
      }
    } else if (currentKey && line.trim().startsWith('- ')) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(line.trim().slice(2).replace(/^["']|["']$/g, ''));
    }
  }
  return { data, body: m[2] };
}

function stripMarkdown(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*`|_~-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const docs = [];

// 1. Brands (18)
for (const b of brands) {
  const c = compatMap.get(b.slug);
  const couponCodes = (b.coupons || []).map((x) => x.code).filter(Boolean).join(' ');
  const planNames = Array.from(new Set(b.plans.map((p) => p.planName))).join(' ');
  const platforms = c ? Object.keys(c.platforms).join(' ') : '';
  docs.push({
    kind: 'brand',
    categoryGroup: 'brand',
    kindLabel: '机场品牌',
    exactName: `${b.name} ${b.englishName} ${(b.aliases || []).join(' ')}`,
    title: `${b.name} (${b.englishName}) — 品牌档案与客户端兼容性`,
    subtitle: b.tagline,
    url: `/brands/${b.slug}/`,
    keywords: [b.name, b.englishName, ...(b.aliases || []), couponCodes, ...(b.protocols || []), ...(b.nodeRegions || []), platforms, planNames, b.clashBadge].filter(Boolean).join(' '),
    body: `${b.summary} ${b.positioning} ${b.thirdPartySubscriptionPolicy} ${c?.compatibilityEvidence || ''}`,
    meta: `#${b.rank} · ${b.clashBadge} · ${b.plans.length}档记录`,
  });
}

// 2. Clients (10)
for (const cl of clients) {
  docs.push({
    kind: 'client',
    categoryGroup: 'client',
    kindLabel: '客户端百科',
    exactName: `${cl.clientName} ${(cl.aliases || []).join(' ')}`,
    title: `${cl.clientName} 使用教程与官方仓库百科`,
    subtitle: cl.tagline,
    url: `/clients/${cl.clientId}/`,
    keywords: [cl.clientName, ...(cl.aliases || []), cl.coreEngine, ...cl.supportedPlatforms, ...cl.supportedConfigTypes].join(' '),
    body: `${cl.highlights.join(' ')} ${cl.cautions.join(' ')}`,
    meta: `${cl.supportedPlatforms.join(' / ')} · ${cl.coreEngine}`,
  });
}

// 3. Plans (summarized per brand+planName to keep index fast & relevant)
const seenPlanKeys = new Set();
for (const p of plans) {
  const key = `${p.brandSlug}::${p.planName}`;
  if (seenPlanKeys.has(key)) continue;
  seenPlanKeys.add(key);
  docs.push({
    kind: 'plan',
    categoryGroup: 'brand',
    kindLabel: '套餐规格',
    exactName: `${p.brandName} ${p.planName}`,
    title: `${p.brandName} · ${p.planName}（${p.cycleLabel}起）`,
    subtitle: `${p.monthlyTrafficGB ? `${p.monthlyTrafficGB}GB/月` : `总量${p.totalPeriodGB}GB`} · 原价¥${p.originalPrice}${p.couponCode ? ` · 用码${p.couponCode}` : ''}`,
    url: `/brands/${p.brandSlug}/#plans`,
    keywords: `${p.brandName} ${p.planName} ${p.cycleLabel} ${p.couponCode || ''} ${p.lineTags.join(' ')}`,
    body: `${p.resetRule} ${p.notes}`,
    meta: `记录日期 ${p.recordDate}`,
  });
}

// 4. Content Collections
const guideUrlOverrides = {
  'reliable-ladder-guide': '/recommend/reliable/',
  'budget-ladder-guide': '/recommend/budget/',
  'high-speed-ladder-guide': '/recommend/high-speed/',
  'clash-subscription': '/clash/subscription/',
  'clash-import': '/clash/import/',
  'clash-modes': '/clash/modes/',
  'clash-tun': '/clash/tun/',
  'clash-subscription-errors': '/clash/subscription-errors/',
  'clash-client-comparison': '/clash/client-comparison/',
};

function indexMdDir(dirRel, defaultPrefix, categoryGroup, kindLabel, urlOverrides = {}) {
  const absDir = path.resolve(dirRel);
  if (!fs.existsSync(absDir)) return;
  const files = fs.readdirSync(absDir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    if (defaultPrefix === '/clients/' && id !== 'shadowrocket-subscription') continue; // clients already indexed cleanly above with rich body merge
    const raw = fs.readFileSync(path.join(absDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (data.draft === true) continue;
    const url =
      id === 'shadowrocket-subscription'
        ? '/clients/shadowrocket/subscription/'
        : urlOverrides[id] || `${defaultPrefix}${id}/`;
    const isClash = url.startsWith('/clash/') || String(data.primaryKeyword || '').toLowerCase().includes('clash');
    docs.push({
      kind: categoryGroup,
      categoryGroup: isClash ? 'clash' : categoryGroup,
      kindLabel,
      exactName: data.primaryKeyword || '',
      title: data.title || id,
      subtitle: data.description || '',
      url,
      keywords: [data.primaryKeyword, ...(Array.isArray(data.secondaryKeywords) ? data.secondaryKeywords : []), ...(Array.isArray(data.tags) ? data.tags : [])]
        .filter(Boolean)
        .join(' '),
      body: stripMarkdown(body).slice(0, 1400),
      meta: `${data.category || kindLabel} · 更新于 ${data.updatedDate || '2026-11-25'}`,
    });
  }
}

indexMdDir('src/content/clients', '/clients/', 'client', '客户端教程');
indexMdDir('src/content/guides', '/guides/', 'guide', '使用指南', guideUrlOverrides);
indexMdDir('src/content/knowledge', '/knowledge/', 'knowledge', '知识百科');
indexMdDir('src/content/articles', '/articles/', 'guide', '深度专题');

// 5. Key Static Hubs
docs.push(
  {
    kind: 'hub',
    categoryGroup: 'guide',
    kindLabel: '核心专题',
    exactName: '梯子推荐 2026梯子推荐 魔法梯子推荐',
    title: '2026 梯子推荐大全｜魔法梯子、科学上网工具与使用指南',
    subtitle: '魔法梯子首页总览：18 家机场品牌、客户端知识中心、Clash 学院与新手入门指南',
    url: '/',
    keywords: '梯子推荐 2026梯子推荐 科学上网梯子 魔法梯子推荐 翻墙梯子推荐',
    body: '开启你的魔法网络知识之旅，探索机场品牌、网络连接工具、Clash客户端、订阅知识及新手使用指南',
    meta: '网站首页',
  },
  {
    kind: 'hub',
    categoryGroup: 'clash',
    kindLabel: 'Clash 专题',
    exactName: 'Clash机场推荐 Clash知识中心',
    title: 'Clash 机场推荐与第三方订阅政策核查专区',
    subtitle: '严格区分真正支持 Clash/Mihomo 通用订阅的品牌与仅支持官方客户端的品牌',
    url: '/clash/airports/',
    keywords: 'Clash机场推荐 支持Clash的机场 Mihomo兼容机场',
    body: 'U1S1 灵动云 微风网络 全球云 跨界 官方客户端 暂停通用订阅',
    meta: 'Clash 学院专区',
  },
  {
    kind: 'hub',
    categoryGroup: 'guide',
    kindLabel: 'VPN 专题',
    exactName: 'VPN梯子哪个好 VPN加速器推荐',
    title: 'VPN 梯子哪个好与 VPN 加速器选购知识指南',
    subtitle: '对比传统 VPN、网游加速器与代理机场的协议机制、边界及隐私安全评估标准',
    url: '/vpn/',
    keywords: 'VPN梯子哪个好 VPN加速器推荐 WireGuard OpenVPN IKEv2',
    body: '传统商业VPN协议原理、加速器边界与选购核查维度',
    meta: '工具原理指南',
  },
  {
    kind: 'hub',
    categoryGroup: 'client',
    kindLabel: '工具大全',
    exactName: '魔法上网工具有哪些 客户端选择助手',
    title: '魔法上网工具有哪些？工具分类图谱与客户端选择助手',
    subtitle: '按 Windows/macOS/iOS/Android/Linux/OpenWrt 一键筛选官方核验客户端',
    url: '/tools/',
    keywords: '魔法上网工具有哪些 代理工具 客户端选择助手',
    body: 'Mihomo sing-box Xray Shadowrocket 官方客户端 交互筛选',
    meta: '工具与筛选助手',
  }
);

fs.writeFileSync(path.resolve('public/search-index.json'), JSON.stringify(docs), 'utf8');
console.log(`build-search-index OK: indexed ${docs.length} documents into public/search-index.json.`);
