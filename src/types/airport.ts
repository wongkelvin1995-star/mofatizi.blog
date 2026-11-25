export type BillingCycle =
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'biennial'
  | 'triennial'
  | 'one_time';

export type PlanCategory = 'regular' | 'annual_lite' | 'one_time' | 'dedicated';

export type CouponEvidenceLevel =
  | 'brand_public'
  | 'third_party_verified'
  | 'third_party_recorded'
  | 'user_submitted_partial'
  | 'historical_archived';

export interface CouponInfo {
  id: string;
  brandSlug: string;
  brandName: string;
  code: string;
  activityName: string;
  discountMultiplier: number | null;
  discountLabel: string;
  calculable: boolean;
  applicablePlansText: string;
  excludedPlanCategories?: PlanCategory[];
  excludedPlanNames?: string[];
  userEligibility: string;
  renewalRule: string;
  stackableNote: string;
  validPeriodText: string;
  status: 'active' | 'unconfirmed_rate' | 'historical';
  evidenceLevel: CouponEvidenceLevel;
  evidenceNote: string;
  howToUse: string[];
  lastCheckedDate: string;
  conflictNote?: string;
}

export interface PlanRecord {
  id: string;
  brandSlug: string;
  brandName?: string;
  brandRank?: number;
  planName: string;
  category: PlanCategory;
  cycle: BillingCycle;
  cycleLabel: string;
  cycleMonths: number | null;
  originalPrice: number;
  discountedPrice?: number | null;
  effectivePayable?: number;
  monthlyAvg?: number | null;
  costPerGB?: number | null;
  couponCode?: string | null;
  couponLabel?: string | null;
  monthlyTrafficGB: number | null;
  totalPeriodGB: number | null;
  resetRule: string;
  multiplierNote: string;
  speedLimit: string;
  deviceLimit: string;
  lineTags: string[];
  notes: string;
  recordDate: string;
  verificationLevel: 'verified' | 'historical_ref';
  couponEligible: boolean;
}

export interface ClientCompatibility {
  platform: string;
  supportStatus: string;
  condition: string;
}

export interface BrandFaq {
  question: string;
  answer: string;
}

export interface BrandSourceRef {
  label: string;
  url?: string;
  date: string;
  note: string;
}

export type ClashSupportStatus =
  | 'verified_tutorial'
  | 'conditional_apply'
  | 'official_only'
  | 'paused_third_party'
  | 'unconfirmed';

export interface BrandData {
  slug: string;
  rank: number;
  badge: string;
  featuredOnHome: boolean;
  selectionReason: string;
  clashSupportStatus: ClashSupportStatus;
  clashBadge: string;
  hasOfficialClient: boolean;
  confirmedThirdParty: boolean;
  confirmedClash: boolean;
  name: string;
  englishName: string;
  aliases: string[];
  tagline: string;
  summary: string;
  positioning: string;
  officialSiteUrl?: string;
  officialSiteNote?: string;
  affLink: string;
  affCode: string;
  establishedNote: string;
  paymentMethods: string[];
  protocols: string[];
  lineTypes: string[];
  nodeRegions: string[];
  nodeCountNote?: string;
  deviceLimitSummary: string;
  trafficResetSummary: string;
  multiplierSummary: string;
  thirdPartySubscriptionPolicy: string;
  clients: ClientCompatibility[];
  aiSupport: { platform: string; note: string }[];
  streamingSupport: { platform: string; note: string }[];
  usageScenarios: ('daily' | 'ai' | 'streaming' | 'remote_work' | 'gaming' | 'multi_device')[];
  refundAndUpgradePolicy: string;
  customerServiceNote: string;
  pros: string[];
  limitations: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  priceSourceNote: string;
  priceConflictNote?: string;
  priceRecordDate: string;
  lastUpdatedDate: string;
  plans: PlanRecord[];
  coupons: CouponInfo[];
  faqs: BrandFaq[];
  sources: BrandSourceRef[];
}

export interface ClientProfile {
  clientId: string;
  clientName: string;
  aliases: string[];
  tagline: string;
  officialSource: string;
  releasesUrl: string;
  docsUrl?: string;
  coreEngine: string;
  techStack: string;
  supportedPlatforms: string[];
  platformPackages: Record<string, string>;
  supportedConfigTypes: string[];
  categories: string[];
  beginnerFriendly: boolean;
  clientRole: string;
  documentedVersion: string;
  sourceDate: string;
  highlights: string[];
  cautions: string[];
}

export interface BrandClientCompatibilityRecord {
  brandId: string;
  brandName: string;
  clashSupportStatus: ClashSupportStatus;
  clashBadge: string;
  hasOfficialClient: boolean;
  confirmedThirdParty: boolean;
  confirmedClash: boolean;
  platforms: Record<string, string>;
  knownDeviceLimit: string;
  supportedSubscriptionTypes: string[];
  compatibilityEvidence: string;
  applicablePlans: string;
  limitations: string;
  updatedAt: string;
}
