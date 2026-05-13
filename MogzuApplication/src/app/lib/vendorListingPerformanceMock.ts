export type DateRangeChip = '7d' | '30d' | '90d' | 'all';

export type PerformanceBundle = {
  views: number;
  wishlisted: number;
  bookingRequests: number;
  conversionPct: number;
  viewsTrend: number;
  wishTrend: number;
  reqTrend: number;
  convTrend: number;
  responseHours: number;
  breakdown: { transparent: number; offer: number; request: number };
  peakLabel: string;
  peakCount: number;
  chart: Array<{ label: string; value: number; date?: string }>;
  addOns: Array<{ name: string; count: number; pct: number }>;
  reviews: Array<{ name: string; company: string; stars: number; text: string; date: string }>;
};

const seed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export function getPerformanceMock(listingId: string, range: DateRangeChip): PerformanceBundle {
  const base = seed(listingId);
  const mult =
    range === '7d' ? 0.22 : range === '30d' ? 1 : range === '90d' ? 2.6 : 4.2;
  const views = Math.round((420 + (base % 800)) * mult);
  const wishlisted = Math.round((28 + (base % 120)) * mult);
  const bookingRequests = Math.round((12 + (base % 45)) * mult);
  const conversionPct = Math.min(99, Math.round((bookingRequests / Math.max(views, 1)) * 100 * 100) / 100);

  const chart: Array<{ label: string; value: number; date?: string }> = [];
  if (range === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chart.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        value: Math.round(30 + ((base + i * 17) % 90)),
        date: d.toISOString(),
      });
    }
  } else if (range === '30d') {
    for (let w = 0; w < 5; w++) {
      chart.push({
        label: `W${w + 1}`,
        value: Math.round(120 + ((base + w * 31) % 200)),
      });
    }
  } else if (range === '90d') {
    for (let w = 0; w < 12; w++) {
      chart.push({
        label: `W${w + 1}`,
        value: Math.round(200 + ((base + w * 7) % 350)),
      });
    }
  } else {
    for (let m = 0; m < 8; m++) {
      chart.push({
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][m % 8],
        value: Math.round(800 + ((base + m * 13) % 1200)),
      });
    }
  }

  const peak = chart.length ? chart.reduce((a, b) => (b.value > a.value ? b : a), chart[0]) : { label: '', value: 0, date: undefined };
  const t = range === '7d' ? 12 : range === '30d' ? 5 : range === '90d' ? 8 : 2;
  const tr = (base % 7) - 2;

  const transparent = 4 + (base % 8);
  const offer = 3 + (base % 6);
  const request = 2 + (base % 5);

  return {
    views,
    wishlisted,
    bookingRequests,
    conversionPct,
    viewsTrend: t + tr,
    wishTrend: 5 + (base % 3),
    reqTrend: 8 + (base % 4),
    convTrend: 2 + (base % 2),
    responseHours: 6 + (base % 55),
    breakdown: { transparent, offer, request },
    peakLabel: peak.date
      ? new Date(peak.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
      : peak.label,
    peakCount: peak.value,
    chart,
    addOns: (() => {
      const a = 18 + (base % 12);
      const b = 12 + (base % 9);
      const c = 9 + (base % 7);
      const m = Math.max(a, b, c, 1);
      return [
        { name: 'AV package', count: a, pct: a / m },
        { name: 'Catering add-on', count: b, pct: b / m },
        { name: 'Extra hours', count: c, pct: c / m },
      ];
    })(),
    reviews: [
      {
        name: 'Priya N.',
        company: 'Northwind Labs',
        stars: 5,
        text: 'Smooth booking and great communication. The team loved the setup and the host was proactive with changes.',
        date: 'Mar 2, 2026',
      },
      {
        name: 'Daniel K.',
        company: 'Brightline Finance',
        stars: 4,
        text: 'Good experience overall. Would appreciate faster quote turnaround next time.',
        date: 'Feb 18, 2026',
      },
    ],
  };
}

export function responseTimeBadge(hours: number): { label: string; className: string } {
  if (hours <= 12) return { label: 'Excellent', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  if (hours <= 24) return { label: 'Good', className: 'bg-amber-100 text-amber-900 border border-amber-200' };
  if (hours <= 48) return { label: 'Needs Improvement', className: 'bg-orange-100 text-orange-900 border border-orange-200' };
  return { label: 'Slow — Improve this', className: 'bg-red-100 text-red-800 border border-red-200' };
}
