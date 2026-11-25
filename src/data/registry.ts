import brandsJson from './brands.json';
import plansJson from './plans.json';
import clientsJson from './clients.json';
import compatJson from './brand-client-compatibility.json';
import brandOrderJson from './brand-order.json';
import seoKeywordsJson from './seo-keywords.json';
import type {
  BrandClientCompatibilityRecord,
  BrandData,
  ClientProfile,
  PlanRecord,
} from '../types/airport';

export const ALL_BRANDS: BrandData[] = brandsJson as unknown as BrandData[];
export const BRAND_MAP = new Map<string, BrandData>(ALL_BRANDS.map((b) => [b.slug, b]));
export const HOME_FEATURED_BRANDS = ALL_BRANDS.filter((b) => b.featuredOnHome);

export const ALL_PLANS: PlanRecord[] = plansJson as unknown as PlanRecord[];
export const ALL_CLIENTS: ClientProfile[] = clientsJson as unknown as ClientProfile[];
export const CLIENT_MAP = new Map<string, ClientProfile>(ALL_CLIENTS.map((c) => [c.clientId, c]));

export const ALL_COMPATIBILITY: BrandClientCompatibilityRecord[] =
  compatJson as unknown as BrandClientCompatibilityRecord[];
export const COMPAT_MAP = new Map<string, BrandClientCompatibilityRecord>(
  ALL_COMPATIBILITY.map((c) => [c.brandId, c])
);

export const BRAND_ORDER = brandOrderJson;
export const SEO_KEYWORDS = seoKeywordsJson;

export function getBrandBySlug(slug: string): BrandData | undefined {
  return BRAND_MAP.get(slug);
}

export function getClientById(id: string): ClientProfile | undefined {
  return CLIENT_MAP.get(id);
}

export function getCompatibilityByBrandId(id: string): BrandClientCompatibilityRecord | undefined {
  return COMPAT_MAP.get(id);
}

export function getBrandMinMonthly(brand: BrandData): number | null {
  const monthly = brand.plans.filter((p) => p.cycle === 'monthly' && p.category === 'regular');
  if (!monthly.length) return null;
  return Math.min(...monthly.map((p) => p.effectivePayable ?? p.originalPrice));
}

export function getBrandMinAnnualLite(brand: BrandData): number | null {
  const lite = brand.plans.filter((p) => p.category === 'annual_lite');
  if (!lite.length) return null;
  return Math.min(...lite.map((p) => p.originalPrice));
}
