const WISHLIST_KEY = 'mogzu_listing_wishlist_ids_v1';
const COMPARE_KEY = 'mogzu_listing_compare_ids_v1';

export const LISTING_SESSION_CHANGED_EVENT = 'mogzu-listing-session-changed';

type WishlistStore = { ids: string[]; savedAt: Record<string, number> };

function emitListingSessionChanged(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(LISTING_SESSION_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

function readIds(key: string): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(ids));
    emitListingSessionChanged();
  } catch {
    // ignore storage failures in demo mode
  }
}

function readWishlistStore(): WishlistStore {
  if (typeof localStorage === 'undefined') return { ids: [], savedAt: {} };
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return { ids: [], savedAt: {} };
    const p = JSON.parse(raw) as unknown;
    if (Array.isArray(p)) {
      const ids = p.filter((x): x is string => typeof x === 'string');
      const now = Date.now();
      const savedAt: Record<string, number> = {};
      ids.forEach((id, i) => {
        savedAt[id] = now - (ids.length - i) * 60_000;
      });
      const store: WishlistStore = { ids, savedAt };
      writeWishlistStore(store);
      return store;
    }
    if (p && typeof p === 'object' && Array.isArray((p as WishlistStore).ids)) {
      const ws = p as WishlistStore;
      return {
        ids: ws.ids.filter((x): x is string => typeof x === 'string'),
        savedAt: ws.savedAt && typeof ws.savedAt === 'object' ? { ...ws.savedAt } : {},
      };
    }
  } catch {
    /* ignore */
  }
  return { ids: [], savedAt: {} };
}

function writeWishlistStore(store: WishlistStore): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(store));
    emitListingSessionChanged();
  } catch {
    // ignore
  }
}

/** Ordered ids (newest append). */
export function getWishlistIds(): string[] {
  return readWishlistStore().ids;
}

export function getWishlistSavedAt(): Record<string, number> {
  return { ...readWishlistStore().savedAt };
}

export function addWishlistId(id: string): string[] {
  const s = readWishlistStore();
  if (s.ids.includes(id)) return s.ids;
  const now = Date.now();
  const ids = [...s.ids, id];
  const savedAt = { ...s.savedAt, [id]: now };
  writeWishlistStore({ ids, savedAt });
  return ids;
}

export function removeWishlistId(id: string): string[] {
  const s = readWishlistStore();
  const ids = s.ids.filter((x) => x !== id);
  const savedAt = { ...s.savedAt };
  delete savedAt[id];
  writeWishlistStore({ ids, savedAt });
  return ids;
}

export function clearWishlist(): void {
  writeWishlistStore({ ids: [], savedAt: {} });
}

export function toggleWishlistId(id: string): string[] {
  const s = readWishlistStore();
  if (s.ids.includes(id)) {
    return removeWishlistId(id);
  }
  return addWishlistId(id);
}

export function getCompareIds(): string[] {
  return readIds(COMPARE_KEY);
}

export function toggleCompareId(id: string, max = 3): { ids: string[]; added: boolean; blocked: boolean } {
  const current = getCompareIds();
  if (current.includes(id)) {
    const next = current.filter((x) => x !== id);
    writeIds(COMPARE_KEY, next);
    return { ids: next, added: false, blocked: false };
  }
  if (current.length >= max) return { ids: current, added: false, blocked: true };
  const next = [...current, id];
  writeIds(COMPARE_KEY, next);
  return { ids: next, added: true, blocked: false };
}

export function addCompareId(id: string, max = 3): { ids: string[]; added: boolean; blocked: boolean } {
  return toggleCompareId(id, max);
}

export function removeCompareId(id: string): string[] {
  const next = getCompareIds().filter((x) => x !== id);
  writeIds(COMPARE_KEY, next);
  return next;
}

export function clearCompareIds(): void {
  writeIds(COMPARE_KEY, []);
}

/** Subscribe to same-tab updates and cross-tab `storage` for listing keys. */
export function subscribeListingSession(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === WISHLIST_KEY || e.key === COMPARE_KEY) onChange();
  };
  window.addEventListener(LISTING_SESSION_CHANGED_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(LISTING_SESSION_CHANGED_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
