import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import AdminListingStatusBadge from '@/app/components/admin/AdminListingStatusBadge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Switch } from '@/app/components/ui/switch';
import { GhostCTAButton, SecondaryCTAButton, DestructiveCTAButton } from '@/app/components/ui/ListingButtons';
import type { InternalAdminNote, MogzuDirectListing, PartnerListing } from '@/app/lib/mogzuDomain';
import {
  updateMogzuDirectListingInStore,
  updatePartnerListingInStore,
  type AdminResolvedListing,
} from '@/app/lib/adminListingResolve';

type UiStatus = 'draft' | 'pending' | 'active' | 'paused' | 'rejected' | 'archived';

function toUiStatus(
  kind: AdminResolvedListing['kind'],
  s: PartnerListing['status'] | MogzuDirectListing['status'],
): UiStatus {
  if (s === 'pending_review') return 'pending';
  if (s === 'draft' && kind === 'mogzu_direct') return 'pending';
  if (s === 'draft') return 'draft';
  if (s === 'active') return 'active';
  if (s === 'paused') return 'paused';
  if (s === 'rejected') return 'rejected';
  if (s === 'archived') return 'archived';
  return 'draft';
}

function storageStatusFromUi(
  kind: AdminResolvedListing['kind'],
  u: UiStatus,
): PartnerListing['status'] | MogzuDirectListing['status'] {
  if (u === 'pending') return kind === 'partner' ? 'pending_review' : 'draft';
  return u;
}

const BADGES: Array<'Top Rated' | 'Verified' | 'Popular' | 'New'> = [
  'Top Rated',
  'Verified',
  'Popular',
  'New',
];

