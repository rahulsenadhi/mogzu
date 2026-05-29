import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { isBookingHandoffPayload, type BookingHandoffPayload } from '@/app/types/bookingHandoff';
import { useBookingDraft } from '@/app/lib/bookingDraft';
import { useAuth } from '@/lib/auth';
import { submitBookingDraftToSupabase } from '@/app/lib/submitBookingDraftToSupabase';

function formatInr(n: number): string {
  return `Rs ${Math.max(0, Math.round(n)).toLocaleString('en-IN')}`;
}

export default function BookingSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingDraft, setDraftPartial, setContactField, clearDraft } = useBookingDraft();
  const { profile, corporateId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payload = (location.state as { booking?: unknown } | null)?.booking;
  const booking: BookingHandoffPayload | null = useMemo(
    () => (isBookingHandoffPayload(payload) ? payload : null),
    [payload],
  );

  const [fullName, setFullName] = useState(bookingDraft.contact.full_name);
  const [email, setEmail] = useState(bookingDraft.contact.work_email);
  const [phone, setPhone] = useState(bookingDraft.contact.phone);
  const [company, setCompany] = useState(bookingDraft.contact.company_name);
  const [specialInstructions, setSpecialInstructions] = useState(bookingDraft.contact.special_instructions);

  useEffect(() => {
    if (!booking && bookingDraft.listing) return;
    if (booking) {
      setDraftPartial({
        selected_date: booking.selected_date ?? null,
        selected_slot: booking.selected_slot
          ? (() => {
              const [start_time, end_time] = booking.selected_slot.split('-')
              return { start_time: start_time ?? '', end_time: end_time ?? '', slots_available: 12 }
            })()
          : null,
        group_size: booking.group_size,
        duration: booking.duration,
      })
    }
  }, [booking, bookingDraft.listing, setDraftPartial]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Valid work email is required.';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) next.phone = 'Valid phone number is required.';
    if (!company.trim()) next.company = 'Company name is required.';
    if (!agreed) next.agreed = 'Please accept the terms to continue.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const order = ['fullName', 'email', 'phone', 'company', 'agreed'] as const;
      window.setTimeout(() => {
        for (const k of order) {
          if (next[k]) {
            document.getElementById(`booking-field-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }, 50);
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!bookingDraft.listing) return;
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');

    const contactNote = [
      `Contact: ${fullName.trim()} (${email.trim()}, ${phone.trim()})`,
      `Company: ${company.trim()}`,
      specialInstructions.trim() ? `Notes: ${specialInstructions.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    let supabaseBookingId: string | null = null;
    if (corporateId && profile?.id) {
      const result = await submitBookingDraftToSupabase(
        {
          ...bookingDraft,
          contact: {
            full_name: fullName.trim(),
            work_email: email.trim(),
            phone: phone.trim(),
            company_name: company.trim(),
            special_instructions: specialInstructions.trim(),
          },
        },
        { corporateId, userId: profile.id, contactNote },
      );
      if (result.error && !result.usedDemo) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }
      supabaseBookingId = result.bookingId;
      if (result.bookingId && result.requiresApproval) {
        setSubmitting(false);
        navigate(
          `/booking-approval-request?bookingId=${encodeURIComponent(result.bookingId)}`,
          {
            state: {
              category: 'activity',
              venueName: bookingDraft.listing?.title,
              totalAmount: bookingDraft.calculated.grand_total,
              bookingId: result.bookingId,
            },
          },
        );
        return;
      }
    }

    setSubmitSuccess(true);
    await new Promise((r) => window.setTimeout(r, 400));
    const now = new Date();
    const ref =
      supabaseBookingId?.slice(0, 8).toUpperCase() ??
      `#MGZ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setDraftPartial({
      contact: {
        full_name: fullName.trim(),
        work_email: email.trim(),
        phone: phone.trim(),
        company_name: company.trim(),
        special_instructions: specialInstructions.trim(),
      },
      agreement_checked: agreed,
      booking_reference: ref,
      status: 'submitted',
      submitted_at: now.toISOString(),
    });
    navigate(
      supabaseBookingId
        ? `/booking-confirmation?bookingId=${encodeURIComponent(supabaseBookingId)}`
        : '/booking-confirmation',
      { state: supabaseBookingId ? { bookingId: supabaseBookingId } : undefined },
    );
    setSubmitting(false);
    setSubmitSuccess(false);
  };

  if (!bookingDraft.listing) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
        <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <MogzuCorporateScrollSurface>
            <div className="mx-auto max-w-lg px-6 py-16 text-center">
              <h1 className="text-xl font-bold text-slate-900">No booking in progress</h1>
              <p className="mt-2 text-sm text-slate-600">Start from a listing to review pricing and dates, then return here.</p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => navigate('/event-activity')}
              >
                Browse activities
              </button>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  const pt = booking.pricing_type;
  const showTransparentBreakdown = pt === 'transparent' && booking.grand_total != null;
  const showOfferBreakdown = pt === 'offer_price' && booking.grand_total != null;
  const showRequestCopy = pt === 'request_for_price';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search events..." />
        <MogzuCorporateScrollSurface>
          <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12 py-8 corp-page-enter">
            <button
              type="button"
              onClick={() => {
                clearDraft()
                navigate('/event-activity')
              }}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {submitError ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <div className="order-2 space-y-6 lg:order-1">
                <div>
                  <h1 className="corp-h1 text-slate-900">Booking summary</h1>
                  <p className="mt-2 corp-body text-slate-500">Review selections and add contact details for the vendor.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 corp-soft-shadow">
                  <h2 className="corp-h3 text-slate-900">Contact</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div id="booking-field-fullName" className={`corp-floating-field ${fullName ? 'has-value' : ''}`}>
                      <label>Full name</label>
                      <input
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          setContactField('full_name', e.target.value)
                        }}
                      />
                      {errors.fullName ? <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p> : null}
                    </div>
                    <div id="booking-field-email" className={`corp-floating-field ${email ? 'has-value' : ''}`}>
                      <label>Work email</label>
                      <input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setContactField('work_email', e.target.value)
                        }}
                        type="email"
                      />
                      {errors.email ? <p className="mt-1 text-[11px] text-red-600">{errors.email}</p> : null}
                    </div>
                    <div id="booking-field-phone" className={`corp-floating-field ${phone ? 'has-value' : ''}`}>
                      <label>Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          setContactField('phone', e.target.value)
                        }}
                      />
                      {errors.phone ? <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p> : null}
                    </div>
                    <div id="booking-field-company" className={`corp-floating-field ${company ? 'has-value' : ''}`}>
                      <label>Company</label>
                      <input
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value)
                          setContactField('company_name', e.target.value)
                        }}
                      />
                      {errors.company ? <p className="mt-1 text-[11px] text-red-600">{errors.company}</p> : null}
                    </div>
                    <div className={`sm:col-span-2 corp-floating-field ${specialInstructions ? 'has-value' : ''}`}>
                      <label>Special instructions</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => {
                          setSpecialInstructions(e.target.value)
                          setContactField('special_instructions', e.target.value)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <label
                  id="booking-field-agreed"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${errors.agreed ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked)
                      setDraftPartial({ agreement_checked: e.target.checked })
                    }}
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-700">
                    I agree to Mogzu&apos;s booking terms and confirm this request is authorized by my organisation.
                  </span>
                </label>
                {errors.agreed ? <p className="text-[11px] text-red-600">{errors.agreed}</p> : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(`/event-activity/${encodeURIComponent(String((bookingDraft.listing as { id?: string }).id ?? '1'))}`)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-all duration-150"
                  >
                    ← Edit your selections <span className="text-xs italic text-slate-500">(your details won&apos;t be lost)</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting || !agreed}
                    onClick={handleConfirm}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ${
                      submitSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:bg-slate-300`}
                  >
                    {submitSuccess ? 'Sent! ✓' : bookingDraft.pricing_type === 'offer_price' ? 'Confirm & Send Offer' : 'Confirm & Send Booking Request'}
                  </button>
                </div>
              </div>

              <aside className="order-1 lg:order-2">
                <div className="sticky top-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex gap-3">
                    {(bookingDraft.listing as { image?: string }).image ? (
                      <img src={(bookingDraft.listing as { image?: string }).image} alt="" className="h-16 w-20 rounded-lg object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listing</p>
                      <p className="line-clamp-2 font-semibold text-slate-900">{String((bookingDraft.listing as { title?: string; name?: string }).title ?? (bookingDraft.listing as { name?: string }).name ?? '')}</p>
                      {(bookingDraft.listing as { city?: string }).city ? <p className="text-xs text-slate-500">{(bookingDraft.listing as { city?: string }).city}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span>Group size</span>
                      <span className="font-medium">{bookingDraft.group_size ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-medium">{bookingDraft.duration ?? '-'}</span>
                    </div>
                    {bookingDraft.selected_date ? (
                      <div className="flex justify-between">
                        <span>Date</span>
                        <span className="font-medium">{bookingDraft.selected_date}</span>
                      </div>
                    ) : null}
                    {bookingDraft.selected_slot ? (
                      <div className="flex justify-between">
                        <span>Slot</span>
                        <span className="font-medium">{bookingDraft.selected_slot.start_time} - {bookingDraft.selected_slot.end_time}</span>
                      </div>
                    ) : null}
                    {bookingDraft.selected_addons.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Add-ons</p>
                        <p className="text-sm">{bookingDraft.selected_addons.map((a) => a.name).join(', ')}</p>
                      </div>
                    ) : null}
                  </div>

                  {bookingDraft.pricing_type === 'transparent' ? (
                    <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex justify-between text-slate-700">
                        <span>Base + add-ons</span>
                        <span>{formatInr((bookingDraft.calculated.base_subtotal ?? 0) + (bookingDraft.calculated.addons_total ?? 0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Platform fee (5%)</span>
                        <span>{formatInr(bookingDraft.calculated.platform_fee ?? 0)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-blue-600">
                        <span>Total</span>
                        <span>{formatInr(bookingDraft.calculated.grand_total ?? 0)}</span>
                      </div>
                    </div>
                  ) : null}

                  {bookingDraft.pricing_type === 'offer_price' ? (
                    <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                      <p className="text-xs font-semibold text-amber-800">Offer pricing</p>
                      <div className="flex justify-between text-slate-700">
                        <span>Estimated total</span>
                        <span>{formatInr(bookingDraft.calculated.grand_total ?? 0)}</span>
                      </div>
                      {bookingDraft.offer_amount ? (
                        <p className="text-xs text-slate-500">Offer amount Rs {bookingDraft.offer_amount.toLocaleString('en-IN')} — subject to vendor acceptance.</p>
                      ) : null}
                    </div>
                  ) : null}

                  {bookingDraft.pricing_type === 'request_for_price' ? (
                    <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                      <p className="text-xs font-semibold text-slate-800">Request for price</p>
                      {bookingDraft.request_data ? (
                        <>
                          <p className="text-xs">Preferred date: {bookingDraft.request_data.preferred_date}</p>
                          <p className="text-xs line-clamp-4">{bookingDraft.request_data.requirements}</p>
                        </>
                      ) : (
                        <p className="text-xs">Vendor will respond with a tailored quote.</p>
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Your details are shared only with this vendor and Mogzu for fulfilment.</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
