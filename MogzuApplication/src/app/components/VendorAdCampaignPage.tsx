import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, HelpCircle, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { VendorAppShell } from './layouts/VendorAppShell';
import { VendorTopRightMenu } from './layouts/VendorTopRightMenu';

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter plan',
    price: '₹4999/-',
    headerClass: 'bg-amber-50 border-amber-100',
    features: ['Targeting 1000 customers', '500 clicks', '50 keywords', '2 posts'],
  },
  {
    id: 'growth' as const,
    name: 'Growth plan',
    price: '₹10999/-',
    headerClass: 'bg-sky-50 border-sky-100',
    features: ['Targeting 5000 customers', '2000 clicks', '100 keywords', '6 posts'],
  },
  {
    id: 'scale' as const,
    name: 'Scale plan',
    price: '₹15999/-',
    headerClass: 'bg-orange-50 border-orange-100',
    features: ['Targeting 10000+ customers', '5000+ clicks', '150+ keywords', '10 posts'],
  },
];

export default function VendorAdCampaignPage() {
  const navigate = useNavigate();
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  return (
    <VendorAppShell
      activeNav="promotion"
      routeSource="vendor-ad-campaign"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search…"
            className="h-10 border-slate-200 bg-slate-50/80 pl-9 text-sm leading-normal focus:bg-white"
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
                state: { source: 'vendor-ad-campaign-header', channel: 'notifications' },
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
      <main className="min-h-full w-full bg-transparent text-slate-900">
        <div className="content-container max-w-none py-6 sm:py-8">
            {uiNotice ? (
              <p
                className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm leading-normal text-blue-700"
                role="status"
              >
                {uiNotice}
              </p>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/vendor/promotions')}
              className="mb-6 h-auto px-0 text-muted-foreground hover:bg-transparent hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Ad campaign
            </Button>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="card-hover gap-0 overflow-hidden py-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`border-b border-border px-6 py-6 ${plan.headerClass}`}>
                    <h2 className="font-[Montserrat,sans-serif] text-base font-medium leading-normal tracking-normal text-foreground">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-2xl font-medium leading-normal tracking-normal text-foreground">
                      {plan.price}
                    </p>
                  </div>
                  <CardContent className="px-6 py-6 pt-4 [&:last-child]:pb-6">
                    <ul className="flex flex-1 list-disc flex-col gap-2 pl-4 text-sm font-normal leading-normal text-muted-foreground marker:text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f} className="pl-1">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch border-0 px-6 pb-6 pt-0">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() =>
                        navigate(`/vendor/promotions/offer?plan=${plan.id}`)
                      }
                    >
                      Select plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </div>
      </main>
    </VendorAppShell>
  );
}
