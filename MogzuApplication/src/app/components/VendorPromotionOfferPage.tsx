import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Bell, Bold, HelpCircle, ImageIcon, Italic, Link2, List, ListOrdered, Search } from 'lucide-react';
import imgMeetingThumb from 'figma:asset/f6108faddc403caf1eea34c754f31b43ab0fb55b.png';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';
import {
  getVendorPromoAdById,
  upsertVendorPromoAd,
  type VendorPromoAd,
} from '@/app/lib/vendorPromotionAdsStorage';
import { MogzuLegacyDemoBanner } from '@/app/components/ui/MogzuLegacyDemoBanner';

type CallCta = 'view' | 'quote' | 'connect';

const callLabels: Record<CallCta, string> = {
  view: 'VIEW OFFER',
  quote: 'REQUEST QUOTE',
  connect: 'CONNECT NOW',
};

export default function VendorPromotionOfferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = (searchParams.get('plan') || 'starter') as VendorPromoAd['plan'];
  const adIdParam = searchParams.get('adId');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState('Special offer on Meeting space');
  const [description, setDescription] = useState(
    'Book your next event with us and choose from a variety of tailored packages designed for teams of every size.'
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [productsForOffer, setProductsForOffer] = useState(true);
  const [showCallButton, setShowCallButton] = useState(true);
  const [callCta, setCallCta] = useState<CallCta>('view');
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const applyLoadedAd = useCallback((ad: VendorPromoAd) => {
    setHeadline(ad.headline);
    setDescription(ad.description);
    setBannerPreview(ad.imageDataUrl ?? null);
    if (ad.plan) {
      /* plan from URL preferred on load */
    }
  }, []);

  useEffect(() => {
    if (!adIdParam) return;
    const existing = getVendorPromoAdById(adIdParam);
    if (existing) applyLoadedAd(existing);
  }, [adIdParam, applyLoadedAd]);

  const onBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setBannerPreview(url);
  };

  const previewSnippet =
    description.length > 120 ? `${description.slice(0, 120)}…` : description;

  const handleBack = () => {
    if (adIdParam) navigate('/vendor/promotions-live');
    else navigate('/vendor/promotions/ad-campaign');
  };

  const handleNext = async () => {
    const id = adIdParam || `ad-${Date.now()}`;
    const existing = adIdParam ? getVendorPromoAdById(adIdParam) : undefined;
    const plan: VendorPromoAd['plan'] =
      planParam === 'growth' || planParam === 'scale' || planParam === 'starter' ? planParam : 'starter';

    let imageDataUrl = existing?.imageDataUrl;
    if (bannerPreview?.startsWith('data:')) {
      imageDataUrl = bannerPreview;
    } else if (bannerPreview?.startsWith('blob:')) {
      try {
        const blob = await fetch(bannerPreview).then((r) => r.blob());
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        });
      } catch {
        /* keep existing */
      }
    }

    const ad: VendorPromoAd = {
      id,
      headline: headline.trim() || 'Untitled ad',
      description: description.trim() || '',
      impressions: existing?.impressions ?? 0,
      clicks: existing?.clicks ?? 0,
      contacts: existing?.contacts ?? 0,
      status: existing?.status ?? 'Active',
      plan,
      imageDataUrl,
    };
    upsertVendorPromoAd(ad);
    navigate('/vendor/promotions-live');
  };

  const previewImage = bannerPreview || imgMeetingThumb;

  return (
    <VendorAppShell
      activeNav="promotion"
      routeSource="vendor-promotion-offer"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
      headerEnd={
        <>
          <button
            type="button"
            onClick={() => setUiNotice('Help docs will be available in a future release.')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Open communication and notifications"
            onClick={() =>
              navigate('/vendor/communication', {
                state: { source: 'vendor-promotion-offer-header', channel: 'notifications' },
              })
            }
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
              12
            </span>
          </button>
          <VendorTopRightMenu />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        <div className="p-4 sm:p-6">
            {uiNotice ? (
              <p className="mx-auto mb-4 max-w-3xl rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {uiNotice}
              </p>
            ) : null}
            <MogzuLegacyDemoBanner className="mx-auto mb-4 max-w-3xl" />
            <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <h1 className="mb-6 text-lg font-semibold text-slate-900">Offer on specific product</h1>

              <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold text-slate-800">Ad preview</h2>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="flex min-h-[140px] flex-col sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center bg-[#2563EB] p-4 text-white">
                      <p className="text-sm font-semibold sm:text-base">{headline || 'Add headline'}</p>
                      <p className="mt-1 text-xs text-blue-100">By BK group</p>
                      <p className="mt-2 line-clamp-3 text-xs text-blue-50">{previewSnippet || 'Add description'}</p>
                      {showCallButton && (
                        <button
                          type="button"
                          onClick={() => setUiNotice('Preview call-to-action button behavior will be available in live ad preview mode.')}
                          className="mt-3 w-fit rounded bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#2563EB]"
                        >
                          {callLabels[callCta]}
                        </button>
                      )}
                    </div>
                    <div className="relative h-36 sm:h-auto sm:w-[42%]">
                      <img src={previewImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-slate-800">Write your ad</h2>
                <label className="block text-xs font-medium text-slate-600">Headline</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Add headline"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <label className="mt-4 block text-xs font-medium text-slate-600">Description</label>
                <div className="mt-1 overflow-hidden rounded-md border border-slate-200">
                  <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
                    <button type="button" onClick={() => setUiNotice('Rich text formatting will be available in a future release.')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/80" title="Bold">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('Rich text formatting will be available in a future release.')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/80" title="Italic">
                      <Italic className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('Link support will be available in a future release.')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/80" title="Link">
                      <Link2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('List formatting will be available in a future release.')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/80" title="Bullet list">
                      <List className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setUiNotice('Ordered list formatting will be available in a future release.')} className="rounded p-1.5 text-slate-500 hover:bg-slate-200/80" title="Numbered list">
                      <ListOrdered className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add description"
                    rows={5}
                    className="w-full resize-y border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                  />
                </div>
              </section>

              <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-slate-800">Add banner image</h2>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onBannerChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-sm text-slate-500 transition hover:border-[#2563EB]/40 hover:bg-slate-50"
                >
                  <ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
                  Click to add image or drag and drop file here
                </button>
              </section>

              <section className="mb-6 space-y-4">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={productsForOffer}
                    onChange={(e) => setProductsForOffer(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-slate-800">Select products for offer</span>
                </label>
                {productsForOffer && (
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/products')}
                    className="text-sm font-medium text-[#2563EB] hover:underline"
                  >
                    Select products
                  </button>
                )}

                <div>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={showCallButton}
                      onChange={(e) => setShowCallButton(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-sm text-slate-800">Show a call button in your ad</span>
                  </label>
                  {showCallButton && (
                    <div className="ml-6 mt-3 space-y-2">
                      {(['view', 'quote', 'connect'] as CallCta[]).map((key) => (
                        <label key={key} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="callCta"
                            checked={callCta === key}
                            onChange={() => setCallCta(key)}
                            className="border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <span className="text-sm text-slate-700">
                            {key === 'view' && 'View offer'}
                            {key === 'quote' && 'Request quote'}
                            {key === 'connect' && 'Connect now'}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-md border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
        </div>
      </main>
    </VendorAppShell>
  );
}
