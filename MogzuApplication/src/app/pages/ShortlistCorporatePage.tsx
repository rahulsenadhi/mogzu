import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MogzuLogo } from '@/app/components/branding/MogzuLogo';
import { MOGZU_DOMAIN_STORAGE_EVENT, SHORTLIST_PROPOSALS_KEY } from '@/app/lib/mogzuDomain';
import type { ShortlistProposal } from '@/app/lib/mogzuDomain';
import { loadShortlistProposals, saveShortlistProposals } from '@/app/lib/mogzuDomain';
import { ensureOrderFromShortlistSelection } from '@/app/lib/mogzuShortlistHelpers';

export default function ShortlistCorporatePage() {
  const navigate = useNavigate();
  const { token: tokenParam } = useParams<{ token: string }>();
  const token = tokenParam ? decodeURIComponent(tokenParam) : '';

  const [proposal, setProposal] = useState<ShortlistProposal | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const markedViewed = useRef(false);

  useEffect(() => {
    markedViewed.current = false;
  }, [token]);

  const reload = useCallback(() => {
    if (!token) {
      setProposal(null);
      setError('Invalid link.');
      return;
    }
    const list = loadShortlistProposals();
    const row = list.find((p) => p.proposal_token === token) ?? null;
    if (!row) {
      setProposal(null);
      setError('This shortlist link is not valid or has expired.');
      return;
    }
    setError('');
    setProposal(row);
    const pre = row.shortlisted_options.find((o) => o.corporate_selected);
    setSelectedId(pre?.id ?? null);
    if (row.status === 'selection_made') setDone(true);
    const exp = new Date(row.expires_at).getTime();
    if (Number.isFinite(exp) && Date.now() > exp) {
      setError('This proposal has expired. Please contact Mogzu for an updated link.');
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ key?: string }>).detail;
      if (d?.key === SHORTLIST_PROPOSALS_KEY) reload();
    };
    window.addEventListener(MOGZU_DOMAIN_STORAGE_EVENT, handler);
    return () => window.removeEventListener(MOGZU_DOMAIN_STORAGE_EVENT, handler);
  }, [reload]);

  useEffect(() => {
    if (!proposal || markedViewed.current) return;
    if (proposal.status !== 'sent') return;
    markedViewed.current = true;
    const all = loadShortlistProposals();
    const next = all.map((p) => (p.id === proposal.id ? { ...p, status: 'viewed' as const } : p));
    saveShortlistProposals(next);
    setProposal((prev) => (prev && prev.id === proposal.id ? { ...prev, status: 'viewed' } : prev));
  }, [proposal]);

  const canSelect = useMemo(() => proposal && proposal.shortlisted_options.length > 0 && !done && !error.includes('expired'), [proposal, done, error]);

  const confirm = () => {
    if (!proposal || !selectedId) return;
    const opt = proposal.shortlisted_options.find((o) => o.id === selectedId);
    if (!opt) return;
    const nextOptions = proposal.shortlisted_options.map((o) => ({
      ...o,
      corporate_selected: o.id === selectedId,
    }));
    const updated: ShortlistProposal = {
      ...proposal,
      shortlisted_options: nextOptions,
      status: 'selection_made',
    };
    const all = loadShortlistProposals();
    saveShortlistProposals(all.map((p) => (p.id === proposal.id ? updated : p)));
    ensureOrderFromShortlistSelection(updated);
    setProposal(updated);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-['Inter',system-ui,sans-serif] text-slate-800">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <MogzuLogo variant="wordmark" className="h-8 max-w-[140px]" />
          <button type="button" onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-blue-600 hover:underline">
            Corporate home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {!proposal && error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">{error}</div>
        ) : !proposal ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{proposal.title}</h1>
              {proposal.message ? <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{proposal.message}</p> : null}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                {proposal.budget > 0 ? <span>Budget: ₹{proposal.budget.toLocaleString('en-IN')}</span> : null}
                {proposal.event_date ? <span>Event: {proposal.event_date}</span> : null}
              </div>
            </div>

            {error.includes('expired') ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
            ) : null}

            {done ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
                Thank you — your selection is saved. Mogzu will follow up with next steps and payment details.
              </div>
            ) : null}

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Your options</h2>
              <ul className="space-y-4">
                {proposal.shortlisted_options.map((o) => (
                  <li
                    key={o.id}
                    className={`rounded-2xl border p-4 transition-shadow ${
                      selectedId === o.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 bg-white'
                    } ${o.is_recommended ? 'shadow-sm' : ''}`}
                  >
                    <label className={`flex gap-3 ${done ? 'cursor-default' : 'cursor-pointer'}`}>
                      {!done ? (
                        <input
                          type="radio"
                          name="shortlist-option"
                          className="mt-1"
                          checked={selectedId === o.id}
                          onChange={() => setSelectedId(o.id)}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{o.title}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {o.listing_type}
                          </span>
                          {o.is_recommended ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">Recommended</span>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-600">{o.description}</p>
                        {o.amenities.length ? (
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                            {o.amenities.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        ) : null}
                        {o.payment_summary.trim() ? (
                          <p className="text-xs text-slate-700">
                            <span className="font-semibold text-slate-800">Payment: </span>
                            {o.payment_summary}
                          </p>
                        ) : null}
                        {o.price > 0 ? (
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{o.price.toLocaleString('en-IN')} / {o.price_unit}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500">Pricing on request</p>
                        )}
                        {o.images[0] ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {o.images.slice(0, 4).map((src) => (
                              <img key={src} src={src} alt="" className="h-20 w-28 rounded-lg object-cover border border-slate-100" />
                            ))}
                          </div>
                        ) : null}
                        {o.portfolio_links.length ? (
                          <div className="text-xs">
                            <span className="font-medium text-slate-700">Portfolio: </span>
                            <ul className="mt-1 space-y-1">
                              {o.portfolio_links.map((url) => (
                                <li key={url}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {o.terms_and_conditions ? (
                          <details className="text-xs text-slate-600">
                            <summary className="cursor-pointer font-medium text-slate-700">Terms &amp; details</summary>
                            <p className="mt-2 whitespace-pre-wrap">{o.terms_and_conditions}</p>
                          </details>
                        ) : null}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            {canSelect && !done ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!selectedId}
                  onClick={confirm}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Confirm selection
                </button>
                <button type="button" onClick={() => navigate('/assistance')} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Questions? Mogzu Assistance
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
