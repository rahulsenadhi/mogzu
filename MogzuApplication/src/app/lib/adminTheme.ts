/** Mogzu admin console — shared with AdminLayout, AdminDashboardPage, etc. */
/**
 * Landing-aligned palette (see LandingPage.tsx).
 * Keep a professional corporate base (blue/slate/white) and apply Mogzu colors subtly.
 */
export const CORP = {
  /** Mogzu landing pink — accents only */
  brandRose: '#EE2A7B',
  /** Soft pink wash for low-contrast highlights */
  brandRoseSoft: '#FCE7F2',
  /** Mogzu landing mint — success hints */
  brandMint: '#15D39D',
  /** Soft mint wash for neutral chips/surfaces */
  brandMintSoft: '#E8FAF3',
  /** Mogzu landing navy — headings */
  titleNavy: '#0e1e3f',
  /** Warm canvas — blend into page gradients only */
  canvasWarm: '#FFFDF9',
  /** Secondary accent — spare use (e.g. quick-action icon) */
  brandViolet: '#9B51E0',
  /** Tiny highlights only */
  brandSun: '#FFD100',
  brandOrange: '#FF5E00',

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  orange: '#FA8D40',
  teal: '#14B8A6',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#EAB308',
  slateText: '#64748B',
  slateTitle: '#0F172A',
  border: '#E2E8F0',
  /** Default admin page wash (gradient start) */
  pageCanvas: '#F4F7FE',
  bg: '#F8F9FB',
  card: '#FFFFFF',
  chartYellow: '#EAB308',
  chartOrange: '#FB923C',
  chartTeal: '#2DD4BF',
} as const;
