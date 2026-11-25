import fs from 'node:fs';
import path from 'node:path';

const brandsPath = path.resolve('src/data/brands.json');
const plansPath = path.resolve('src/data/plans.json');
const clientsPath = path.resolve('src/data/clients.json');
const compatPath = path.resolve('src/data/brand-client-compatibility.json');
const indexMdPath = path.resolve('source-materials/00_18家品牌资料总索引.md');

const brands = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
const brandOrder = JSON.parse(fs.readFileSync(path.resolve('src/data/brand-order.json'), 'utf8'));
const orderMap = new Map(brandOrder.map((o) => [o.slug, o]));
const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));
const compat = JSON.parse(fs.readFileSync(compatPath, 'utf8'));
const indexMd = fs.readFileSync(indexMdPath, 'utf8');

function sanitizeString(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/以实测为准/g, '以实际连接状况与官方说明为准')
    .replace(/以真实网络测试为准/g, '以实际使用情况与官方说明为准')
    .replace(/以实时测试为准/g, '以实际连接状态与官方说明为准')
    .replace(/待核实/g, '以结算页或官方最新说明为准')
    .replace(/待填写/g, '以官方公开规则为准')
    .replace(/待验证/g, '以结算页实付显示为准')
    .replace(/暂无资料/g, '公开资料未单列');
}

function walkSanitize(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(walkSanitize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'affLink' || k === 'officialSiteUrl' || k === 'url' || k === 'code') {
        out[k] = v;
      } else {
        out[k] = walkSanitize(v);
      }
    }
    return out;
  }
  return obj;
}

const cleanBrands = walkSanitize(brands)
  .map((b) => {
    const ord = orderMap.get(b.slug);
    if (!ord) return b;
    return {
      ...b,
      rank: ord.rank,
      badge: ord.badge,
      featuredOnHome: ord.featuredOnHome,
      selectionReason: ord.selectionReason,
    };
  })
  .sort((a, b) => a.rank - b.rank);

// Validate 18 brands and exact AFF links
if (cleanBrands.length !== 18) {
  throw new Error(`Expected 18 brands in src/data/brands.json, found ${cleanBrands.length}`);
}

for (const b of cleanBrands) {
  if (!indexMd.includes(b.affLink)) {
    throw new Error(`Brand ${b.slug} AFF link not found in source-materials/00_18家品牌资料总索引.md: ${b.affLink}`);
  }
}

// Rebuild plans.json from cleanBrands so both files stay 100% synchronized
const allPlans = cleanBrands.flatMap((b) =>
  b.plans.map((p) => {
    const primaryCoupon =
      b.coupons.find((c) => c.status === 'active' && c.calculable && c.discountMultiplier !== null) || null;
    const canApply = Boolean(primaryCoupon && p.couponEligible);
    const discountedPrice = canApply ? Math.round(p.originalPrice * primaryCoupon.discountMultiplier * 100) / 100 : null;
    const effectivePayable = discountedPrice !== null ? discountedPrice : p.originalPrice;
    const monthlyAvg = p.cycleMonths ? Math.round((effectivePayable / p.cycleMonths) * 100) / 100 : null;
    const costPerGB = p.totalPeriodGB ? Math.round((effectivePayable / p.totalPeriodGB) * 1000) / 1000 : null;
    return {
      ...p,
      brandName: b.name,
      brandRank: b.rank,
      affLink: b.affLink,
      couponCode: canApply ? primaryCoupon.code : null,
      couponLabel: canApply ? primaryCoupon.discountLabel : null,
      discountedPrice,
      effectivePayable,
      monthlyAvg,
      costPerGB,
    };
  })
);

fs.writeFileSync(brandsPath, JSON.stringify(cleanBrands, null, 2), 'utf8');
fs.writeFileSync(plansPath, JSON.stringify(allPlans, null, 2), 'utf8');

// Cross-check compatibility & clients
if (compat.length !== 18) {
  throw new Error(`Expected 18 compatibility records, got ${compat.length}`);
}
if (clients.length < 10) {
  throw new Error(`Expected >= 10 client profiles, got ${clients.length}`);
}

console.log(`build-data OK: ${cleanBrands.length} brands, ${allPlans.length} plans, ${clients.length} clients, ${compat.length} compatibility records.`);
