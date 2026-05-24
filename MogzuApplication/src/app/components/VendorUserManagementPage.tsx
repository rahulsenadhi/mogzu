import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Loader2, MoreHorizontal, Search } from 'lucide-react';
import { VendorAppShell } from './layouts/VendorAppShell';
import { DevMockDataBanner } from './global/DevMockDataBanner';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { UserProfile } from '@/lib/database.types';

type VendorTeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Staff';
  lastActive: string;
  status: 'Active' | 'Invited' | 'Deactivated';
};

const DEMO_VENDOR_TEAM: VendorTeamMember[] = [
  {
    id: 'v1',
    name: 'Store owner',
    email: 'owner@yourstore.example',
    role: 'Owner',
    lastActive: 'Now',
    status: 'Active',
  },
  {
    id: 'v2',
    name: 'Operations lead',
    email: 'ops@yourstore.example',
    role: 'Admin',
    lastActive: '2h ago',
    status: 'Active',
  },
  {
    id: 'v3',
    name: 'Fulfillment staff',
    email: 'fulfill@yourstore.example',
    role: 'Staff',
    lastActive: 'Yesterday',
    status: 'Active',
  },
  {
    id: 'v4',
    name: 'Invited teammate',
    email: 'pending@yourstore.example',
    role: 'Staff',
    lastActive: '—',
    status: 'Invited',
  },
];

function teamStatusStyle(s: VendorTeamMember['status']) {
  if (s === 'Active') return 'bg-emerald-100 text-emerald-800';
  if (s === 'Invited') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-600';
}

function formatLastActive(updatedAt?: string | null): string {
  if (!updatedAt) return '—';
  const then = new Date(updatedAt).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 2) return 'Now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function mapProfileRole(p: UserProfile, ownerUserId?: string | null): VendorTeamMember['role'] {
  if (ownerUserId && p.id === ownerUserId) return 'Owner';
  if (p.role === 'vendor') return 'Staff';
  return 'Staff';
}

function adaptProfile(p: UserProfile, ownerUserId?: string | null): VendorTeamMember {
  const status: VendorTeamMember['status'] =
    p.status === 'deactivated'
      ? 'Deactivated'
      : p.status === 'invited'
        ? 'Invited'
        : 'Active';

  return {
    id: p.id,
    name: p.full_name?.trim() || p.email?.split('@')[0] || 'Team member',
    email: p.phone?.trim() || `user-${p.id.slice(0, 8)}`,
    role: mapProfileRole(p, ownerUserId),
    lastActive: formatLastActive(p.updated_at),
    status,
  };
}

export default function VendorUserManagementPage() {
  const { vendorId, user } = useAuth();
  const [search, setSearch] = useState('');
  const [uiNotice, setUiNotice] = useState<string | null>(null);
  const [team, setTeam] = useState<VendorTeamMember[]>(DEMO_VENDOR_TEAM);
  const [usingDemo, setUsingDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    if (!vendorId) {
      setTeam(DEMO_VENDOR_TEAM);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [{ data: profiles, error: profilesError }, { data: vendorRow }] = await Promise.all([
      db.userProfiles.listByVendor(vendorId),
      db.vendors.getById(vendorId),
    ]);

    if (profilesError || !profiles?.length) {
      setTeam(DEMO_VENDOR_TEAM);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    const ownerUserId = vendorRow?.user_id ?? user?.id ?? null;
    setTeam(profiles.map((p) => adaptProfile(p, ownerUserId)));
    setUsingDemo(false);
    setLoading(false);
  }, [vendorId, user?.id]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const filteredTeam = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return team;
    return team.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q),
    );
  }, [search, team]);

  return (
    <VendorAppShell
      activeNav="users"
      routeSource="vendor-users"
      onNavNotice={(msg) => setUiNotice(msg)}
      headerSearch={
        <>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      }
    >
      <main className="min-h-full w-full bg-transparent">
        <div className="p-4 sm:p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {usingDemo ? <DevMockDataBanner /> : null}
              {uiNotice ? (
                <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {uiNotice}
                </p>
              ) : null}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Vendor team</h1>
                  <p className="text-sm text-slate-500">
                    People with access to this partner account — orders, listings, and payouts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUiNotice('User invitation flow will be available once invite email setup is enabled.')}
                  className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Invite user
                </button>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setUiNotice('User filters will be available once advanced filtering is enabled.')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                  </button>
                  <button
                    type="button"
                    onClick={() => setUiNotice('Export will be available once report export is enabled.')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Export
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
                        <th className="pb-3 pr-3">Name</th>
                        <th className="pb-3 pr-3">Email</th>
                        <th className="pb-3 pr-3">Role</th>
                        <th className="pb-3 pr-3">Status</th>
                        <th className="pb-3 pr-3">Last active</th>
                        <th className="pb-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                            No team members match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredTeam.map((m) => (
                          <tr key={m.id} className="border-b border-slate-50 text-slate-700">
                            <td className="py-3 pr-3 font-medium text-slate-900">{m.name}</td>
                            <td className="py-3 pr-3 text-slate-500">{m.email}</td>
                            <td className="py-3 pr-3 text-slate-600">{m.role}</td>
                            <td className="py-3 pr-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${teamStatusStyle(m.status)}`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 pr-3">{m.lastActive}</td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => setUiNotice(`Role and access for ${m.name} will be editable in a future release.`)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100"
                                aria-label={`More actions for ${m.name}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
        </div>
      </main>
    </VendorAppShell>
  );
}
