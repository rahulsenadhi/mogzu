import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import {
  DEFAULT_SUB_KEYS,
  getDefaultPlatformMarketplaceSettings,
  getPlatformMarketplaceSettings,
  getSubGateLabel,
  type ListingGate,
  type MarketplaceModuleKey,
  type PlatformMarketplaceSettings,
  setPlatformMarketplaceSettings,
  subscribePlatformMarketplaceSettings,
} from '@/app/lib/platformMarketplaceSettings';

const MODULE_LABELS: Record<MarketplaceModuleKey, string> = {
  gifting: 'Gifting',
  events: 'Events',
  dSpace: 'D Space',
  heyGenie: 'Hey Genie',
};

function GateRow({
  label,
  gate,
  onChange,
}: {
  label: string;
  gate: ListingGate;
  onChange: (next: ListingGate) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
      <div className="font-medium text-slate-800">{label}</div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={gate.enabled}
          onChange={(e) => onChange({ ...gate, enabled: e.target.checked })}
          className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
        />
        Enabled
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        <span>Min vendors (listing)</span>
        <input
          type="number"
          min={0}
          value={gate.minVendorsForListing}
          onChange={(e) =>
            onChange({ ...gate, minVendorsForListing: Math.max(0, Number(e.target.value) || 0) })
          }
          className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-800 sm:w-24"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        <span>Active count (demo)</span>
        <input
          type="number"
          min={0}
          value={gate.activeVendorCount}
          onChange={(e) =>
            onChange({ ...gate, activeVendorCount: Math.max(0, Number(e.target.value) || 0) })
          }
          className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-800 sm:w-24"
        />
      </label>
    </div>
  );
}

export default function AdminPlatformModulesPage() {
  const [settings, setSettings] = useState<PlatformMarketplaceSettings>(() => getPlatformMarketplaceSettings());
  const [subOpen, setSubOpen] = useState(true);

  useEffect(() => subscribePlatformMarketplaceSettings(setSettings), []);

  const persist = useCallback((next: PlatformMarketplaceSettings) => {
    setSettings(next);
    setPlatformMarketplaceSettings(next);
  }, []);

  const moduleKeys = useMemo(() => Object.keys(MODULE_LABELS) as MarketplaceModuleKey[], []);

  const updateModule = (key: MarketplaceModuleKey, gate: ListingGate) => {
    persist({
      ...settings,
      modules: { ...settings.modules, [key]: gate },
    });
  };

  const updateSub = (id: string, gate: ListingGate) => {
    persist({
      ...settings,
      subGates: { ...settings.subGates, [id]: gate },
    });
  };

  const resetDefaults = () => {
    const fresh = getDefaultPlatformMarketplaceSettings();
    persist(fresh);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[#0e1e3f]">
            <Layers className="size-6 text-[#2563EB]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Platform modules &amp; listings</h1>
          </div>
          <p className="text-sm text-slate-600">
            Turn corporate marketplace modules on or off and simulate vendor depth. Counts are demo-only until wired to
            your vendor registry.
          </p>
        </div>
        <button
          type="button"
          onClick={resetDefaults}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Reset defaults
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Modules</h2>
        {moduleKeys.map((key) => (
          <GateRow
            key={key}
            label={MODULE_LABELS[key]}
            gate={settings.modules[key]}
            onChange={(g) => updateModule(key, g)}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white/60 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setSubOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-white/80"
        >
          Sub-category listing gates
          <ChevronDown className={`size-5 text-slate-400 transition-transform ${subOpen ? 'rotate-0' : '-rotate-90'}`} />
        </button>
        {subOpen ? (
          <div className="space-y-3 border-t border-slate-100 p-4 pt-3">
            {(DEFAULT_SUB_KEYS as readonly string[]).map((id) => (
              <GateRow
                key={id}
                label={getSubGateLabel(id)}
                gate={settings.subGates[id] ?? getDefaultPlatformMarketplaceSettings().subGates[id]}
                onChange={(g) => updateSub(id, g)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
