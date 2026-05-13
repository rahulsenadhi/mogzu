import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  Flag,
  Trash2,
  GraduationCap,
  Palette,
  Gamepad2,
  HeartPulse,
  Mic2,
  PartyPopper,
  HandHeart,
  Utensils,
  Monitor,
  Paintbrush,
  Shield,
  Car,
  Cpu,
  FileBadge2,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminListingGallery from '@/app/components/admin/AdminListingGallery';
import AdminListingStatusBadge from '@/app/components/admin/AdminListingStatusBadge';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { Checkbox } from '@/app/components/ui/checkbox';
import { GhostCTAButton } from '@/app/components/ui/ListingButtons';
import { findAdminListingById, updateMogzuDirectListingInStore, updatePartnerListingInStore } from '@/app/lib/adminListingResolve';
import type { AdminResolvedListing } from '@/app/lib/adminListingResolve';
import type { ListingAvailabilitySlot, ListingReview, MogzuDirectListing, PartnerListing } from '@/app/lib/mogzuDomain';
import { loadPartnerUsers } from '@/app/lib/mogzuDomain';
import AdminListingActionPanel from '@/app/pages/admin/AdminListingActionPanel';

function categoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes('workshop') || c.includes('training')) return GraduationCap;
  if (c.includes('art') || c.includes('creativity')) return Palette;
  if (c.includes('virtual') || c.includes('game')) return Gamepad2;
  if (c.includes('wellness')) return HeartPulse;
  if (c.includes('entertainment') || c.includes('music')) return Mic2;
  if (c.includes('party') || c.includes('themed')) return PartyPopper;
  if (c.includes('csr')) return HandHeart;
  if (c.includes('catering')) return Utensils;
  if (c.includes('audio') || c.includes('visual')) return Monitor;
  if (c.includes('design') || c.includes('decor')) return Paintbrush;
  if (c.includes('security')) return Shield;
  if (c.includes('transport')) return Car;
  if (c.includes('technology')) return Cpu;
  if (c.includes('license') || c.includes('permit')) return FileBadge2;
  return GraduationCap;
}

function pricingTypeLabel(t: string | undefined): string {
  if (t === 'transparent') return 'Transparent';
  if (t === 'offer_price') return 'Offer price';
  if (t === 'request_for_price') return 'Request for price';
  return t ?? '—';
}

function priceTypeLabel(t: string | undefined): string {
  if (!t) return '—';
  return t.replace(/_/g, ' ');
}

function buildNext14DaysSlots(slots: ListingAvailabilitySlot[] | undefined): ListingAvailabilitySlot[] {
  const out: ListingAvailabilitySlot[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const byDate = new Map((slots ?? []).map((s) => [s.date.slice(0, 10), s]));
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const found = Array.from(byDate.entries()).find(([k]) => k.startsWith(iso.slice(0, 10)) || k === iso);
    if (found) {
      out.push(found[1]);
    } else {
      out.push({
        date: iso,
        start_time: '09:00',
        end_time: '18:00',
        slots_available: i % 3 === 0 ? 0 : 4 + (i % 4),
      });
    }
  }
  return out;
}

function mockReviewsIfEmpty(listing: PartnerListing | MogzuDirectListing): ListingReview[] {
  if (listing.reviews && listing.reviews.length > 0) return listing.reviews;
  return [
    {
      id: 'm1',
      reviewer_name: 'Priya Sharma',
      company: 'Acme Corp',
      rating: 5,
      comment: 'Excellent execution and communication throughout.',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'm2',
      reviewer_name: 'Rahul Verma',
      company: 'Northwind',
      rating: 4,
      comment: 'Great value; would book again.',
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];
}

export default function AdminListingDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const found = useMemo(() => (idParam ? findAdminListingById(idParam) : null), [idParam]);
  const [resolved, setResolved] = useState<AdminResolvedListing | null>(found);

  useEffect(() => {
    setResolved(idParam ? findAdminListingById(idParam) : null);
  }, [idParam]);

  if (!idParam) {
    return (
      <div className="text-sm text-slate-600">
        Invalid id. <Link to="/admin/listings" className="text-[#2563EB] font-semibold">Back to listings</Link>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
        Listing not found.
        <Link to="/admin/listings" className="text-[#2563EB] font-semibold">Back to listings</Link>
      </div>
    );
  }

  return (
    <AdminListingDetailInner
      resolved={resolved}
      onResolvedChange={setResolved}
      navigate={navigate}
    />
  );
}

