import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { VendorSideDrawer } from './VendorSideDrawer';
import {
  getChecklistForCategory,
  getReasonPillClass,
  type RejectionReasonCategory,
} from '@/app/lib/vendorRejectionChecklist';

export type VendorRejectionListing = {
  id: string;
  title: string;
  categoryLabel: string;
  coverUrl: string;
  submissionDate: string;
  rejectionDate: string;
  reasonCategory: RejectionReasonCategory;
  rejectionReason?: string;
  resubmission_notes?: string;
};

type VendorRejectionFeedbackDrawerProps = {
  open: boolean;
  onClose: () => void;
  listing: VendorRejectionListing | null;
  onEditResubmit: (listingId: string, notes: string) => void;
  onToast: (msg: string) => void;
};

const DEFAULT_REASON =
  "Your listing did not meet Mogzu's quality standards. Please review the checklist below and resubmit with the required improvements.";

export function VendorRejectionFeedbackDrawer({
  open,
  onClose,
  listing,
  onEditResubmit,
  onToast,
}: VendorRejectionFeedbackDrawerProps) {
  const [notes, setNotes] = useState('');
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');

  useEffect(() => {
    if (open && listing) setNotes(listing.resubmission_notes ?? '');
  }, [open, listing]);

  if (!open || !listing) return null;

  const checklist = getChecklistForCategory(listing.reasonCategory);
  const reasonText = listing.rejectionReason?.trim() || DEFAULT_REASON;
  const len = notes.length;
  const counterClass =
    len >= 500 ? 'text-red-600' : len >= 400 ? 'text-amber-600' : 'text-slate-400';

  const handleResubmit = () => {
    const trimmed = notes.slice(0, 500);
    onEditResubmit(listing.id, trimmed);
    onClose();
    onToast('Make your changes and resubmit for review when ready.');
  };

  return (
    <>
      <VendorSideDrawer
        open={open}
        onClose={onClose}
        desktopWidthPx={480}
        panelId="vendor-rejection-drawer"
        title="Listing Review Feedback"
        subtitle={`Reviewed on ${listing.rejectionDate}`}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="order-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:order-1"
            >
              Contact Support
            </button>
            <button
              type="button"
              onClick={handleResubmit}
              className="order-1 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:order-2"
            >
              Edit & Resubmit
            </button>
          </div>
        }
      >
        <div className="space-y-0 px-4 py-4 sm:px-5">
          <div className="flex gap-3">
            <img
              src={listing.coverUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-[10px] object-cover"
              width={56}
              height={56}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug text-slate-900">{listing.title}</p>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {listing.categoryLabel}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800">Rejected</span>
            <span className="text-xs text-slate-500">Submitted {listing.submissionDate}</span>
          </div>

          <hr className="my-4 border-slate-200" />

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Reason for Rejection</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${getReasonPillClass(listing.reasonCategory)}`}
            >
              {listing.reasonCategory}
            </span>
            <div className="mt-3 rounded-[10px] border border-amber-100 bg-amber-50/90 p-4 text-sm leading-relaxed text-slate-900">
              {reasonText}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-slate-500">Required Fixes</p>
            <div className="mt-2 flex flex-col gap-2">
              {checklist.map((row) => (
                <div
                  key={row.text}
                  className={`flex items-start gap-2 rounded-[10px] px-4 py-3 ${
                    row.ok ? 'bg-transparent' : 'bg-red-50/40'
                  }`}
                >
                  {row.ok ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
                  )}
                  <span className={`text-sm ${row.ok ? 'text-slate-500' : 'text-slate-900'}`}>{row.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <BookOpen className="h-6 w-6 shrink-0 text-[#2563eb]" aria-hidden />
              <div>
                <p className="text-sm text-slate-800">Review Mogzu&apos;s listing quality guidelines to avoid future rejections.</p>
                <button
                  type="button"
                  onClick={() => setGuidelinesOpen(true)}
                  className="mt-2 text-sm font-semibold text-[#2563eb] hover:underline"
                >
                  View Guidelines →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-800">Notes to Reviewer (Optional)</label>
            <p className="mt-0.5 text-xs text-slate-500">Let the Mogzu team know what you changed before resubmitting.</p>
            <div className="relative mt-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Describe the changes you made in response to the feedback..."
                className="w-full resize-none rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
              <span className={`pointer-events-none absolute bottom-2 right-2 text-[11px] ${counterClass}`}>
                {len} / 500
              </span>
            </div>
          </div>
        </div>
      </VendorSideDrawer>

      {guidelinesOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Listing quality guidelines</h3>
            <p className="mt-2 text-sm text-slate-600">
              Use clear titles, accurate pricing, high-quality photos, and complete descriptions. Avoid placeholder text and ensure your
              listing complies with Mogzu content policies.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-[#2563eb] py-2 text-sm font-semibold text-white"
              onClick={() => setGuidelinesOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {supportOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4" role="dialog">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Need help with this rejection?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Subject: Help with rejected listing: {listing.title}
            </p>
            <label className="mt-3 block text-sm font-medium text-slate-800">Message</label>
            <textarea
              value={supportMsg}
              onChange={(e) => setSupportMsg(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Describe your question…"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setSupportOpen(false);
                  setSupportMsg('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!supportMsg.trim()}
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={() => {
                  setSupportOpen(false);
                  setSupportMsg('');
                  onToast("Message sent. We'll reply within 24 hours.");
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
