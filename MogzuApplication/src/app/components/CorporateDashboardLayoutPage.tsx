import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { SharedHeader } from '@/app/components/layouts/SharedHeader';
import { SharedSidebar } from '@/app/components/layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from '@/app/components/layouts/MogzuCorporateScrollSurface';
import {
  DASHBOARD_WIDGET_META,
  getCorporateDashboardPreferences,
  setCorporateDashboardPreferences,
  type CorporateDashboardPreferences,
  type DashboardWidgetId,
} from '@/app/lib/corporateDashboardPreferences';

export default function CorporateDashboardLayoutPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [prefs, setPrefs] = useState<CorporateDashboardPreferences>(() => getCorporateDashboardPreferences());

  const persist = useCallback((next: CorporateDashboardPreferences) => {
    setPrefs(next);
    setCorporateDashboardPreferences(next);
  }, []);

  const toggle = (id: DashboardWidgetId) => {
    persist({ ...prefs, [id]: !prefs[id] });
  };

  const enableAll = () => {
    const next = { ...prefs };
    for (const { id } of DASHBOARD_WIDGET_META) {
      next[id] = true;
    }
    persist(next);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9] font-['Inter']">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <MogzuCorporateScrollSurface className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => navigate('/company-settings')}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#4379ee] hover:text-[#355ab8]"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              Back to company settings
            </button>

            <div className="mb-2 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#ebf1ff] text-[#4379ee]">
                <LayoutGrid className="size-6" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0e1e3f]">Dashboard layout</h1>
                <p className="text-sm text-slate-600">Choose what appears on your corporate home dashboard.</p>
              </div>
            </div>

            <p className="mb-6 text-sm text-slate-500">
              Toggle the orders &amp; deliveries hub and other sections to match how your team works—status chips, quick
              actions, and recent shipments sit alongside your existing Mogzu cards.
            </p>

            <button
              type="button"
              onClick={enableAll}
              className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Show all sections
            </button>

            <ul className="space-y-3">
              {DASHBOARD_WIDGET_META.map(({ id, label, description }) => (
                <li
                  key={id}
                  className="flex items-start gap-4 rounded-xl border border-slate-200/90 bg-white/90 p-4 shadow-sm"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={prefs[id]}
                      onChange={() => toggle(id)}
                      className="mt-1 size-4 rounded border-slate-300 text-[#4379ee] focus:ring-[#4379ee]"
                    />
                    <span>
                      <span className="block font-semibold text-[#0e1e3f]">{label}</span>
                      <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
