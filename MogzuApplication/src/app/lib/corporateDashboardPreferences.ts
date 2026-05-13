/**
 * Corporate dashboard widget visibility (localStorage, per browser).
 */

export const CORPORATE_DASHBOARD_PREFS_KEY = 'mogzu_corporate_dashboard_widgets_v1';
export const CORPORATE_DASHBOARD_PREFS_CHANGED = 'mogzu-corporate-dashboard-prefs-changed';

export type DashboardWidgetId =
  | 'planBanners'
  | 'promoBanner'
  | 'youMightWantToTry'
  | 'overviewStats'
  | 'budgetVisibility'
  | 'snappyOrderHub'
  | 'recentBookings'
  | 'userRequests'
  | 'upcomingEvents';

export type CorporateDashboardPreferences = Record<DashboardWidgetId, boolean>;

export const DASHBOARD_WIDGET_META: { id: DashboardWidgetId; label: string; description: string }[] = [
  { id: 'planBanners', label: 'Plan banners', description: 'Starter trial and enterprise callouts at the top.' },
  { id: 'promoBanner', label: 'Offers carousel', description: 'Promotional offers and highlights.' },
  { id: 'youMightWantToTry', label: 'You might want to try', description: 'Quick module shortcuts (D Space, Events, Gifting, etc.).' },
  { id: 'overviewStats', label: 'Overview stats', description: 'Bookings, requests, seats, and savings cards.' },
  { id: 'budgetVisibility', label: 'Budget visibility', description: 'Personal, department, and category budget blocks.' },
  {
    id: 'snappyOrderHub',
    label: 'Orders & deliveries hub',
    description: 'Shipment status summary, quick actions, and recent orders.',
  },
  { id: 'recentBookings', label: 'Recent bookings', description: 'Latest booking list with links.' },
  { id: 'userRequests', label: 'User requests', description: 'Pending team requests.' },
  { id: 'upcomingEvents', label: 'Upcoming events', description: 'Calendar-style upcoming events.' },
];

const DEFAULT_PREFS: CorporateDashboardPreferences = {
  planBanners: true,
  promoBanner: true,
  youMightWantToTry: true,
  overviewStats: true,
  budgetVisibility: true,
  snappyOrderHub: true,
  recentBookings: true,
  userRequests: true,
  upcomingEvents: true,
};

function mergePrefs(raw: Partial<Record<string, boolean>> | null): CorporateDashboardPreferences {
  const out = { ...DEFAULT_PREFS };
  if (!raw || typeof raw !== 'object') return out;
  for (const id of Object.keys(DEFAULT_PREFS) as DashboardWidgetId[]) {
    if (typeof raw[id] === 'boolean') out[id] = raw[id];
  }
  return out;
}

export function getCorporateDashboardPreferences(): CorporateDashboardPreferences {
  try {
    const raw = localStorage.getItem(CORPORATE_DASHBOARD_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return mergePrefs(JSON.parse(raw) as Partial<Record<string, boolean>>);
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function setCorporateDashboardPreferences(next: CorporateDashboardPreferences) {
  const merged = mergePrefs(next);
  try {
    localStorage.setItem(CORPORATE_DASHBOARD_PREFS_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CORPORATE_DASHBOARD_PREFS_CHANGED, { detail: merged }));
}

export function subscribeCorporateDashboardPreferences(cb: (p: CorporateDashboardPreferences) => void) {
  const handler = () => cb(getCorporateDashboardPreferences());
  window.addEventListener(CORPORATE_DASHBOARD_PREFS_CHANGED, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CORPORATE_DASHBOARD_PREFS_CHANGED, handler);
    window.removeEventListener('storage', handler);
  };
}