function AdminListingDetailInner({
  resolved,
  onResolvedChange,
  navigate,
}: {
  resolved: AdminResolvedListing;
  onResolvedChange: (r: AdminResolvedListing) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const listing = resolved.listing;
  const [reviews, setReviews] = useState<ListingReview[]>(() => mockReviewsIfEmpty(listing));
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagSel, setFlagSel] = useState<boolean[]>(() => listing.images.map(() => false));
  const [flagReason, setFlagReason] = useState('');

  const partnerName = useMemo(() => {
    if (resolved.kind === 'partner') {
      const u = loadPartnerUsers().find((p) => p.id === listing.partner_id);
      return u?.business_name ?? u?.name ?? listing.partner_id;
    }
    return listing.vendor_name ?? 'Mogzu';
  }, [resolved.kind, listing]);

  const submissionDate = listing.submission_date ?? listing.created_at;
  const lastModified = listing.updated_at;
  const vendorIdDisplay =
    resolved.kind === 'mogzu_direct' || listing.listing_source === 'mogzu_direct'
      ? listing.vendor_id ?? 'Mogzu Direct'
      : resolved.kind === 'partner'
        ? listing.partner_id
        : '—';

  const listingKindLabel = listing.listing_kind
    ? listing.listing_kind === 'activities'
      ? 'Activities'
      : 'Services'
    : listing.module === 'events'
      ? 'Activities'
      : 'Services';

  const locationTypeLabel =
    listing.location_type === 'virtual'
      ? 'Virtual'
      : listing.location_type === 'hybrid'
        ? 'Hybrid'
        : 'On-Site';

  const tableSlots = buildNext14DaysSlots(listing.availability_slots);

  const persistReviews = (next: ListingReview[]) => {
    setReviews(next);
    if (resolved.kind === 'partner') {
      const p = { ...resolved.listing, reviews: next, updated_at: new Date().toISOString() } as PartnerListing;
      updatePartnerListingInStore(p);
      onResolvedChange({ kind: 'partner', listing: p });
    } else {
      const m = { ...resolved.listing, reviews: next, updated_at: new Date().toISOString() } as MogzuDirectListing;
      updateMogzuDirectListingInStore(m);
      onResolvedChange({ kind: 'mogzu_direct', listing: m });
    }
  };

  const handleRemoveReview = (idx: number) => {
    if (!window.confirm('Remove this review?')) return;
    const next = reviews.filter((_, i) => i !== idx);
    persistReviews(next);
    toast.success('Review removed.');
  };

  const handleFlagReview = (idx: number) => {
    const next = reviews.map((r, i) => (i === idx ? { ...r, flagged: true } : r));
    persistReviews(next);
    toast.success('Review flagged.');
  };

  const CatIcon = categoryIcon(listing.category);

  const auditEntries = useMemo(
    () => [
      { icon: 'status', text: `Status is ${listing.status}`, at: lastModified },
      { icon: 'edit', text: 'Listing metadata synchronized', at: submissionDate },
      { icon: 'note', text: 'Submission recorded', at: submissionDate },
      ...(listing.approval_date
        ? [{ icon: 'ok', text: 'Approved and set live', at: listing.approval_date }]
        : []),
      { icon: 'view', text: 'Admin view access', at: new Date().toISOString() },
    ],
    [listing, lastModified, submissionDate],
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,35%)] lg:gap-8 lg:items-start">
      <div className="space-y-6 min-w-0">
        <div>
          <Link
            to="/admin/listings"
            className="text-sm font-medium text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            ← All Listings
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-[length:var(--text-xl)] font-semibold text-slate-900">{listing.title}</h1>
            <AdminListingStatusBadge status={listing.status} />
            {listing.listing_source === 'mogzu_direct' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-900 border border-teal-100 px-2.5 py-0.5 text-xs font-semibold">
                <MogzuLogo variant="mark" className="h-3.5 w-auto" />
                Mogzu Direct
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="relative rounded-lg px-4 py-3 text-sm text-slate-800"
          style={{ backgroundColor: 'var(--color-warning-highlight)' }}
        >
          <span
            className="pointer-events-none absolute top-2 right-3 text-[12px] uppercase tracking-[1px] font-medium"
            style={{ color: 'var(--color-warning)', opacity: 0.6 }}
          >
            Admin view
          </span>
          <div className="flex flex-wrap gap-4 pr-24">
            <div>
              <span className="text-xs text-slate-600 block">Submitted</span>
              <span className="font-medium">{new Date(submissionDate).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-slate-600 block">Vendor ID</span>
              <span className="font-medium">{vendorIdDisplay}</span>
            </div>
            <div>
              <span className="text-xs text-slate-600 block">Listing ID</span>
              <span className="font-medium font-mono text-xs">{listing.id}</span>
            </div>
            <div>
              <span className="text-xs text-slate-600 block">Last Modified</span>
              <span className="font-medium">{new Date(lastModified).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <AdminListingGallery images={listing.images.length ? listing.images : ['https://placehold.co/800x400?text=No+image']} title={listing.title} />

        <div
          className="rounded-lg px-3 py-2 text-xs text-slate-800 space-y-1"
          style={{ backgroundColor: 'var(--color-warning-highlight)' }}
        >
          <p>
            Images are moderated for policy compliance. Flag any image that violates content guidelines.
          </p>
          <button
            type="button"
            className="text-[#2563EB] font-semibold hover:underline"
            onClick={() => {
              setFlagSel(listing.images.map(() => false));
              setFlagOpen(true);
            }}
          >
            Flag Images
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Overview</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Row label="Category" value={<span className="inline-flex items-center gap-1"><CatIcon className="size-4 text-[#2563EB]" />{listing.category}</span>} />
            <Row label="Type" value={listingKindLabel} />
            <Row label="Location Type" value={locationTypeLabel} />
            <Row label="City" value={listing.city ?? '—'} />
            <Row label="Language(s)" value={(listing.languages ?? ['English', 'Hindi']).join(', ')} />
            <Row label="Description" valueClass="sm:col-span-2" value={<span className="whitespace-pre-wrap">{listing.description_long}</span>} />
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-xs mb-1">Tags</span>
              <div className="flex flex-wrap gap-1">
                {(listing.tags ?? ['Corporate', 'Team', 'Premium']).map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pricing (admin full view)</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Row label="Pricing Type" value={<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">{pricingTypeLabel(listing.pricing_type)}</span>} />
            <Row label="Price Type" value={priceTypeLabel(listing.price_type ?? listing.price_unit)} />
            {listing.pricing_type === 'transparent' ? (
              <>
                <Row label="Base Price" value={`Rs ${(listing.base_price ?? listing.price).toLocaleString('en-IN')} / ${priceTypeLabel(listing.price_type ?? listing.price_unit)}`} />
                <Row
                  label="Packages"
                  valueClass="sm:col-span-2"
                  value={
                    listing.price_packages?.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {listing.price_packages.map((p) => (
                          <li key={p.name}>
                            {p.name} — Rs {p.price.toLocaleString('en-IN')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )
                  }
                />
              </>
            ) : null}
            {listing.pricing_type === 'offer_price' ? (
              <>
                <Row label="Starting Price" value={`Rs ${(listing.starting_price ?? listing.price).toLocaleString('en-IN')} / ${priceTypeLabel(listing.price_type ?? listing.price_unit)}`} />
                <Row
                  label="Minimum Accept"
                  value={
                    <span className="rounded px-2 py-px" style={{ backgroundColor: 'var(--color-warning-highlight)' }}>
                      Rs {listing.min_acceptable_offer?.toLocaleString('en-IN') ?? '—'}{' '}
                      <span className="text-xs text-amber-800 block">Not shown to clients</span>
                    </span>
                  }
                />
                <Row label="Offer Validity" value={`${listing.offer_validity_hours ?? 48} hours`} />
              </>
            ) : null}
            {listing.pricing_type === 'request_for_price' ? (
              <Row label="Response Time" value={`${listing.response_time_hours ?? 24} hours`} />
            ) : null}
          </dl>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-600">
                  <th className="p-2">Add-on</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {(listing.add_ons ?? [{ name: 'Extended hours', price: 5000 }]).map((a, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.price != null ? `Rs ${a.price.toLocaleString('en-IN')}` : 'Negotiable'}</td>
                    <td className="p-2">Add-on</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Availability</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-600">
                  <th className="p-2">Date</th>
                  <th className="p-2">Start</th>
                  <th className="p-2">End</th>
                  <th className="p-2">Slots Available</th>
                </tr>
              </thead>
              <tbody>
                {tableSlots.map((row) => (
                  <tr
                    key={row.date + row.start_time}
                    className="border-t border-slate-100"
                    style={
                      row.slots_available === 0 ? { backgroundColor: 'var(--color-error-highlight)' } : undefined
                    }
                  >
                    <td className="p-2">{row.date}</td>
                    <td className="p-2">{row.start_time}</td>
                    <td className="p-2">{row.end_time}</td>
                    <td className="p-2">
                      {row.slots_available === 0 ? (
                        <span className="rounded-full bg-rose-100 text-rose-800 text-xs px-2 py-0.5 font-semibold">Full</span>
                      ) : (
                        row.slots_available
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="space-y-3 rounded-xl border border-slate-200 p-4"
          style={{ backgroundColor: 'var(--color-surface-offset)' }}
        >
          <div
            className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded inline-block"
            style={{ backgroundColor: 'var(--color-warning-highlight)', color: 'var(--color-warning)' }}
          >
            Vendor details — admin only
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Row label="Vendor Name" value={partnerName} />
            <Row label="Vendor ID" value={listing.vendor_id ?? (resolved.kind === 'mogzu_direct' ? 'Mogzu Internal' : listing.partner_id)} />
            <Row label="Verified" value={listing.vendor_verified ? '✓ Yes' : '— No'} />
            <Row label="Rating" value={`★ ${listing.vendor_rating?.toFixed(1) ?? '—'}`} />
            <Row label="Member Since" value={new Date(listing.created_at).toLocaleDateString()} />
            <Row label="Total Listings" value={String(12 + (listing.id.length % 5))} />
            <Row label="Total Bookings" value={String(48 + (listing.id.length % 12))} />
          </dl>
          <button
            type="button"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
            onClick={() => {
              navigate('/admin/vendors');
            }}
          >
            View Vendor Profile →
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Reviews</h2>
          <ul className="space-y-3">
            {reviews.map((rev, idx) => (
              <li key={rev.id ?? idx} className="border border-slate-200 rounded-lg p-3 flex gap-3 justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{rev.reviewer_name}</span>
                    <span className="text-xs text-slate-500">{rev.company}</span>
                    {rev.flagged ? (
                      <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Flagged</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">{new Date(rev.date).toLocaleDateString()} · ★ {rev.rating}</p>
                  <p className="text-sm text-slate-700 mt-1">{rev.comment}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Remove review"
                    onClick={() => handleRemoveReview(idx)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                    aria-label="Flag review"
                    onClick={() => handleFlagReview(idx)}
                  >
                    <Flag className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Activity log</h2>
          <ul className="space-y-3">
            {auditEntries.slice(0, 5).map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <Star className="size-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-800">{e.text}</p>
                  <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(e.at), { addSuffix: true })} · Admin</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
            onClick={() => toast('Full audit log coming soon.')}
          >
            View Full Log →
          </button>
        </section>
      </div>

      <div className="mt-8 lg:mt-0 lg:sticky lg:top-4 lg:self-start space-y-4">
        <AdminListingActionPanel resolved={resolved} onResolvedChange={onResolvedChange} />
      </div>

      {flagOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
            <h3 className="text-lg font-semibold">Flag images</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {listing.images.map((src, i) => (
                <label key={src + i} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={flagSel[i]}
                    onCheckedChange={(c) =>
                      setFlagSel((prev) => {
                        const n = [...prev];
                        n[i] = c === true;
                        return n;
                      })
                    }
                  />
                  <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
                  Image {i + 1}
                </label>
              ))}
            </div>
            <label className="block text-sm font-medium">Reason for flagging</label>
            <textarea
              required
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <GhostCTAButton onClick={() => setFlagOpen(false)}>Cancel</GhostCTAButton>
              <button
                type="button"
                disabled={!flagReason.trim() || !flagSel.some(Boolean)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] disabled:opacity-50"
                onClick={() => {
                  toast.success('Images flagged for review.');
                  setFlagOpen(false);
                }}
              >
                Submit Flags
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className={valueClass}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium">{value}</dd>
    </div>
  );
}
