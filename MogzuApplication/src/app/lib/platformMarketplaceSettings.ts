/**
 * Platform-wide marketplace visibility for corporate users (demo: localStorage).
 * Admin toggles modules and simulates vendor counts vs listing thresholds.
 */

export const PLATFORM_MARKETPLACE_STORAGE_KEY = 'mogzu_platform_marketplace_v1';

export const PLATFORM_MARKETPLACE_CHANGED_EVENT = 'mogzu-platform-marketplace-changed';

export type MarketplaceModuleKey = 'gifting' | 'events' | 'dSpace' | 'heyGenie';

/** Activity Suite card `id` → platform module (null = not gated, e.g. assistant). */
export const ACTIVITY_SUITE_ID_TO_MODULE: Record<string, MarketplaceModuleKey | null> = {
  spacex: 'dSpace',
  event: 'events',
  gifting: 'gifting',
  heygenie: 'heyGenie',
  assistant: null,
};

export type ListingGate = {
  enabled: boolean;
  minVendorsForListing: number;
  /** Demo: replace with API-backed counts later */
  activeVendorCount: number;
};

export type PlatformMarketplaceSettings = {
  modules: Record<MarketplaceModuleKey, ListingGate>;
  subGates: Record<string, ListingGate>;
};

export const DEFAULT_SUB_KEYS = [
  'hey_genie_suppliers',
  'hey_genie_vendors',
  'events_venues',
  'dspace_coworking',
] as const;

function defaultGate(partial?: Partial<ListingGate>): ListingGate {
  return {
    enabled: true,
    minVendorsForListing: 3,
    activeVendorCount: 0,
    ...partial,
  };
}

export function getDefaultPlatformMarketplaceSettings(): PlatformMarketplaceSettings {
  const modules: Record<MarketplaceModuleKey, ListingGate> = {
    gifting: defaultGate({ activeVendorCount: 5 }),
    events: defaultGate({ activeVendorCount: 5 }),
    dSpace: defaultGate({ activeVendorCount: 5 }),
    /** Off by default: no Hey Genie tile until admin enables the module. */
    heyGenie: defaultGate({ enabled: false, activeVendorCount: 0 }),
  };
  const subGates: Record<string, ListingGate> = {};
  for (const k of DEFAULT_SUB_KEYS) {
    subGates[k] = defaultGate({ activeVendorCount: 0 });
  }
  return { modules, subGates };
}

function mergeWithDefaults(raw: Partial<PlatformMarketplaceSettings> | null): PlatformMarketplaceSettings {
  const base = getDefaultPlatformMarketplaceSettings();
  if (!raw || typeof raw !== 'object') return base;
  const modules = { ...base.modules };
  const mk: MarketplaceModuleKey[] = ['gifting', 'events', 'dSpace', 'heyGenie'];
  for (const key of mk) {
    const g = raw.modules?.[key];
    if (g && typeof g === 'object') {
      modules[key] = {
        enabled: typeof g.enabled === 'boolean' ? g.enabled : base.modules[key].enabled,
        minVendorsForListing:
          typeof g.minVendorsForListing === 'number' && g.minVendorsForListing >= 0
            ? g.minVendorsForListing
            : base.modules[key].minVendorsForListing,
        activeVendorCount:
          typeof g.activeVendorCount === 'number' && g.activeVendorCount >= 0
            ? g.activeVendorCount
            : base.modules[key].activeVendorCount,
      };
    }
  }
  const subGates = { ...base.subGates, ...(raw.subGates && typeof raw.subGates === 'object' ? raw.subGates : {}) };
  for (const k of DEFAULT_SUB_KEYS) {
    if (!subGates[k]) subGates[k] = defaultGate();
    else {
      const g = subGates[k];
      subGates[k] = {
        enabled: typeof g.enabled === 'boolean' ? g.enabled : true,
        minVendorsForListing:
          typeof g.minVendorsForListing === 'number' && g.minVendorsForListing >= 0 ? g.minVendorsForListing : 3,
        activeVendorCount:
          typeof g.activeVendorCount === 'number' && g.activeVendorCount >= 0 ? g.activeVendorCount : 0,
      };
    }
  }
  return { modules, subGates };
}

export function getPlatformMarketplaceSettings(): PlatformMarketplaceSettings {
  try {
    const raw = localStorage.getItem(PLATFORM_MARKETPLACE_STORAGE_KEY);
    if (!raw) return getDefaultPlatformMarketplaceSettings();
    const parsed = JSON.parse(raw) as Partial<PlatformMarketplaceSettings>;
    return mergeWithDefaults(parsed);
  } catch {
    return getDefaultPlatformMarketplaceSettings();
  }
}

export function setPlatformMarketplaceSettings(next: PlatformMarketplaceSettings) {
  const merged = mergeWithDefaults(next);
  try {
    localStorage.setItem(PLATFORM_MARKETPLACE_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(PLATFORM_MARKETPLACE_CHANGED_EVENT, { detail: merged }));
}

/** Module is “live” for full browse/listing UX */
export function isModuleLive(key: MarketplaceModuleKey): boolean {
  const g = getPlatformMarketplaceSettings().modules[key];
  return g.enabled && g.activeVendorCount >= g.minVendorsForListing;
}

/** Sub-market (e.g. Hey Genie suppliers) live for listings */
export function isSubGateLive(id: string): boolean {
  const g = getPlatformMarketplaceSettings().subGates[id];
  if (!g) return false;
  return g.enabled && g.activeVendorCount >= g.minVendorsForListing;
}

export type ModuleCorporateState = 'hidden' | 'coming_soon' | 'live';

export function getModuleCorporateState(key: MarketplaceModuleKey): ModuleCorporateState {
  const g = getPlatformMarketplaceSettings().modules[key];
  if (!g.enabled) return 'hidden';
  if (g.activeVendorCount >= g.minVendorsForListing) return 'live';
  return 'coming_soon';
}

export function subscribePlatformMarketplaceSettings(cb: (s: PlatformMarketplaceSettings) => void) {
  const handler = () => cb(getPlatformMarketplaceSettings());
  window.addEventListener(PLATFORM_MARKETPLACE_CHANGED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PLATFORM_MARKETPLACE_CHANGED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getSubGateLabel(id: string): string {
  const labels: Record<string, string> = {
    hey_genie_suppliers: 'Hey Genie — Suppliers',
    hey_genie_vendors: 'Hey Genie — Vendors',
    events_venues: 'Events — Venues',
    dspace_coworking: 'D Space — Coworking',
  };
  return labels[id] ?? id;
}