export default function AdminListingActionPanel({
  resolved,
  onResolvedChange,
}: {
  resolved: AdminResolvedListing;
  onResolvedChange: (next: AdminResolvedListing) => void;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveChecks, setApproveChecks] = useState([false, false, false, false, false, false]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [notifyReject, setNotifyReject] = useState(true);
  const [badgeEdit, setBadgeEdit] = useState(false);
  const [badgeDraft, setBadgeDraft] = useState<Array<'Top Rated' | 'Verified' | 'Popular' | 'New'>>(() => [
    ...(resolved.listing.badges ?? []),
  ]);
  const [noteText, setNoteText] = useState('');
  const [aliasEdit, setAliasEdit] = useState(false);
  const [aliasValue, setAliasValue] = useState(
    resolved.kind === 'mogzu_direct' ? resolved.listing.mogzu_direct_alias ?? '' : '',
  );

  const listing = resolved.listing;
  const uiStatus = useMemo(() => toUiStatus(resolved.kind, listing.status), [resolved.kind, listing.status]);

  const persistPartner = (p: PartnerListing) => {
    updatePartnerListingInStore(p);
    onResolvedChange({ kind: 'partner', listing: p });
  };
  const persistMogzu = (m: MogzuDirectListing) => {
    updateMogzuDirectListingInStore(m);
    onResolvedChange({ kind: 'mogzu_direct', listing: m });
  };

  const patch = (partial: Record<string, unknown>) => {
    const now = new Date().toISOString();
    if (resolved.kind === 'partner') {
      persistPartner({ ...resolved.listing, ...partial, updated_at: now } as PartnerListing);
    } else {
      persistMogzu({ ...resolved.listing, ...partial, updated_at: now } as MogzuDirectListing);
    }
  };

  const handleApproveConfirm = () => {
    const now = new Date().toISOString();
    patch({
      status: 'active',
      approval_date: now,
      approved_by: 'Admin',
      updated_at: now,
    });
    toast.success('Listing approved and now live.');
    setApproveOpen(false);
    setApproveChecks([false, false, false, false, false, false]);
  };

  const handleRejectConfirm = () => {
    const now = new Date().toISOString();
    patch({
      status: 'rejected',
      rejection_reason: rejectReason,
      rejection_feedback: rejectFeedback,
      rejection_date: now,
    });
    // notifyReject → vendor reject-notification email dispatched by the Resend worker (deferred).
    toast.success('Listing rejected. Vendor notified.');
    setRejectOpen(false);
    setRejectReason('');
    setRejectFeedback('');
  };

  const applyStatusFromDropdown = (next: UiStatus) => {
    if (next === uiStatus) return;
    if (next === 'active' && (uiStatus === 'pending' || listing.status === 'pending_review')) {
      setApproveOpen(true);
      return;
    }
    if (next === 'rejected') {
      setRejectOpen(true);
      return;
    }
    const st = storageStatusFromUi(resolved.kind, next);
    patch({ status: st });
    toast.success('Status updated.');
  };

  const isPendingLike =
    uiStatus === 'pending' || listing.status === 'pending_review' || (resolved.kind === 'mogzu_direct' && listing.status === 'draft');

  const toggleFeatured = (on: boolean) => {
    patch({ featured: on });
    toast(on ? 'Listing marked as featured.' : 'Listing removed from featured.');
  };

  const saveBadges = () => {
    patch({ badges: [...badgeDraft] });
    setBadgeEdit(false);
    toast.success('Badges updated.');
  };

  const addNote = () => {
    const t = noteText.trim();
    if (!t) return;
    const note: InternalAdminNote = {
      id: `note-${Date.now()}`,
      author: 'Admin',
      at: new Date().toISOString(),
      text: t,
    };
    const prev = listing.internal_notes ?? [];
    patch({ internal_notes: [note, ...prev] });
    setNoteText('');
    toast.success('Note saved.');
  };

  const saveAlias = () => {
    patch({ mogzu_direct_alias: aliasValue.trim() || listing.title });
    setAliasEdit(false);
    toast.success('Alias updated.');
  };

  const isMogzuDirectSource =
    resolved.kind === 'mogzu_direct' || listing.listing_source === 'mogzu_direct';

  return (
    <div
      className="rounded-[var(--radius-xl)] border p-[var(--space-6)] space-y-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-600">Current Status</span>
          <select
            className="text-sm rounded-lg border border-slate-200 px-2 py-1 bg-white"
            value={uiStatus}
            onChange={(e) => applyStatusFromDropdown(e.target.value as UiStatus)}
            aria-label="Change status"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="mt-2">
          <AdminListingStatusBadge status={listing.status} size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        {isPendingLike ? (
          <>
            <button
              type="button"
              onClick={() => setApproveOpen(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Approve Listing
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
            >
              Reject Listing
            </button>
          </>
        ) : null}
        {listing.status === 'active' ? (
          <>
            <SecondaryCTAButton className="w-full justify-center" onClick={() => patch({ status: 'paused' })}>
              Pause Listing
            </SecondaryCTAButton>
            <GhostCTAButton className="w-full justify-center" onClick={() => patch({ status: 'archived' })}>
              Archive Listing
            </GhostCTAButton>
          </>
        ) : null}
        {listing.status === 'paused' ? (
          <>
            <button
              type="button"
              onClick={() => patch({ status: 'active' })}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-[#2563EB]"
            >
              Reactivate
            </button>
            <GhostCTAButton className="w-full justify-center" onClick={() => patch({ status: 'archived' })}>
              Archive Listing
            </GhostCTAButton>
          </>
        ) : null}
        {listing.status === 'rejected' ? (
          <>
            <SecondaryCTAButton
              className="w-full justify-center"
              onClick={() => patch({ status: resolved.kind === 'partner' ? 'pending_review' : 'draft' })}
            >
              Move to Pending
            </SecondaryCTAButton>
            <GhostCTAButton className="w-full justify-center" onClick={() => patch({ status: 'archived' })}>
              Archive Listing
            </GhostCTAButton>
          </>
        ) : null}
        {listing.status === 'archived' ? (
          <SecondaryCTAButton className="w-full justify-center" onClick={() => patch({ status: 'paused' })}>
            Restore Listing
          </SecondaryCTAButton>
        ) : null}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Listing Badges</p>
        <div className="flex flex-wrap gap-1">
          {(listing.badges ?? []).length === 0 ? (
            <span className="text-xs text-slate-500">No badges</span>
          ) : (
            (listing.badges ?? []).map((b) => (
              <span key={b} className="text-xs rounded-full px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-100">
                {b}
              </span>
            ))
          )}
        </div>
        {!badgeEdit ? (
          <SecondaryCTAButton className="text-sm py-2 !h-auto min-h-0" onClick={() => setBadgeEdit(true)}>
            Manage Badges
          </SecondaryCTAButton>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const on = badgeDraft.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      setBadgeDraft((prev) => (on ? prev.filter((x) => x !== b) : [...prev, b]))
                    }
                    className={`text-xs rounded-full px-2 py-1 border ${
                      on ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveBadges}
                className="text-sm rounded-lg px-3 py-1.5 bg-[#2563EB] text-white font-medium"
              >
                Save Badges
              </button>
              <GhostCTAButton
                className="text-sm py-1.5"
                onClick={() => {
                  setBadgeDraft([...(listing.badges ?? [])]);
                  setBadgeEdit(false);
                }}
              >
                Cancel
              </GhostCTAButton>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Featured Listing</p>
          <p className="text-xs text-slate-500 mt-1">
            {listing.featured
              ? 'This listing appears in featured sections.'
              : 'Enable to feature this listing prominently.'}
          </p>
        </div>
        <Switch checked={Boolean(listing.featured)} onCheckedChange={toggleFeatured} aria-label="Featured listing" />
      </div>

      {isMogzuDirectSource && resolved.kind === 'mogzu_direct' ? (
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ backgroundColor: 'var(--color-primary-highlight)' }}
        >
          <div className="flex items-center gap-2">
            <Star className="size-4 text-[#2563EB]" />
            <span className="text-sm font-semibold text-slate-800">Mogzu Direct Listing</span>
          </div>
          <p className="text-xs text-slate-600">
            Alias:{' '}
            {aliasEdit ? (
              <span className="inline-flex items-center gap-2">
                <input
                  value={aliasValue}
                  onChange={(e) => setAliasValue(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <button type="button" className="text-xs text-[#2563EB] font-semibold" onClick={saveAlias}>
                  Save
                </button>
              </span>
            ) : (
              <>
                <strong>{listing.mogzu_direct_alias ?? listing.title}</strong>{' '}
                <button type="button" className="text-[#2563EB] text-xs font-semibold" onClick={() => setAliasEdit(true)}>
                  Edit Alias
                </button>
              </>
            )}
          </p>
          <p className="text-xs text-slate-600">vendor_id: Mogzu Internal</p>
        </div>
      ) : null}

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Internal Notes</p>
        <p className="text-xs text-slate-500">Notes are only visible to Mogzu admins.</p>
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {(listing.internal_notes ?? []).map((n) => (
            <li key={n.id} className="text-sm border border-slate-100 rounded-lg p-2 bg-slate-50/80">
              <span className="text-xs text-slate-500">
                {n.author} · {new Date(n.at).toLocaleString()}
              </span>
              <p className="text-slate-800 mt-1 whitespace-pre-wrap">{n.text}</p>
            </li>
          ))}
        </ul>
        <textarea
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add an internal note..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <SecondaryCTAButton className="text-sm py-2 !h-auto min-h-0" onClick={addNote}>
          Save Note
        </SecondaryCTAButton>
      </div>

      {approveOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Approve this listing?</h3>
            <p className="font-semibold text-slate-800">{listing.title}</p>
            {[
              'Listing title is accurate and descriptive',
              'Description is complete (100+ words)',
              'At least 3 quality images uploaded',
              'Pricing information is correct',
              'Availability slots are configured',
              'Vendor information is verified',
            ].map((label, i) => (
              <label key={label} className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={approveChecks[i]}
                  onCheckedChange={(c) =>
                    setApproveChecks((prev) => {
                      const n = [...prev];
                      n[i] = c === true;
                      return n;
                    })
                  }
                />
                <span>{label}</span>
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <GhostCTAButton onClick={() => setApproveOpen(false)}>Cancel</GhostCTAButton>
              <button
                type="button"
                disabled={!approveChecks.every(Boolean)}
                onClick={handleApproveConfirm}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] disabled:opacity-50"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl space-y-3">
            <h3 className="text-lg font-semibold">Reject this listing</h3>
            <p className="font-semibold">{listing.title}</p>
            <label className="block text-sm font-medium">Rejection Reason</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="Incomplete Information">Incomplete Information</option>
              <option value="Policy Violation">Policy Violation</option>
              <option value="Pricing Issue">Pricing Issue</option>
              <option value="Low Quality Content">Low Quality Content</option>
              <option value="Duplicate Listing">Duplicate Listing</option>
              <option value="Incorrect Category">Incorrect Category</option>
              <option value="Missing Media">Missing Media</option>
              <option value="Other">Other</option>
            </select>
            <label className="block text-sm font-medium">Detailed Feedback</label>
            <textarea
              rows={4}
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="Provide specific feedback to help the vendor improve their listing..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500">{rejectFeedback.length} / 30 min</p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={notifyReject} onCheckedChange={(c) => setNotifyReject(c === true)} />
              Send rejection notification to vendor
            </label>
            <div className="flex justify-end gap-2">
              <GhostCTAButton onClick={() => setRejectOpen(false)}>Cancel</GhostCTAButton>
              <DestructiveCTAButton
                disabled={!rejectReason || rejectFeedback.trim().length < 30}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </DestructiveCTAButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
